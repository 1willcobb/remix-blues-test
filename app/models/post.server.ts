import type { Post } from "@prisma/client";

import { prisma } from "~/db.server"; // Ensure this path is correct


export async function getUserFeed(userId: string, page: number = 1, pageSize: number = 10): Promise<Post[]> {
  // Get the list of userIds that the current user is following
  const followedUsers = await prisma.userFollow.findMany({
    where: { followerId: userId },
    select: { followedId: true },
  });

  const followedUserIds = followedUsers.map((follow) => follow.followedId);

  // Calculate how many records to skip based on the current page
  const skip = (page - 1) * pageSize;

  // Get the posts from those followed users with pagination
  const feedPosts = await prisma.post.findMany({
    where: {
      userId: {
        in: followedUserIds,
      },
    },
    orderBy: {
      createdAt: "asc", // Sort posts chronologically (most recent first)
    },
    include: {
      user: true,
      comments: true,
      likes: true,
      votes: true,
    },
    skip: skip, // Skip records for pagination
    take: pageSize, // Take the specified number of records
  });

  return feedPosts;
}

export async function createPost({
  content,
  imageUrl,
  userId,
}: {
  content: string;
  imageUrl?: string;
  userId: string;
}): Promise<Post> {
  const post = await prisma.post.create({
    data: {
      content,
      imageUrl,
      user: {
        connect: { id: userId },
      },
    },
    include: {
      user: true,
      comments: true,
      likes: true,
      votes: true,
    },
  });

  // Increment postCount for the user
  await prisma.user.update({
    where: { id: userId },
    data: { postCount: { increment: 1 } },
  });

  return post;
}

export async function getUserPosts(userId: string, page: number = 1, pageSize: number = 10): Promise<Post[]> {
  const skip = (page - 1) * pageSize;

  const posts = await prisma.post.findMany({
    where: {
      userId: userId, // Filter posts by the specific user
    },
    orderBy: {
      createdAt: "asc", // Sort posts chronologically
    },
    include: {
      user: true,
      comments: true,
      likes: true,
      votes: true,
    },
    skip: skip,
    take: pageSize + 1, // Fetch one extra to check if there's a next page
  });

  // Check if there's a next page by seeing if we got more than pageSize items
  const hasNextPage = posts.length > pageSize;

  // If we got more than pageSize items, remove the extra one before returning the feed
  if (hasNextPage) {
    posts.pop();
  }

  return posts;
}

export async function updatePost({
  postId,
  content,
  imageUrl,
}: {
  postId: string;
  content: string;
  imageUrl?: string;
}): Promise<Post> {
  const post = await prisma.post.update({
    where: { id: postId },
    data: {
      content,
      imageUrl,
    },
    include: {
      user: true,
      comments: true,
      likes: true,
      votes: true,
    },
  });

  return post;
}

export async function deletePost(postId: string): Promise<Post> {
  // Get the userId before deletion to decrement postCount
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { userId: true },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  const deletedPost = await prisma.post.delete({
    where: { id: postId },
    include: {
      user: true,
      comments: true,
      likes: true,
      votes: true,
    },
  });

  // Decrement postCount for the user
  await prisma.user.update({
    where: { id: post.userId },
    data: { postCount: { decrement: 1 } },
  });

  return deletedPost;
}

export async function getPostById(postId: string): Promise<Post | null> {
  return prisma.post.findUnique({
    where: { id: postId },
    include: {
      user: true,
      comments: true,
      likes: true,
      votes: true,
    },
  });
}

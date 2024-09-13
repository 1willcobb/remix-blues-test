import type { Post } from "@prisma/client";

import { prisma } from "~/db.server"; // Ensure this path is correct


export async function getUserFeed(
  userId: string, 
  page: number = 1, 
  pageSize: number = 10
): Promise<{ posts: Post[]; hasMore: boolean; pageSize: number }> {

  const safePage = Math.max(1, isNaN(page) ? 1 : page);
  const safePageSize = Math.max(1, isNaN(pageSize) ? 10 : pageSize);

  const skip = (safePage - 1) * safePageSize;

  console.log("Getting User Feed", page, "PageSize:", pageSize);
  // Get the list of userIds that the current user is following
  const followedUsers = await prisma.userFollow.findMany({
    where: { followerId: userId },
    select: { followedId: true },
  });

  const followedUserIds = followedUsers.map((follow) => follow.followedId);

  const userAndFollowedIds = [...followedUserIds, userId];

  console.log("Followed users:", userAndFollowedIds);
  // Calculate how many records to skip based on the current page
  // const skip = (page - 1) * pageSize;

  // Get the posts from those followed users with pagination
  const feedPosts = await prisma.post.findMany({
    where: {
      userId: {
        in: userAndFollowedIds,
      },
    },
    orderBy: {
      createdAt: "desc", // Sort posts chronologically
    },
    include: {
      user: true,
      comments: true,
      likes: true,
      votes: true,
    },
    skip: skip,
    take: pageSize + 1, // Fetch one more than needed to check if there's a next page
  });

  for (const post of feedPosts) {
    console.log("Post:", post.id);
  
  }
  // Check if there's a next page
  const hasMore = feedPosts.length > pageSize;
  console.log("Feed posts has more:", hasMore);

  // If we got more than pageSize items, remove the extra one before returning
  if (hasMore) {
    feedPosts.pop();
  }

  return { posts: feedPosts, hasMore, pageSize };
}

export async function createPost({
  content,
  imageUrl,
  userId,
  lens,
  filmStock,
  camera,
  settings,
}: {
  content: string;
  imageUrl: string;
  userId: string;
  lens?: string;
  filmStock?: string;
  camera?: string;
  settings?: string;
}): Promise<Post> {
  console.log("Creating post for user:", userId);
  console.log("Content:", content);
  console.log("Image URL:", imageUrl);
  console.log(lens)
  console.log(filmStock)
  console.log(camera)
  console.log(settings)


  try {
    const post = await prisma.post.create({
      data: {
        content,
        imageUrl,
        user: {
          connect: { id: userId },
        },
        lens,
        filmStock,
        camera,
        settings
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
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
  

  
}

export async function getUserPosts(userId: string, page: number = 1, pageSize: number = 10): Promise<Post[]> {
  const safePage = Math.max(1, isNaN(page) ? 1 : page);
  const safePageSize = Math.max(1, isNaN(pageSize) ? 10 : pageSize);

  const skip = (safePage - 1) * safePageSize;
  
  console.log("Getting posts for user:", userId, "Page:", page, "PageSize:", pageSize);

  const posts = await prisma.post.findMany({
    where: {
      userId: userId, // Filter posts by the specific user
    },
    orderBy: {
      createdAt: "desc", // Sort posts chronologically
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

  // console.log("Posts:", posts);

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

export async function getMonthlyTopPosts(page: number = 1, pageSize: number = 10): Promise<Post[]> {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Define the start and end of the current month
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

  // Calculate how many records to skip based on the current page
  const skip = (page - 1) * pageSize;

  const topPosts = await prisma.post.findMany({
    where: {
      createdAt: {
        gte: startOfMonth, // Start of the current month
        lt: endOfMonth, // Start of the next month
      },
      voteCount: {
        gt: 0, // Filter out posts with no votes
      },
    },
    orderBy: {
      voteCount: "desc", // Sort by the number of votes in descending order
    },
    skip: skip,       // Skip records for pagination
    take: pageSize,   // Take the specified number of records
    include: {
      user: true,
      comments: true,
      likes: true,
      votes: true,
    },
  });

  return topPosts;
}

// post.server.ts

export async function getSurroundingMonthlyPosts(postId: string) {
  // Fetch the current post to get its createdAt date
  const currentPost = await prisma.post.findUnique({
    where: { id: postId },
    select: { createdAt: true },
  });

  if (!currentPost) {
    throw new Error("Post not found");
  }

  const currentYear = currentPost.createdAt.getFullYear();
  const currentMonth = currentPost.createdAt.getMonth();
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

  // Fetch previous posts
  const previousPosts = await prisma.post.findMany({
    where: {
      createdAt: {
        lt: currentPost.createdAt,
        gte: startOfMonth,
      },
      voteCount: {
        gt: 0,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 2, // Adjust this number as needed
    include: {
      user: true,
      comments: true,
      likes: true,
      votes: true,
    },
  });

  // Fetch next posts
  const nextPosts = await prisma.post.findMany({
    where: {
      createdAt: {
        gt: currentPost.createdAt,
        lt: endOfMonth,
      },
      voteCount: {
        gt: 0,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 2, // Adjust this number as needed
    include: {
      user: true,
      comments: true,
      likes: true,
      votes: true,
    },
  });

  return { previousPosts, nextPosts };
}


export async function getPreviousMonthlyPosts(postId: string, lastPostDate: string): Promise<Post[]> {
  const date = new Date(lastPostDate);
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();
  const startOfMonth = new Date(currentYear, currentMonth, 1);

  const previousPosts = await prisma.post.findMany({
    where: {
      createdAt: {
        lt: date,
        gte: startOfMonth,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 2, // Adjust this number as needed
    include: {
      user: true,
      comments: true,
      likes: true,
      votes: true,
    },
  });

  return previousPosts;
}

export async function getNextMonthlyPosts(postId: string, lastPostDate: string): Promise<Post[]> {
  const date = new Date(lastPostDate);
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();
  const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

  const nextPosts = await prisma.post.findMany({
    where: {
      createdAt: {
        gt: date,
        lt: endOfMonth,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 2, // Adjust this number as needed
    include: {
      user: true,
      comments: true,
      likes: true,
      votes: true,
    },
  });

  return nextPosts;
}
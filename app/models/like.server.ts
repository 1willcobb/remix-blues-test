import type { Like } from "@prisma/client";

import { prisma } from "~/db.server";

// Get all likes for a specific post, comment, or blog
export async function getLikesByEntity({
  postId,
  commentId,
  blogId,
  page = 1,
  pageSize = 10,
}: {
  postId?: string;
  commentId?: string;
  blogId?: string;
  page?: number;
  pageSize?: number;
}): Promise<Like[]> {
  const skip = (page - 1) * pageSize;

  const likes = await prisma.like.findMany({
    where: {
      postId: postId || undefined,
      commentId: commentId || undefined,
      blogId: blogId || undefined,
    },
    orderBy: {
      createdAt: "asc", // Sort likes chronologically
    },
    include: {
      user: true,
      post: true,
      comment: true,
      blog: true,
    },
    skip: skip,
    take: pageSize + 1, // Fetch one extra to check if there's a next page
  });

  const hasNextPage = likes.length > pageSize;

  if (hasNextPage) {
    likes.pop();
  }

  return likes;
}

export async function hasUserLiked({
  userId,
  postId,
  commentId,
  blogId,
}: {
  userId: string;
  postId?: string;
  commentId?: string;
  blogId?: string;
}): Promise<boolean> {
  const like = await prisma.like.findFirst({
    where: {
      userId: userId,
      postId: postId || undefined,
      commentId: commentId || undefined,
      blogId: blogId || undefined,
    },
  });

  if (!like) {
    return false;
  }

  return true;
}


// Create a new like
export async function createLike({
  userId,
  postId,
  commentId,
  blogId,
}: {
  userId: string;
  postId?: string;
  commentId?: string;
  blogId?: string;
}): Promise<Like | { success: boolean; message: string }> {
  const alreadyLiked = await hasUserLiked({ userId, postId, commentId, blogId });

  if (alreadyLiked) {
    return {
      success: false,
      message: "User has already liked this entity",
    };
  }

  const like = await prisma.like.create({
    data: {
      user: { connect: { id: userId } },
      post: postId ? { connect: { id: postId } } : undefined,
      comment: commentId ? { connect: { id: commentId } } : undefined,
      blog: blogId ? { connect: { id: blogId } } : undefined,
    },
    include: {
      user: true,
      post: true,
      comment: true,
      blog: true,
    },
  });

  // Update the likeCount for the associated entity
  if (postId) {
    await prisma.post.update({
      where: { id: postId },
      data: { likeCount: { increment: 1 } },
    });
  } else if (commentId) {
    await prisma.comment.update({
      where: { id: commentId },
      data: { likeCount: { increment: 1 } },
    });
  } else if (blogId) {
    await prisma.blog.update({
      where: { id: blogId },
      data: { likeCount: { increment: 1 } },
    });
  }

  return like;
}



// Delete a like
export async function deleteLike(userId: string, postId?: string, commentId?: string, blogId?: string): Promise<Like> {

  let likeId;
  if (postId){
    const like = await prisma.like.findFirst({
      where: {
        userId,
        postId
        
      }
    })
    likeId = like.id
  } else if (commentId) {
    const like = await prisma.like.findFirst({
      where: {
        userId,
        commentId
      }
    })
    likeId = like.id
  } else if (blogId) {
    const like = await prisma.like.findFirst({
      where: {
        userId,
        blogId
      }
    })
    likeId = like.id
  }

  const like = await prisma.like.delete({
    where: { id: likeId },
    include: {
      user: true,
      post: true,
      comment: true,
      blog: true,
    },
  });

  // Update the likeCount for the associated entity
  if (postId) {
    await prisma.post.update({
      where: { id: postId },
      data: { likeCount: { decrement: 1 } },
    });
  } else if (commentId) {
    await prisma.comment.update({
      where: { id: commentId },
      data: { likeCount: { decrement: 1 } },
    });
  } else if (blogId) {
    await prisma.blog.update({
      where: { id: blogId },
      data: { likeCount: { decrement: 1 } },
    });
  }

  return like;
}


// Get a like by ID
export async function getLikeById(likeId: string): Promise<Like | null> {
  return prisma.like.findUnique({
    where: { id: likeId },
    include: {
      user: true,
      post: true,
      comment: true,
      blog: true,
    },
  });
}

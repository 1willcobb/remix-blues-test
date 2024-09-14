import type { Comment } from "@prisma/client";

import { prisma } from "~/db.server";

export async function createComment({
  content,
  userId,
  postId,
  blogId,
}: {
  content: string;
  userId: string;
  postId?: string;
  blogId?: string;
}): Promise<Comment> {
  // Check if either postId or blogId is provided
  if (!postId && !blogId) {
    throw new Error("Either postId or blogId must be provided.");
  }

  // Ensure the blogId exists before creating the comment
  if (blogId) {
    const blogExists = await prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blogExists) {
      throw new Error("Blog not found.");
    }
  }

  // Ensure the postId exists before creating the comment
  if (postId) {
    const postExists = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!postExists) {
      throw new Error("Post not found.");
    }
  }

  try {
    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content,
        user: { connect: { id: userId } },
        post: postId ? { connect: { id: postId } } : undefined,
        blog: blogId ? { connect: { id: blogId } } : undefined,
      },
      include: {
        user: true,
        post: true,
        blog: true,
      },
    });

    // Increment commentCount in the respective entity (post or blog)
    if (postId) {
      await prisma.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      });
    } else if (blogId) {
      await prisma.blog.update({
        where: { id: blogId },
        data: { commentCount: { increment: 1 } },
      });
    }

    return comment;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw new Error("Failed to create comment.");
  }
}

export async function getCommentsByEntity({
  postId,
  blogId,
  page = 1,
  pageSize = 10,
}: {
  postId?: string;
  blogId?: string;
  page?: number;
  pageSize?: number;
}): Promise<Comment[]> {
  const skip = (page - 1) * pageSize;

  return prisma.comment.findMany({
    where: {
      postId: postId || undefined,
      blogId: blogId || undefined,
    },
    include: {
      user: true,
      post: true,
      blog: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    skip,
    take: pageSize,
  });
}

export async function updateComment({
  commentId,
  content,
}: {
  commentId: string;
  content: string;
}): Promise<Comment> {
  return prisma.comment.update({
    where: { id: commentId },
    data: { content },
    include: {
      user: true,
      post: true,
      blog: true,
    },
  });
}

export async function deleteComment(commentId: string, postId?: string, blogId?: string): Promise<Comment> {
  const comment = await prisma.comment.delete({
    where: { id: commentId },
    include: {
      user: true,
      post: true,
      blog: true,
    },
  });

  if (postId) {
    await prisma.post.update({
      where: { id: postId },
      data: { commentCount: { decrement: 1 } },
    });
  } else if (blogId) {
    await prisma.blog.update({
      where: { id: blogId },
      data: { commentCount: { decrement: 1 } },
    });
  }

  return comment;
}

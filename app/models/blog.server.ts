import type { Blog } from "@prisma/client";

import { prisma } from "~/db.server";

export async function createBlog({
  title,
  subtitle,
  content,
  authorId,
}: {
  title: string;
  subtitle: string;
  content: string;
  authorId: string;
}): Promise<Blog> {
  const blog = await prisma.blog.create({
    data: {
      title,
      content,
      subtitle,
      author: { connect: { id: authorId } },
    },
    include: {
      author: true,
      comments: true,
      likes: true,
    },
  });

  console.log("Blog created:", blog);
  return blog
}

export async function getBlogs(page: number = 1, pageSize: number = 10): Promise<Blog[]> {
  const skip = (page - 1) * pageSize;

  return prisma.blog.findMany({
    include: {
      author: true,
      comments: true,
      likes: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    skip,
    take: pageSize,
  });
}


export async function getBlogById(blogId: string): Promise<Blog | null> {
  return prisma.blog.findUnique({
    where: { id: blogId },
    include: {
      author: true,
      comments: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      likes: true,
    },
  });
}


export async function updateBlog({
  blogId,
  title,
  content,
}: {
  blogId: string;
  title: string;
  content: string;
}): Promise<Blog> {
  return prisma.blog.update({
    where: { id: blogId },
    data: { title, content },
    include: {
      author: true,
      comments: true,
      likes: true,
    },
  });
}

export async function deleteBlog(blogId: string): Promise<Blog> {
  console.log("Deleting blog with id:", blogId);
  const deletedBlog = await prisma.blog.delete({
    where: { id: blogId },
    include: {
      author: true,
      comments: true,
      likes: true,
    },
  });

  console.log("Blog deleted:", deletedBlog);

  return deletedBlog
}


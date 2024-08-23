import type { Vote } from "@prisma/client";
import { prisma } from "~/db.server";

export async function createVote({
  value,
  userId,
  postId,
}: {
  value: number;
  userId: string;
  postId: string;
}): Promise<Vote> {
  const vote = await prisma.vote.create({
    data: {
      value,
      user: { connect: { id: userId } },
      post: { connect: { id: postId } },
    },
    include: {
      user: true,
      post: true,
    },
  });

  await prisma.post.update({
    where: { id: postId },
    data: { voteCount: { increment: value } },
  });

  return vote;
}

export async function getVotesByPost(postId: string): Promise<Vote[]> {
  return prisma.vote.findMany({
    where: { postId },
    include: {
      user: true,
      post: true,
    },
  });
}

export async function deleteVote(voteId: string, postId: string, value: number): Promise<Vote> {
  const vote = await prisma.vote.delete({
    where: { id: voteId },
    include: {
      user: true,
      post: true,
    },
  });

  await prisma.post.update({
    where: { id: postId },
    data: { voteCount: { decrement: value } },
  });

  return vote;
}

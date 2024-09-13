import type { Vote } from "@prisma/client";
import { prisma } from "~/db.server";

export async function createVote({ userId, postId }: { userId: string, postId: string }): Promise<Vote> {
  try {
    console.log("attempting to create vote")
    const vote = await prisma.vote.create({
      data: {
        userId,
        postId,
      },
    });
    

    await prisma.post.update({
      where: { id: postId },
      data: { voteCount: { increment: 1 } },
    });

    console.log("success at creating vote ", vote.id)
    return vote; // The vote created should match the Vote type
  } catch (error) {
    console.error("Error creating vote", error);
    throw new Error("Failed to create vote");
  }
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

export async function deleteVote(userId: string, postId: string): Promise<Vote> {

  console.log("deleting vote")
  try {

    const voteFinder = await prisma.vote.findFirst({
      where: {
        userId,
        postId
      }
    })
  
    const voteId = voteFinder?.id
  
    const vote = await prisma.vote.delete({
      where: { id: voteId },
      include: {
        user: true,
        post: true,
      },
    });
  
    await prisma.post.update({
      where: { id: postId },
      data: { voteCount: { decrement: 1 } },
    });
    return vote;
  } catch(e) {
    console.log(e)
    throw new Error("Vote not found");
  
  }


  
}

export async function hasUserVoted({
  userId,
  postId,
}: {
  userId: string;
  postId: string;
}): Promise<boolean> {
  console.log("checking if voted")
  const vote = await prisma.vote.findFirst({
    where: {
      userId: userId,
      postId: postId || undefined,
    },
  });

  if (!vote) {
    console.log("false")
    return false;
  }

  console.log("true")
  return true;
}
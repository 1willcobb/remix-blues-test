import type { UserFollow } from "@prisma/client";

import { prisma } from "~/db.server";

export async function followUser({
  followerId,
  followedId
}: {
  followerId: string;
  followedId: string;
}): Promise<UserFollow> {
  console.log("followUser!!!!", followerId, followedId);
  const follow = await prisma.userFollow.create({
    data: {
      follower: { connect: { id: followerId } },
      followedUser: { connect: { id: followedId } },
    },
    include: {
      follower: true,
      followedUser: true,
    },
  });

  await prisma.user.update({
    where: { id: followerId },
    data: { followingCount: { increment: 1 } },
  });

  await prisma.user.update({
    where: { id: followedId },
    data: { followerCount: { increment: 1 } },
  });


  console.log("followUser!!!! Output", follow);
  return follow;
}

export async function unfollowUser(followerId: string, followedId: string): Promise<UserFollow | null> {
  // Find the follow record first
  const follow = await prisma.userFollow.findFirst({
    where: {
      followerId: followerId,
      followedId: followedId,
    },
  });

  if (!follow) {
    throw new Error("Follow relationship not found");
  }

  // Now delete the follow relationship
  const deletedFollow = await prisma.userFollow.delete({
    where: { id: follow.id }, // Use the follow record's ID to delete
    include: {
      follower: true,
      followedUser: true,
    },
  });

  // Update follower/following counts
  await prisma.user.update({
    where: { id: followerId },
    data: { followingCount: { decrement: 1 } },
  });

  await prisma.user.update({
    where: { id: followedId },
    data: { followerCount: { decrement: 1 } },
  });

  return deletedFollow;
}

export async function getFollowers(userId: string): Promise<UserFollow[]> {
  return await prisma.userFollow.findMany({
    where: { followedId: userId },
    include: {
      follower: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getFollowing(userId: string): Promise<UserFollow[]> {
  return await prisma.userFollow.findMany({
    where: { followerId: userId },
    include: {
      followedUser: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

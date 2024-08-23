import type { UserFollow } from "@prisma/client";

import { prisma } from "~/db.server";

export async function followUser({
  followerId,
  followedId,
}: {
  followerId: string;
  followedId: string;
}): Promise<UserFollow> {
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

  return follow;
}

export async function unfollowUser(followId: string, followerId: string, followedId: string): Promise<UserFollow> {
  const follow = await prisma.userFollow.delete({
    where: { id: followId },
    include: {
      follower: true,
      followedUser: true,
    },
  });

  await prisma.user.update({
    where: { id: followerId },
    data: { followingCount: { decrement: 1 } },
  });

  await prisma.user.update({
    where: { id: followedId },
    data: { followerCount: { decrement: 1 } },
  });

  return follow;
}

export async function getFollowers(userId: string): Promise<UserFollow[]> {
  return prisma.userFollow.findMany({
    where: { followedId: userId },
    include: {
      follower: true,
    },
  });
}

export async function getFollowing(userId: string): Promise<UserFollow[]> {
  return prisma.userFollow.findMany({
    where: { followerId: userId },
    include: {
      followedUser: true,
    },
  });
}

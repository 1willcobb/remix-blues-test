import React from "react";
import {
  LoaderFunctionArgs,
  MetaFunction,
  ActionFunctionArgs,
} from "@remix-run/node";
import {
  isRouteErrorResponse,
  useRouteError,
  useLoaderData,
  Outlet,
} from "@remix-run/react";

import ControlBar from "~/components/ControlBar";
import ErrorBoundaryGeneral from "~/components/ErrorBoundaryGeneral";
import Header from "~/components/Header";
import { getUserByUsername } from "~/models/user.server";
import { requireUserId } from "~/session.server";
import { getUserPosts } from "~/models/post.server";

import {
  followUser,
  unfollowUser,
  getFollowing,
} from "~/models/userFollow.server";

import { hasUserLiked } from "~/models/like.server";
import { hasUserVoted } from "~/models/vote.server";

import invariant from "tiny-invariant";

export const meta: MetaFunction = ({ data }) => {
  return [
    {
      title: `MyFilmFriends | ${data.friend.username}`,
      description: "A community for photography lovers.",
    },
  ];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  console.log("Loader function called");

  const userId = await requireUserId(request);
  const friend = await getUserByUsername(params.username);

  invariant(friend, "Friend not found");

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") || "15");

  // Fetch user's posts with pagination
  const posts = await getUserPosts(friend.id, page, pageSize);

  for (const post of posts) {
    post.userLiked = await hasUserLiked({ userId, postId: post.id });
    post.userVoted = await hasUserVoted({ userId, postId: post.id });
  }

  // console.log("Posts:", posts);

  // Check if the user is following the friend
  const followingList = await getFollowing(userId);

  const isFollowing = followingList.some(
    (following) => following.followedUser.id === friend.id,
  );

  return {
    userId,
    posts,
    friend,
    isFollowing,
    page,
    pageSize,
    hasNextPage: posts.length === pageSize, // If we fetched the full pageSize, there might be a next page
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("Action function called");
  const formData = await request.formData();
  const follow = formData.get("follow");
  const unfollow = formData.get("unfollow");
  const loadedUserId = formData.get("loadedUserId");
  const userId = formData.get("userId");

  if (follow) {
    await followUser({
      followerId: loadedUserId.toString(),
      followedId: userId.toString(),
    });
  }

  if (unfollow) {
    const followId = formData.get("followId");
    if (unfollow) {
      await unfollowUser(loadedUserId.toString(), userId.toString());
    }
  }

  return null;
};

export default function UserPage() {
  const { friend } = useLoaderData();

  return (
    <main className="flex flex-col min-h-screen">
      <Header friendUsername={friend.username} />
      <div className=" flex flex-col flex-grow">
        <Outlet />
      </div>
      <ControlBar />
    </main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <ErrorBoundaryGeneral page="user" />;
  }
  return <ErrorBoundaryGeneral page="user" />;
}

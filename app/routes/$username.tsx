import { LoaderFunctionArgs, defer } from "@remix-run/node";
import {
  Outlet,
  useLoaderData,
  isRouteErrorResponse,

  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import ControlBar from "~/components/ControlBar";
import ErrorBoundaryGeneral from "~/components/ErrorBoundaryGeneral";
import Header from "~/components/Header";
import {
  getUserByUsername,
} from "~/models/user.server";
import { requireUserId } from "~/session.server";
import { getUserPosts } from "~/models/post.server";
import { getFollowing } from "~/models/userFollow.server";

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

  // console.log("Posts:", posts);

  // Check if the user is following the friend
  const followingList = await getFollowing(userId);

  const isFollowing = followingList.some(
    (following) => following.followedUser.id === friend.id,
  );

  return {
    posts,
    friend,
    isFollowing,
    page,
    pageSize,
    hasNextPage: posts.length === pageSize, // If we fetched the full pageSize, there might be a next page
  };
};

export default function UserPage() {
  const { friend } = useLoaderData();

  return (
    <main className="flex flex-col min-h-screen">
      <Header friendUsername={friend.username} />
      <section className="flex-grow">
        <Outlet />
      </section>
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

import React from "react";
import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  useLoaderData,
  Link,
  Form,
  useParams,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import { getUserByUsername } from "~/models/user.server";

import {
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
} from "~/models/userFollow.server";

import ErrorBoundaryGeneral from "~/components/ErrorBoundaryGeneral";

import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const loadedUserId = await requireUserId(request); // logged in user ID

  const user = await getUserByUsername(params.username); // user whose page I am viewing
  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  const followers = await getFollowers(user.id); // page user's followers
  const loadedUserFollowing = await getFollowing(loadedUserId); // logged in user's following

  return { followers, loadedUserFollowing, loadedUserId };
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const follow = formData.get("follow");
  const unfollow = formData.get("unfollow");
  const userId = formData.get("userId");
  const loadedUserId = formData.get("loadedUserId");

  if (follow) {
    await followUser({
      followerId: loadedUserId.toString(),
      followedId: userId.toString(),
    });
  }

  if (unfollow) {
    await unfollowUser(
      loadedUserId.toString(),
      userId.toString(),
    );
  }

  return null;
};

export default function Followers() {
  const { followers, loadedUserFollowing, loadedUserId } = useLoaderData();
  const { username } = useParams();

  const [localFollowing, setLocalFollowing] = useState(
    loadedUserFollowing.map((f) => f.followedUser.id),
  );

  const handleFollow = (userId) => {
    setLocalFollowing((prev) => [...prev, userId]);
  };

  const handleUnfollow = (userId) => {
    setLocalFollowing((prev) => prev.filter((id) => id !== userId));
  };

  return (
    <div className="w-full max-w-lg h-full flex flex-col font-extrabold text-2xl sm:mx-auto">
      {followers?.map((user) => (
        <div key={user.follower.id} className="p-2 px-4 flex w-full">
          <Link
            to={`/${user.follower.username}`}
            className="w-full justify-start gap-5 flex align-middle text-center"
          >
            {user.follower.profilePictureUrl ? (
              <img
                src={user.follower.profilePictureUrl}
                alt={user.follower.username}
                className="size-10 rounded-full object-cover"
              />
            ) : null}
            <h2>{user.follower.username}</h2>
          </Link>
          {user.follower.id !== loadedUserId ? (
            localFollowing.includes(user.follower.id) ? (
              <Form
                method="post"
                action={`/${username}/stats/followers`}
                className="flex items-center"
                onSubmit={() => handleUnfollow(user.follower.id)}
              >
                <input type="hidden" name="unfollow" value="unfollow"/>
                <input type="hidden" name="loadedUserId" value={loadedUserId} />
                <input type="hidden" name="userId" value={user.follower.id} />
                <button type="submit" className="btn btn-outline btn-sm">
                  Unfollow
                </button>
              </Form>
            ) : (
              <Form
                method="post"
                action={`/${username}/stats/followers`}
                className="flex items-center"
                onSubmit={() => handleFollow(user.follower.id)}
              >
                <input type="hidden" name="follow" value="follow" />
                <input type="hidden" name="loadedUserId" value={loadedUserId} />
                <input type="hidden" name="userId" value={user.follower.id} />
                <button type="submit" className="btn btn-neutral btn-sm">
                  Follow
                </button>
              </Form>
            )
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <ErrorBoundaryGeneral page="user" />;
  }
  return <ErrorBoundaryGeneral page="user" />;
}

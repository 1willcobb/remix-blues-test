import { useState } from "react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, Form, useParams } from "@remix-run/react";
import { getUserByUsername } from "~/models/user.server";

import {
  getFollowing,
  followUser,
  unfollowUser,
} from "~/models/userFollow.server";

import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const loadedUserId = await requireUserId(request);

  const user = await getUserByUsername(params.username);
  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  const following = await getFollowing(user.id); // page user's following
  const loadedUserFollowing = await getFollowing(loadedUserId); // logged-in user's following

  return { following, loadedUserFollowing, loadedUserId };
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
    await unfollowUser(loadedUserId.toString(), userId.toString());
  }

  return null;
};

export default function FriendFollowing() {
  const { following, loadedUserFollowing, loadedUserId } = useLoaderData();
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
      {following?.map((user) => (
        <div key={user.followedUser.id} className="p-2 px-4 flex w-full">
          <Link
            to={`/${user.followedUser.username}`}
            className="w-full justify-start gap-5 flex align-middle text-center"
          >
            {user.followedUser.profilePictureUrl ? (
              <img
                src={user.followedUser.profilePictureUrl}
                alt={user.followedUser.username}
                className="size-10 rounded-full object-cover"
              />
            ) : null}
            <h2>{user.followedUser.username}</h2>
          </Link>
          {user.followedUser.id !== loadedUserId ? (
            localFollowing.includes(user.followedUser.id) ? (
              <Form
                method="post"
                action={`/${username}/stats/following`}
                className="flex items-center"
                onSubmit={() => handleUnfollow(user.followedUser.id)}
              >
                <input type="hidden" name="unfollow" value="unfollow" />
                <input type="hidden" name="loadedUserId" value={loadedUserId} />
                <input
                  type="hidden"
                  name="userId"
                  value={user.followedUser.id}
                />
                <button type="submit" className="btn btn-outline btn-sm">
                  Unfollow
                </button>
              </Form>
            ) : (
              <Form
                method="post"
                action={`/${username}/stats/following`}
                className="flex items-center"
                onSubmit={() => handleFollow(user.followedUser.id)}
              >
                <input type="hidden" name="follow" value="follow" />
                <input type="hidden" name="loadedUserId" value={loadedUserId} />
                <input
                  type="hidden"
                  name="userId"
                  value={user.followedUser.id}
                />
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

import React, { useState } from "react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import { getUserById, getAllUsers } from "~/models/user.server";
import { followUser, unfollowUser, getFollowing } from "~/models/userFollow.server";
import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const allUsers = await getAllUsers();
  
  const loadedUserFollowing = await getFollowing(userId); // Get users the logged-in user is following

  return json({ allUsers, loadedUserFollowing, loadedUserId: userId });
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const follow = formData.get("follow");
  const unfollow = formData.get("unfollow");
  const userId = formData.get("userId");
  const loadedUserId = formData.get("loadedUserId");

  if (follow) {
    await followUser({ followerId: loadedUserId.toString(), followedId: userId.toString() });
  }

  if (unfollow) {
    await unfollowUser(loadedUserId.toString(), userId.toString(), );
  }

  return null;
};

export default function ExploreFriends() {
  const { allUsers, loadedUserFollowing, loadedUserId } = useLoaderData();

  // Initialize the following Set with followedUserId from loadedUserFollowing
  const [following, setFollowing] = useState(
    new Set(loadedUserFollowing.map((f) => f.followedUser.id))
  );

  const handleFollow = (userId: string) => {
    setFollowing((prev) => new Set(prev.add(userId))); // Optimistically update the following state
  };

  const handleUnfollow = (userId: string) => {
    const newFollowing = new Set(following);
    newFollowing.delete(userId); // Remove from the following set
    setFollowing(newFollowing); // Update state
  };

  return (
    <div className="w-full max-w-lg h-full flex flex-col font-extrabold text-2xl sm:mx-auto ">
      {allUsers.map((user) => (
        <div key={user.username} className="p-2 px-4 flex w-full">
          <Link
            to={`/${user.username}`}
            className="w-full justify-start gap-5 flex align-middle text-center"
          >
            {user.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt={user.username}
                className="size-10 rounded-full object-cover"
              />
            ) : null}
            <h2>{user.username}</h2>
          </Link>

          {user.id === loadedUserId ? null : following.has(user.id) ? (
            <Form
              method="post"
              action={`/explore/friends`}
              className="flex items-center"
              onSubmit={() => handleUnfollow(user.id)}
            >
              <input type="hidden" name="unfollow" value="unfollow" />
              <input type="hidden" name="loadedUserId" value={loadedUserId} />
              <input type="hidden" name="userId" value={user.id} />
              <button type="submit" className="btn btn-outline btn-sm w-20">
                Unfollow
              </button>
            </Form>
          ) : (
            <Form
              method="post"
              action={`/explore/friends`}
              className="flex items-center"
              onSubmit={() => handleFollow(user.id)}
            >
              <input type="hidden" name="follow" value="follow" />
              <input type="hidden" name="loadedUserId" value={loadedUserId} />
              <input type="hidden" name="userId" value={user.id} />
              <button type="submit" className="btn btn-neutral btn-sm w-20">
                Follow
              </button>
            </Form>
          )}
        </div>
      ))}
    </div>
  );
}

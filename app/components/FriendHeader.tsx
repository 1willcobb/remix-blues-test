import {
  Form,
  Link,
  useRouteLoaderData,
  isRouteErrorResponse,
  useRouteError,
  NavLink,
} from "@remix-run/react";

import { User, UserCount } from "~/models/user.server";

import { truncateText } from "~/utils";

interface Props {
  friend: User;
  isFollowing: boolean;
}

export default function FriendHeader({ friend, isFollowing }: Props) {
  const { user } = useRouteLoaderData("root");

  return (
    <section className="flex flex-col pt-1 p-3 gap-2 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 ml-2">
        <img
          src={friend?.profileImage}
          className="size-20 rounded-full object-cover"
          alt="user profile"
        />
        <div className="flex flex-grow justify-evenly ml-4">
          <NavLink to="stats/featured" className="flex flex-col items-center">
            <p>{friend.featuredCount ?? 0}</p>
            <h3 className="font-bold">Featured</h3>
          </NavLink>
          <NavLink to="stats/followers" className="flex flex-col items-center">
            <p>{friend.followerCount ?? 0}</p>
            <h3 className="font-bold">Followers</h3>
          </NavLink>
          <NavLink to="stats/following" className="flex flex-col items-center">
            <p>{friend.followingCount ?? 0}</p>
            <h3 className="font-bold">Following</h3>
          </NavLink>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <h2 className="font-extrabold text-2xl">
          {truncateText(friend?.displayName || friend?.username, 20) ?? null}
        </h2>
        {friend?.role === "superadmin" ? "⭐️" : " "}
      </div>
      <div>
        <p>{friend?.userBio ?? "No bio"}</p>
      </div>
      {friend?.link || friend.linkAltName ? (
        <div>
          <Link
            to={
              friend.link?.startsWith("http")
                ? `${friend.link}`
                : `https://${friend.link}`
            }
            target="_blank"
            rel="noreferrer"
          >
            {" "}
            🔗{" "}
            {friend.linkAltName
              ? truncateText(friend.linkAltName, 50)
              : friend.link}
          </Link>
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        <Form method="post" action="" className="w-full">
          {isFollowing ? (
            <div>
              <input type="hidden" name="unfollow" value={friend?.id} />
              <input type="hidden" name="loadedUserId" value={user?.id} />
              <input type="hidden" name="userId" value={friend?.id} />
              <button type="submit" className="w-full btn btn-outline btn-sm">
                Unfollow
              </button>
            </div>
          ) : user?.username === friend.username ? (
            <NavLink
              to={`/me/${user.id}`}
              type="submit"
              className="btn btn-outline w-full btn-sm"
            >
              Edit Profile
            </NavLink>
          ) : (
            <div>
              <input type="hidden" name="follow" value={friend?.id} />
              <input type="hidden" name="loadedUserId" value={user?.id} />
              <input type="hidden" name="userId" value={friend?.id} />
              <button type="submit" className="btn btn-neutral w-full btn-sm">
                Follow
              </button>
            </div>
          )}
        </Form>
        {user?.username === friend.username ? (
          <NavLink
            to={`/me/${user.id}/messages`}
            className="btn btn-outline w-full btn-sm"
          >
            Messages
          </NavLink>
        ) : (
          <NavLink
            to={`/${friend.username}/message`}
            className="btn btn-neutral w-full btn-sm"
          >
            Message
          </NavLink>
        )}
      </div>
    </section>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <div />;
  }
  return <div />;
}

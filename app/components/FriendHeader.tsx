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
  count: UserCount;
  isFollowing: boolean;
}

export default function FriendHeader({ friend, count, isFollowing }: Props) {
  const { user } = useRouteLoaderData("root");

  const extractUserId = (id) => id.split("#")[1];

  return (
    <section className="flex flex-col justify-center pt-1 p-3 gap-2">
      <div className="flex items-center gap-2 ml-2">
        <img
          src={friend?.profilePictureUrl}
          className="size-20 rounded-full object-cover"
          alt="user profile"
        />
        <div className="flex flex-grow justify-evenly ml-4">
          <NavLink to="stats/featured" className="flex flex-col items-center">
            <p>{count?.featuredCount ?? 0}</p>
            <h3 className="font-bold">Featured</h3>
          </NavLink>
          <NavLink to="stats/followers" className="flex flex-col items-center">
            <p>{count?.followerCount ?? 0}</p>
            <h3 className="font-bold">Followers</h3>
          </NavLink>
          <NavLink to="stats/following" className="flex flex-col items-center">
            <p>{count?.followingCount ?? 0}</p>
            <h3 className="font-bold">Following</h3>
          </NavLink>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <h2 className="font-extrabold text-2xl">
          {truncateText(friend?.displayName || friend?.username, 20) ?? null}
        </h2>
        {friend?.permissions === "superadmin" ? "⭐️" : " "}
      </div>
      <div>
        <p>{friend?.userBio ?? "No bio"}</p>
      </div>
      {friend?.link?.url || friend.link?.altName ? (
        <div>
          <Link
            to={
              friend.link.url?.startsWith("http")
                ? `${friend.link.url}`
                : `https://${friend.link.url}`
            }
            target="_blank"
            rel="noreferrer"
          >
            {" "}
            🔗{" "}
            {friend.link.altName
              ? truncateText(friend.link.altName, 50)
              : friend.link.url}
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
              to={`/me/${extractUserId(user.id)}`}
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
            to={`/me/${extractUserId(user.id)}/messages`}
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

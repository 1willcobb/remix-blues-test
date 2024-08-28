import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  useLoaderData,
  Link,
  Outlet,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import { getUserById } from "~/models/user.server";
import { getFollowing } from "~/models/userFollow.server";

import { requireUserId } from "~/session.server";
import { extractUserIdFromFullId } from "~/utils.ts";

import ErrorBoundaryGeneral from "~/components/ErrorBoundaryGeneral";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const whoIamFollowing = await getFollowing(userId);

  const users = await Promise.all(
    whoIamFollowing.map((user) => getUserById(user.sk)),
  );

  console.log(users);

  return { userId, users };
};

export default function Chat() {
  const { userId, users } = useLoaderData();

  return (
    <div className="grid grid-cols-3 w-full ">
      <div className="col-span-1 border-r-slate-300 border-r p-2 bg-slate-50">
        {users
          ? users.map((user) => (
              <Link
                key={user.id}
                to={`${extractUserIdFromFullId(user.id)}`}
                className="flex gap-2 w-full justify-start align-middle items-center text-center"
              >
                <img
                  className="size-4 rounded-full object-cover"
                  src={user.profilePictureUrl}
                  alt={user.username}
                />
                <p className="font-bold">{user.username}</p>
              </Link>
            ))
          : null}
      </div>
      <div className=" col-span-2 ">
        <Outlet />
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <ErrorBoundaryGeneral page="user/id/messages" />;
  }
  return <ErrorBoundaryGeneral page="user/id/messages" />;
}

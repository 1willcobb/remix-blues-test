import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  useLoaderData,
  Link,
  Outlet,
  isRouteErrorResponse,
  useRouteError,
  useParams,
} from "@remix-run/react";

import { getUserById } from "~/models/user.server";
import { getFollowing } from "~/models/userFollow.server";
import { requireUserId } from "~/session.server";
import { extractUserIdFromFullId } from "~/utils.ts";

import { RiCloseCircleLine } from "react-icons/ri";

import ErrorBoundaryGeneral from "~/components/ErrorBoundaryGeneral";

// A new message should be made on the friend heading message button
// That message button should start a new Chat, and establish the chatId userId##friendId
// the navigation should go to me/id/messages and prob all the way to that friend message
// the left navigation ata me/id/message should display my messages and the active message
// messages should save and use the socket connection.
// upon returning to the page, the messages should be loaded from the database and the most recent chat displayed
// there should be a way to delete the entire message channel. maybe on me/id/message a little trash icon on hover

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const users = await getFollowing(userId);

  console.log(users);

  return { userId, users };
};

export default function Chat() {
  const { userId, users } = useLoaderData();

  const { friendid } = useParams();

  const handleDelete = async (id: string) => {
    console.log("delete", id);
  };

  return (
    <div className="grid grid-cols-3 w-full ">
      <div className="col-span-1 border-r-slate-300 border-r p-2 bg-slate-50">
        {users
          ? users.map((user) => (
              <div
                key={user.followedUser.id}
                className={`relative group flex gap-2 w-full justify-start align-middle items-center text-center ${friendid === user.followedUser.id ? "bg-orange-200" : ""}`}
              >
                <Link
                  to={user.followedUser.id}
                  className="flex gap-2 w-full justify-start align-middle items-center text-center"
                >
                  <img
                    className="size-4 rounded-full object-cover"
                    src={user.followedUser.profileImage}
                    alt={user.followedUser.username}
                  />
                  <p className="font-bold">{user.followedUser.username}</p>
                </Link>

                {/* Delete button, visible only on hover */}
                <button
                  onClick={() => handleDelete(user.followedUser.id)} // handleDelete should be your function to delete the user
                  className="absolute right-2 top-1/2 transform -translate-y-1/2  p-1 rounded hover:bg-red-100 hidden group-hover:block"
                >
                  <RiCloseCircleLine />
                </button>
              </div>
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

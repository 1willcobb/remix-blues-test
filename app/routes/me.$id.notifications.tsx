import type { ActionFunctionArgs } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useFetcher } from "@remix-run/react";
import {
  deleteAllUserNotifications,
  getNotificationsByUser,
  setNotifications,
} from "~/models/notification.server";
import { getUserId, requireUserId } from "~/session.server";

import io from "socket.io-client";

const socket = io("http://localhost:3000/");

export const loader = async ({ request }) => {
  const userId = await requireUserId(request);
  const notifications = await getNotificationsByUser({ userId });

  // console.log("Notifications:", notifications);

  return { notifications, userId };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const rippleDelete = formData.get("rippleDelete");
  const userId = getUserId(request);

  if (rippleDelete) {
    await deleteAllUserNotifications(userId);
    console.log("Deleted all notifications for user", userId);
  }

  return null;
};

export default function Notifications() {
  const { notifications, userId } = useLoaderData();
  const [newNotifications, setNewNotifications] = useState(notifications || []);
  const fetcher = useFetcher();

  useEffect(() => {
    // Join notification room
    socket.emit("joinNotificationRoom", userId);
    console.log("Joined notification room?");

    // Listen for new notifications
    socket.on("newNotification", (notification) => {
      console.log("New notification received:", notification);
      setNewNotifications((prev) => [...prev, notification]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <ul className="flex flex-col w-full max-w-2lg mx-1">
      <fetcher.Form method="post" className="text-center">
        <input type="hidden" name="rippleDelete" value="rippleDelete" />
        <button
          className="btn btn-primary btn-sm"
          type="submit"
          onClick={() => setNewNotifications([])}
        >
          Clear all notifications
        </button>
      </fetcher.Form>
      {newNotifications
        ? newNotifications.map((notification) => (
            <li
              key={notification.id}
              className="w-full grid grid-cols-12 border-b-2 border-gray-100 p-1"
            >
              <Link
                to={notification.link || ""}
                onClick={() => console.log("read")}
                className="col-span-10  w-full"
              >
                {notification.content}
              </Link>
              <fetcher.Form
                method="post"
                className="col-span-2 text-center flex justify-center items-center "
              >
                <input
                  type="hidden"
                  name="deleteSingle"
                  value={notification.id}
                />
                <button className="btn btn-warn btn-sm" type="submit">
                  ✅ Read
                </button>
              </fetcher.Form>
            </li>
          ))
        : null}
    </ul>
  );
}

import type { LoaderFunctionArgs } from "@remix-run/node";
import { useEffect, useState } from "react";
import { useLoaderData } from "@remix-run/react";
import {
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

export default function Notifications() {
  const { notifications, userId } = useLoaderData();
  const [newNotifications, setNewNotifications] = useState(notifications || []);

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
    <div>
      {newNotifications
        ? newNotifications.map((notification) => (
            <button key={notification.id} onClick={() => console.log("read")}>
              {notification.content}
            </button>
          ))
        : null}
    </div>
  );
}

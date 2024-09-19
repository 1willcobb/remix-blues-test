import type { LoaderFunctionArgs } from "@remix-run/node";
import { useEffect, useState } from "react";
import { useLoaderData } from "@remix-run/react";
import {
  getNotificationsByUser,
  setNotifications,
} from "~/models/notification.server";
import { getUserId } from "~/session.server";


import io from "socket.io-client";


export const loader = async ({ request }) => {
  const userId = await getUserId(request);
  const notifications = await getNotificationsByUser({ userId });

  console.log("notifications", notifications);
  return { notifications };
};

export default function Notifications() {
  const { notifications } = useLoaderData();
  const [newNotifications, setNotifications] = useState(notifications || []);

  useEffect(() => {
    const socket = io("http://localhost:3000/");

    socket.on("newNotification", (notification) => {
      setNotifications((prev) => [...prev, notification]);
    });

    return () => socket.disconnect();
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

import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  console.log("userId", userId);
  return { userId };
};

export default function ChatIndex() {
  const { userId } = useLoaderData();
  return (
    <div>
      <h1>ChatIndex</h1>
      <Link to={`/me/${userId}/notifications`}>Notifications</Link>
    </div>
  );
}

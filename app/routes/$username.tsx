import { LoaderFunctionArgs } from "@remix-run/node";
import {
  Outlet,
  useLoaderData,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import ControlBar from "~/components/ControlBar";
import ErrorBoundaryGeneral from "~/components/ErrorBoundaryGeneral";
import Header from "~/components/Header";
import {
  getUserByUsername,
} from "~/models/user.server";
import { requireUserId } from "~/session.server";


export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  console.log("CALLING ROOT USER LOADER");

  const friend = await getUserByUsername(params.username);
  invariant(friend, "Friend not found");

  return {
    friend,
  };
};

export default function UserPage() {
  const { friend } = useLoaderData();

  return (
    <main className="flex flex-col min-h-screen">
      <Header friendUsername={friend.username} />
      <section className="flex-grow">
        <Outlet />
      </section>
      <ControlBar />
    </main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <ErrorBoundaryGeneral page="user" />;
  }
  return <ErrorBoundaryGeneral page="user" />;
}

import Header from "~/components/Header";
import {
  useRouteLoaderData,
  Outlet,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import ControlBar from "~/components/ControlBar";
import ErrorBoundaryGeneral from "~/components/ErrorBoundaryGeneral";

export default function Me() {
  const { user } = useRouteLoaderData("root");

  return (
    <main className="flex flex-col h-full">
      <Header friendUsername={user.username} />
      <section className="flex flex-grow max-w-lg mx-auto">
        <Outlet />
      </section>
      <ControlBar />
    </main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <ErrorBoundaryGeneral page="user index" />;
  }
  return <ErrorBoundaryGeneral page="user index" />;
}

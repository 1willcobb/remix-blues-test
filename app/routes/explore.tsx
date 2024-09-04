import { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, NavLink } from "@remix-run/react";

import ControlBar from "~/components/ControlBar";
import Header from "~/components/Header";
import { requireUserId } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);

  return null;
};

export default function ExplorePage() {
  return (
    <main className="flex flex-col min-h-screen">
      <Header friendUsername={null} />
      <nav className="sticky top-[53px] grid grid-cols-4 p-1 z-50 bg-white">
        <NavLink
          to="featured"
          prefetch="viewport"
          className={({ isActive, isPending }) =>
            isActive ? "underline" : isPending ? "opacity-50" : ""
          }
        >
          <h1 className="font-extrabold text-lg text-center">Featured</h1>
        </NavLink>
        <NavLink
          to="monthly"
          className={({ isActive, isPending }) =>
            isActive ? "underline" : isPending ? "opacity-50" : ""
          }
        >
          <h1 className="font-extrabold text-lg text-center">Monthly</h1>
        </NavLink>
        <NavLink
          to="all-time"
          className={({ isActive, isPending }) =>
            isActive ? "underline" : isPending ? "opacity-50" : ""
          }
        >
          <h1 className="font-extrabold text-lg text-center">All-Time</h1>
        </NavLink>
        <NavLink
          to="friends"
          prefetch="viewport"
          className={({ isActive, isPending }) =>
            isActive ? "underline" : isPending ? "opacity-50" : ""
          }
        >
          <h1 className="font-extrabold text-lg text-center">Friends</h1>
        </NavLink>
      </nav>
      <section className="flex flex-grow">
        <Outlet />
      </section>
      <ControlBar />
    </main>
  );
}

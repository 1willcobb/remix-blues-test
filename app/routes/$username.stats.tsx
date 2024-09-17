import { LoaderFunctionArgs } from "@remix-run/node"
import {  NavLink, Outlet } from "@remix-run/react";

import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);

  return null;
}
export default function FriendFeatured() {
  return (
    <div>
      <nav className="sticky top-[53px] grid grid-cols-3 p-2 z-50">
        <NavLink
          to="featured"
          className={({ isActive, isPending }) =>
            isActive ? "underline" : isPending ? "opacity-50" : ""
          }
        >
          <h1 className="font-extrabold text-lg text-center">Featured</h1>
        </NavLink>
        <NavLink
          to="followers"
          className={({ isActive, isPending }) =>
            isActive ? "underline" : isPending ? "opacity-50" : ""
          }
        >
          <h1 className="font-extrabold text-lg text-center">Followers</h1>
        </NavLink>
        <NavLink
          to="following"
          className={({ isActive, isPending }) =>
            isActive ? "underline" : isPending ? "opacity-50" : ""
          }
        >
          <h1 className="font-extrabold text-lg text-center">Following</h1>
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
}

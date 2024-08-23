import { Link, useMatches, useRouteLoaderData } from "@remix-run/react";
import {
  RiMegaphoneLine,
  RiMegaphoneFill,
  RiMessage2Fill,
  RiMessage2Line,
} from "react-icons/ri";
import { extractUserIdFromFullId } from "../utils";

import config from "~/config";

interface HeaderProps {
  friendUsername: string | null;
}

// A header with a logo on the left, links in the center (like Pricing, etc...), and a CTA (like Get Started or Login) on the right.
// The header is responsive, and on mobile, the links are hidden behind a burger button.
export default function Header({ friendUsername }: HeaderProps) {
  const { user } = useRouteLoaderData("root");

  const matches = useMatches();

  const currentPath = matches[matches.length - 1].pathname;

  const isActive = (path: string) => {
    return currentPath.includes(path);
  };

  let userId = null;
  if (user) {
    // console.log("user on header  " + JSON.stringify(user, null, 2));
    userId = extractUserIdFromFullId(user.id);
  }

  return (
    <header className="sticky left-0 right-0 top-0 z-50 bg-white h-[53px]">
      <nav
        className="flex items-center justify-between px-4 md:px-8 py-3 mx-auto z-50"
        aria-label="Global"
      >
        {/* Your logo/name on large screens */}
        <div className="flex lg:flex-1">
          <Link
            className="flex items-center gap-2 shrink-0 "
            to={friendUsername ? `/${friendUsername}` : "/"}
            title={
              friendUsername
                ? `${friendUsername} homepage`
                : `${config.appName} homepage`
            }
          >
            <span className="font-extrabold text-xl md:text-2xl">
              {(friendUsername || config.appName).length > 15
                ? (friendUsername || config.appName).slice(0, 15) + "..."
                : friendUsername || config.appName}
            </span>
          </Link>
        </div>
        <div className="flex gap-4">
          <Link prefetch="viewport" to="/announcements">
            {isActive("announcements") ? (
              <RiMegaphoneFill className="size-6" />
            ) : (
              <RiMegaphoneLine className="size-6" />
            )}
          </Link>
          <Link prefetch="intent" to={`/me/${userId}/messages`}>
            {isActive("messages") ? (
              <RiMessage2Fill className="size-6" />
            ) : (
              <RiMessage2Line className="size-6" />
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}

import { Link, useRouteLoaderData, useMatches } from "@remix-run/react";
import {
  RiSearch2Line,
  RiSearch2Fill,
  RiAddCircleLine,
  RiAddCircleFill,
  RiFilmLine,
  RiFilmFill,
  RiCheckboxBlankCircleLine,
} from "react-icons/ri";

export default function ControlBar() {
  const { user } = useRouteLoaderData("root");

  const matches = useMatches();

  const currentPath = matches[matches.length - 1].pathname;

  const isActive = (path: string) => {
    return currentPath.includes(path);
  };

  const id = user.id.split("#")[1];

  return (
    <nav className="sticky bg-secondary bottom-0 left-0 px-6 right-0 shadow-md flex justify-around items-center font-extrabold text-2xl z-50 h-[45px]">
      <Link
        to="/friends"
        className="flex justify-center items-center h-full w-1/4 touch-manipulation"
      >
        {isActive("friends") ? (
          <RiFilmFill className="size-6" />
        ) : (
          <RiFilmLine className="size-6" />
        )}
      </Link>
      <Link
        to="/explore"
        className="flex justify-center items-center h-full w-1/4 touch-manipulation"
      >
        {isActive("explore") ? (
          <RiSearch2Fill className="size-6" />
        ) : (
          <RiSearch2Line className="size-6" />
        )}
      </Link>
      <Link
        to={`/me/${id}/upload`}
        className="flex justify-center items-center h-full w-1/4 touch-manipulation"
      >
        {isActive("upload") ? (
          <RiAddCircleFill className="size-6" />
        ) : (
          <RiAddCircleLine className="size-6" />
        )}
      </Link>
      <Link
        to={`/${user.username}`}
        className="flex justify-center items-center h-full w-1/4 touch-manipulation"
      >
        {isActive(`/${user.username}`) ? (
          <img
            src={user.profilePictureUrl}
            className="size-6 rounded-full object-cover border border-black"
            alt="user profile"
          />
        ) : (
          <img
            src={user.profilePictureUrl}
            className="size-6 rounded-full object-cover"
            alt="user profile"
          />
        )}
      </Link>
    </nav>
  );
}

//fixed bottom-0 left-0 right-0 bg-slate-100 p-2 py-6 shadow-md flex justify-around font-extrabold text-2xl

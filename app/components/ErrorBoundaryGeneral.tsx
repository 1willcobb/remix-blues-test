import { Link } from "@remix-run/react";

import dunes from "~/images/dunes.jpg";

export default function ErrorBoundaryGeneral(page) {
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="absolute h-screen md:inset-0">
        <img
          className="h-full w-full object-cover"
          src={dunes}
          alt="Dunes in Pismo Beach, California"
        />
      </div>
      <div className="relative mx-auto w-full max-w-md px-8">
        <h1 className="text-center font-extrabold tracking-tight text-5xl md:text-6xl lg:text-9xl ">
          <span className="block uppercase text-red-500 drop-shadow-md">
            {page}
          </span>
        </h1>
        <Link to={"/"} className="btn btn-warning">
          Home
        </Link>
      </div>
    </div>
  );
}

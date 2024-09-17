import type { LoaderFunctionArgs } from "@remix-run/node";
import { useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";
import { NavLink } from "@remix-run/react";
import dunes from "~/images/dunes.jpg";
import { useOptionalUser, extractUserIdFromFullId } from "~/utils";

export const meta: MetaFunction = () => {
  return [
    {
      title: "MyFilmFriends",
      description: "A community for photography lovers.",
    },
  ];
};

export default function Index() {
  const user = useOptionalUser();


  useEffect(() => {
    let socket;
    if (process.env.NODE_ENV === "development") {
      socket = new WebSocket("ws://localhost:3333");
    } else if (process.env.NODE_ENV === "staging") {
      console.log("Staging mode. connecting to Beta WebSocket");
      socket = new WebSocket(
        "wss://0r05a9b5d4.execute-api.us-west-1.amazonaws.com/staging",
      );
    } else {
      console.log("Production mode. Connecting to Prod WebSocket");
      socket = new WebSocket(
        "wss://0r05a9b5d4.execute-api.us-west-1.amazonaws.com/staging",
      );
    }

    socket.onopen = () => {
      console.log("WebSocket connection established");

      const message = JSON.stringify({ message: "Hello, friend!" });
      console.log("Sending message: ", message);
      socket.send(message);
    };

    socket.onmessage = (event) => {
      console.log("Message From Server: ", event.data);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <main className="flex min-h-full flex-col justify-center">
      <div className="absolute h-screen md:inset-0">
        <img
          className="h-full w-full object-cover"
          src={dunes}
          alt="Dunes in Pismo Beach, California"
        />
      </div>
      <div className="relative m-auto w-full flex flex-col justify-center items-center">
        <h1 className="text-center font-extrabold tracking-tight text-5xl md:text-6xl lg:text-9xl">
          <span className="block uppercase text-red-500 drop-shadow-md">
            MyFilmFriends
          </span>
        </h1>
        <div className="mx-auto mt-10 max-w-sm flex justify-center">
          {user ? (
            <div className="flex flex-col justify-center">
              <div className="mx-auto inline-grid grid-cols-2 gap-5 space-y-0">
                <NavLink
                  prefetch="viewport"
                  to="/friends"
                  className="btn btn-neutral"
                >
                  See Submissions
                </NavLink>
                <NavLink
                  prefetch="viewport"
                  to={`/me/${user.id}/upload`}
                  className="btn btn-neutral"
                >
                  Submit Photo
                </NavLink>
              </div>
              <div className="mt-10 mx-2 p-5 h-full w-full">
                <p className="text-neutral-content text-center">
                  Welcome friendo {user.username}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center">
              <div className="mx-auto inline-grid grid-cols-2 gap-5 space-y-0">
                <NavLink
                  prefetch="viewport"
                  to="/join"
                  className="btn btn-neutral"
                >
                  Sign up
                </NavLink>
                <NavLink
                  prefetch="viewport"
                  to="/login"
                  className="btn btn-neutral"
                >
                  Log In
                </NavLink>
              </div>
              <div className="mt-10 mx-2 p-5 h-full w-full">
                <p className="text-white text-center">
                  A community for photography lovers.
                  <br />
                  Others tell you what, when, and how to post.
                  <br />
                  We just want to see your photos.
                </p>
                <br />
                <ul className="text-white text-center font-extrabold">
                  <li>NO ADS</li>
                  <li>NO AI</li>
                  <li>NO VIDEO</li>
                  <li>JUST PHOTOS</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

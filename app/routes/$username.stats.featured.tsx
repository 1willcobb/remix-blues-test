import React from "react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import {  getUserByUsername } from "~/models/user.server";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const { username } = params;

  const user = await getUserByUsername(username);

  return { user };
}
export default function FriendFeatured() {
  const data = useLoaderData();

  return (
    <div className="bg-white w-100 h-full justify-center text-center">
        <h1>Featured posts coming soon</h1>
    </div>
  );
}

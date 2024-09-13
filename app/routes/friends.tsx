import { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useSearchParams } from "@remix-run/react";

import ControlBar from "~/components/ControlBar";
import Header from "~/components/Header";
import { requireUserId } from "~/session.server";
import { getUserFeed } from "~/models/post.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page")) || 1; 
  const { posts, hasMore, pageSize } = await getUserFeed(userId, page); // Initial page load

  return { posts, hasMore, pageSize, hasNextPage: posts.length === pageSize };
};

export default function FriendsFeed() {
  return (
    <main className="flex flex-col min-h-screen">
      <Header friendUsername={null} />
      <section className="flex flex-grow">
        <Outlet />
      </section>
      <ControlBar />
    </main>
  );
}

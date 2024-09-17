import { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useSearchParams } from "@remix-run/react";

import ControlBar from "~/components/ControlBar";
import Header from "~/components/Header";
import { requireUserId } from "~/session.server";
import { getUserFeed } from "~/models/post.server";
import { hasUserLiked } from "~/models/like.server";
import { hasUserVoted } from "~/models/vote.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page")) || 1;
  const { posts, hasMore, pageSize } = await getUserFeed(userId, page); // Initial page load

  for (const post of posts) {
    post.userLiked = await hasUserLiked({ userId, postId: post.id });
    post.userVoted = await hasUserVoted({ userId, postId: post.id });
  }

  return { posts, hasMore, pageSize, hasNextPage: posts.length === pageSize, userId };
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

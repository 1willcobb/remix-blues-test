import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";

import { getUserFeed } from "~/models/post.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = "3b5e99af-8182-4d4d-be2c-007d23ae581f";
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") || "1", 10);

  const feed = await getUserFeed(userId, page, pageSize);

  return { feed, page, pageSize };
};

export default function Hey() {
  const { feed, page, pageSize } = useLoaderData();

  const hasNextPage = feed.length === pageSize;
  const hasPreviousPage = page > 1;

  return (
    <div>
      <ul>
        {feed && feed.map((post) => (
          <li key={post.id}>
            <h1>{post.user.username}</h1>
            <p>{post.content}</p>
            <p>{post.user.id}</p>
            <p>{new Date(post.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>

      <div>
        {hasPreviousPage && (
          <Link to={`?page=${page - 1}&pageSize=${pageSize}`}>Previous</Link>
        )}
        {hasNextPage ? (
          <Link to={`?page=${page + 1}&pageSize=${pageSize}`}>Next</Link>
        ): null}
      </div>
    </div>
  );
}
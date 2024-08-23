import type { ActionFunctionArgs } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  useLoaderData,
  Link,
  Form,
  useFetcher,
  Outlet,
} from "@remix-run/react";

import { createLike, hasUserLiked, deleteLike } from "~/models/like.server";
import { getPostById } from "~/models/post.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const postId = params.id;

  const post = await getPostById(postId);

  // Check if the user has already liked the post
  const like = await hasUserLiked({ userId, postId });

  return { post, userId, like };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData();
  const userId = body.get("userId");
  const postId = body.get("postId");

  // Check if the user has already liked the post
  const userHasLiked = await hasUserLiked({ userId, postId });

  if (userHasLiked) {
    await deleteLike(userHasLiked.id, postId);
  } else {
    // Otherwise, create a new like
    await createLike({ userId, postId });
  }

  return null;
};
export default function SinglePost() {
  const { post, userId, like } = useLoaderData();

  const fetcher = useFetcher();

  return (
    <div>
      <h1>singlePost</h1>
      <h2>{post.content}</h2>
      <h3>{post.likeCount}</h3>
      <fetcher.Form method="post">
        <input type="hidden" name="postId" value={post.id} />
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="likeId" value={like?.id || ""} />
        <button type="submit">{like ? "Unlike" : "Like"}</button>
      </fetcher.Form>
    </div>
  );
}

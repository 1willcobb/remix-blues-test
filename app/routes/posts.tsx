import type { ActionFunctionArgs } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  useLoaderData,
  Link,
  Form,
  useFetcher,
  Outlet,
} from "@remix-run/react";

import { useState } from "react";

import TipTap from "~/components/TipTap";

import { getUserPosts, createPost, deletePost } from "~/models/post.server";
import { requireUserId } from "~/session.server";


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);

  const posts = await getUserPosts(userId, page, pageSize);

  return { posts, userId, page, pageSize };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData();
  const content = body.get("content");
  const userId = body.get("userId");

  const action = body.get("delete");
  const postId = body.get("postId");

  console.log(userId);

  if (action && postId) {
    await deletePost(postId);
    return new Response(null, {
      status: 303,
      headers: { Location: "/posts" },
    });
  }

  if (content) {
    await createPost({ content, userId });
    return new Response(null, { status: 303, headers: { Location: "/posts" } });
  }

  return null;
};

export default function Posts() {
  const { posts, userId, page, pageSize } = useLoaderData();
  const fetcher = useFetcher();
  const [content, setContent] = useState('');

  console.log(posts);

  //! ENDED here 8/23/24
  return (
    <div className="grid grid-rows-2 grid-cols-2 items-center text-center w-full h-1/2 bg-slate-200">
      <div>
        <h1>Posts</h1>
        <fetcher.Form method="post">
          <input type="hidden" name="userId" value={userId} />
          <input
            type="hidden"
            name="content"
            value={content}
            key={fetcher.state === "submitting" ? "new" : "default"}
          />
          <TipTap content={content} setContent={setContent} />
          <button type="submit">Create Post</button>
        </fetcher.Form>
      </div>
      <div className="flex flex-col gap-4 bg-zinc-100">
        <ul className="flex flex-col">
          {posts
            ? posts.map((post) => (
                <li
                  key={post.id}
                  className="flex justify-center text-center items-center gap-2"
                >
                  <Link to={`/posts/${post.id}`}>
                    <h1>{post.content}</h1>
                  </Link>
                  <p>{post.likeCount}</p>
                  <fetcher.Form method="post">
                    <input type="hidden" name="delete" value="delete" />
                    <input type="hidden" name="postId" value={post.id} />
                    <button
                      type="submit"
                      className="px-2 py-1 rounded-full bg-slate-400 hover:bg-slate-200"
                    >
                      X
                    </button>
                  </fetcher.Form>
                </li>
              ))
            : null}
        </ul>
        <div>
          {page > 1 && (
            <Link to={`?page=${page - 1}&pageSize=${pageSize}`}>
              <button className="px-4 py-2 bg-blue-500 text-white rounded">
                Previous
              </button>
            </Link>
          )}
          {posts.length === pageSize && (
            <Link to={`?page=${page + 1}&pageSize=${pageSize}`}>
              <button className="px-4 py-2 bg-blue-500 text-white rounded">
                Next
              </button>
            </Link>
          )}
        </div>
      </div>
      <div className="col-span-2">
        <Outlet />
        
      </div>
    </div>
  );
}

import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import {
  useLoaderData,
  useFetcher,
  useParams,
  isRouteErrorResponse,
  useRouteError,
  useNavigate,
} from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { getPostById } from "~/models/post.server";
import { requireUserId } from "~/session.server";

import InfiniteScroll from "react-infinite-scroll-component";
import Post from "~/components/Post";
import invariant from "tiny-invariant";

import { RiArrowLeftSFill, RiArrowRightSFill } from "react-icons/ri";

import ErrorBoundaryGeneral from "~/components/ErrorBoundaryGeneral";

export const meta: MetaFunction = () => {
  return [
    {
      title: `MyFilmFriends`,
      description: "A community for photography lovers.",
    },
  ];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const post = await getPostById(params.postid);
  invariant(post, "Post not found");

  return {
    post,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return null;
};

export default function FullScreenPost() {
  const { post } = useLoaderData();
  const navigate = useNavigate();

  const fetcher = useFetcher();

  console.log("Post:", post);

  return (
    <dialog id="my_modal_1" className="modal">
      <div className="modal-box flex p-0 h-full max-w-full">
        <fetcher.Form
          method="post"
          className="flex justify-center bg-slate-300 bg-opacity-20 hover:bg-opacity-60  hover:text-white w-1/12 py-52 rounded-r-full sm:rounded-full"
        >
          <button type="submit">
            <RiArrowLeftSFill className="size-16 " />
          </button>
        </fetcher.Form>
        <Post
          mediaUrl={post.imageUrl}
          id={post.id}
          content={post.content}
          username={post.user.username}
          createdAt={post.createdAt}
          likes={post.likeCount}
          comments={post.commentCount}
        />

        <fetcher.Form
          method="post"
          className="flex justify-center bg-slate-300 bg-opacity-20 hover:bg-opacity-60  hover:text-white w-1/12 py-52 rounded-l-full sm:rounded-full"
        >
          <button type="submit">
            <RiArrowRightSFill className="size-16 " />
          </button>
        </fetcher.Form>
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop" >
        <button>close</button>
      </form>
    </dialog>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <ErrorBoundaryGeneral page="user index" />;
  }
  return <ErrorBoundaryGeneral page="user index" />;
}

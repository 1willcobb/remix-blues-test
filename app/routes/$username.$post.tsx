import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import {
  useLoaderData,
  useFetcher,
  useParams,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { getUserPosts } from "~/models/post.server";
import { requireUserId } from "~/session.server";

import { getUserByUsername } from "~/models/user.server";

import InfiniteScroll from "react-infinite-scroll-component";
import Post from "~/components/Post";
import invariant from "tiny-invariant";

import ErrorBoundaryGeneral from "~/components/ErrorBoundaryGeneral";

export const meta: MetaFunction = ({ data }) => {
  return [
    {
      title: `MyFilmFriends | ${data.friend.username}`,
      description: "A community for photography lovers.",
    },
  ];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const friend = await getUserByUsername(params.username);
  invariant(friend, "Friend not found");

  const url = new URL(request.url);
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const limit = parseInt(url.searchParams.get("limit") || "5");
  const lastEvaluatedKey = url.searchParams.get("lastEvaluatedKey");

  let parsedLastEvaluatedKey;
  if (lastEvaluatedKey) {
    try {
      parsedLastEvaluatedKey = JSON.parse(lastEvaluatedKey);
    } catch (error) {
      console.error(
        "Invalid JSON in lastEvaluatedKey",
        lastEvaluatedKey,
        error,
      );
      parsedLastEvaluatedKey = undefined; // or handle it in a way that's appropriate for your logic
    }
  }

  const { posts, lastEvaluatedKey: newLastEvaluatedKey } = await getUserPosts(
    friend.id,
    offset,
    limit,
    parsedLastEvaluatedKey,
  );

  return {
    "alert": "nothidden",
    posts,
    offset,
    friend,
    limit,
    lastEvaluatedKey: newLastEvaluatedKey,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  console.log(formData);

  return null;
};

export default function FullScreenPost() {
  const { posts, offset, limit, lastEvaluatedKey, friend } = useLoaderData();
  const params = useParams();
  const fetcher = useFetcher();
  const [allPosts, setAllPosts] = useState(posts);
  const [hasMore, setHasMore] = useState(true);
  const [lastKey, setLastKey] = useState(lastEvaluatedKey);

  const fetchMoreData = () => {
    console.log("Fetching more data", allPosts.length, limit, lastKey);
    fetcher.load(
      `/${friend.username}/${params.postId}?offset=${allPosts.length}&limit=${limit}&lastEvaluatedKey=${encodeURIComponent(JSON.stringify(lastKey))}`,
    );
  };

  useEffect(() => {
    if (fetcher.data && fetcher.data.posts) {
      console.log("Fetcher data", fetcher.data);
      if (fetcher.data.posts.length < limit) {
        setHasMore(false);
      }
      setAllPosts((prevPosts) => [...prevPosts, ...fetcher.data.posts]);
      setLastKey(fetcher.data.lastEvaluatedKey);
    }
  }, [fetcher.data]);

  return (
    <div className="w-full flex justify-center">
      <InfiniteScroll
        dataLength={allPosts.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={
          <div className="flex w-full flex-col gap-4">
            <div className="skeleton h-96 w-full"></div>
            <div className="skeleton h-4 w-28"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
          </div>
        }
        refreshFunction={fetchMoreData}
        className="max-w-2xl flex flex-col mx-auto w-full items-center"
      >
        {allPosts.map((post) => (
          <div key={post.sk}>
            <Post
              mediaUrl={post.mediaUrl}
              postIdSk={post.sk}
              caption={post.caption}
              username={post.creatorUsername}
              createdAt={post.createdAt}
              likes={"55"}
              comments={"44"}
            />
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <ErrorBoundaryGeneral page="user index" />;
  }
  return <ErrorBoundaryGeneral page="user index" />;
}

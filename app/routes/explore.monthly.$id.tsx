// routes/explore/monthly/$id.tsx

import { useLoaderData, Link, useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import {
  getPostById,
  getSurroundingMonthlyPosts,
  getNextMonthlyPosts,
  getPreviousMonthlyPosts,
} from "~/models/post.server";
import dune from "~/images/dunes.jpg";

export async function loader({ params }) {
  const { id } = params;

  // Fetch the specific post by its ID
  const post = await getPostById(id);

  if (!post) {
    throw new Response("Post not found", { status: 404 });
  }

  // Fetch surrounding posts for pagination purposes
  const { previousPosts, nextPosts } = await getSurroundingMonthlyPosts(id);

  return {
    post,
    initialPreviousPosts: previousPosts,
    initialNextPosts: nextPosts,
  };
}

export async function action({ request }) {
  const formData = await request.formData();
  const direction = formData.get("direction"); // "previous" or "next"
  const postId = formData.get("postId");
  const lastPostDate = formData.get("lastPostDate");

  if (direction === "previous") {
    const previousPosts = await getPreviousMonthlyPosts(postId, lastPostDate);
    return { previousPosts };
  } else if (direction === "next") {
    const nextPosts = await getNextMonthlyPosts(postId, lastPostDate);
    return { nextPosts };
  }

  return null;
}

export default function PostView() {
  const { post, initialPreviousPosts, initialNextPosts } = useLoaderData();

  const [previousPosts, setPreviousPosts] = useState(initialPreviousPosts);
  const [nextPosts, setNextPosts] = useState(initialNextPosts);
  const [hasMorePrev, setHasMorePrev] = useState(true);
  const [hasMoreNext, setHasMoreNext] = useState(true);

  const fetcher = useFetcher();

  const fetchMorePreviousPosts = () => {
    if (previousPosts.length > 0) {
      const lastPostDate = previousPosts[previousPosts.length - 1].createdAt;
      fetcher.submit(
        { direction: "previous", postId: post.id, lastPostDate },
        { method: "post" },
      );
    }
  };

  const fetchMoreNextPosts = () => {
    if (nextPosts.length > 0) {
      const lastPostDate = nextPosts[nextPosts.length - 1].createdAt;
      fetcher.submit(
        { direction: "next", postId: post.id, lastPostDate },
        { method: "post" },
      );
    }
  };

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.previousPosts) {
        if (fetcher.data.previousPosts.length < 10) {
          setHasMorePrev(false);
        }
        setPreviousPosts((prev) => [...prev, ...fetcher.data.previousPosts]);
      }
      if (fetcher.data.nextPosts) {
        if (fetcher.data.nextPosts.length < 10) {
          setHasMoreNext(false);
        }
        setNextPosts((prev) => [...prev, ...fetcher.data.nextPosts]);
      }
    }
  }, [fetcher.data]);

  return (
    <div className="w-full flex justify-center flex-col">
      {/* Display the current post */}

      <div className="bg-zinc-400">
        <h2>{post.user.username}</h2>
        <img src={post.imageUrl} alt={post.content} />
        <p>{post.content}</p>
      </div>

      {/* Infinite scroll for previous posts */}
      <InfiniteScroll
        className="max-w-2xl flex flex-col mx-auto w-full items-center"
        dataLength={previousPosts.length}
        next={fetchMorePreviousPosts}
        hasMore={hasMorePrev}
        loader={
          <div className="flex w-full flex-col gap-4">
            <div className="skeleton size-full"></div>
          </div>
        }
      >
        {previousPosts.map((prevPost) => (
          <div key={prevPost.id}>
            <Link to={`/explore/monthly/${prevPost.id}`}>
              {prevPost.imageUrl ? (
                <img src={prevPost.imageUrl} alt={prevPost.content} />
              ) : (
                <img src={dune} alt={"dune"} />
              )}
            </Link>
          </div>
        ))}
      </InfiniteScroll>



      {/* Infinite scroll for next posts */}
      <InfiniteScroll
        className="max-w-2xl flex flex-col mx-auto w-full items-center"
        dataLength={nextPosts.length}
        next={fetchMoreNextPosts}
        hasMore={hasMoreNext}
        loader={
          <div className="flex w-full flex-col gap-4">
            <div className="skeleton size-full"></div>
          </div>
        }
      >
        {nextPosts.map((nextPost) => (
          <div key={nextPost.id}>
            <Link to={`/explore/monthly/${nextPost.id}`}>
              <img src={nextPost.imageUrl} alt={nextPost.content} />
            </Link>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
}

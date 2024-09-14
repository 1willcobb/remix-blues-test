import type { ActionFunctionArgs } from "@remix-run/node";
import { useRouteLoaderData, useFetcher } from "@remix-run/react";

import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import { loadCommentsForEntity } from "~/utils/comments.server";

import Post from "~/components/Post";

import { handleCommentActions } from "~/utils/comments.server";

import { getUserId } from "~/session.server";
import { createLike, deleteLike, hasUserLiked } from "~/models/like.server";
import { createVote, deleteVote, hasUserVoted } from "~/models/vote.server";


export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const userId = await getUserId(request);

  const like = formData.get("like");
  const vote = formData.get("vote");
  const postId = formData.get("postId");
  const newComment = formData.get("newComment");

  //!! There is a problem loading comments if they exist. look at blog and how that works. 
  if (newComment) {
    await handleCommentActions(request, postId, "post", formData);
    return null;
  }

  // console.log("like", like);
  // console.log("postId", postId);
  // console.log("vote", vote);

  if (like) {
    console.log("like found");
    const userLiked = await hasUserLiked({ userId, postId });
    if (!userLiked) {
      await createLike({ userId, postId });
    } else {
      console.log("deleting like on action");
      await deleteLike(userId, postId);
    }
  }

  if (vote) {
    console.log("vote found");
    const userVoted = await hasUserVoted({ userId, postId });
    if (!userVoted) {
      await createVote({ userId, postId });
    } else {
      console.log("deleting vote on action");
      await deleteVote(userId, postId);
    }
  }

  return null;
};

export default function FriendsFeedSourced() {
  const data = useRouteLoaderData("routes/friends");

  const [hasMore, setHasMore] = useState(data.hasNextPage);
  const [allPosts, setAllPosts] = useState(data.posts);
  const [page, setPage] = useState(1); // Start from page 2 after the initial load
  const fetcher = useFetcher();

  const fetchMoreData = () => {
    setPage((prevPage) => {
      const nextPage = prevPage + 1;

      // Construct the URL with search params
      const params = new URLSearchParams();
      params.append("page", nextPage.toString());
      params.append("pageSize", data.pageSize.toString());

      fetcher.load(`/friends?${params.toString()}`); // Load new data for the next page
      return nextPage;
    });
  };

  useEffect(() => {
    console.log("Fetcher data", fetcher.data);
    if (fetcher.data && fetcher.data.posts) {
      console.log("Fetcher data", fetcher.data);
      setAllPosts((prevPosts) => [...prevPosts, ...fetcher.data.posts]);
      setHasMore(fetcher.data.hasNextPage); // Update the hasMore state based on new data
    }
  }, [fetcher.data]);

  useEffect(() => {
    setAllPosts(data.posts); // Reset the page number
    setPage(1); // Reset the page number
    setHasMore(data.hasNextPage); // Reset hasMore based on initial load
  }, [data.posts, data.hasNextPage]);

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
        endMessage={
          <p style={{ textAlign: "center" }}>
            <b>Yay! You have seen it all</b>
          </p>
        }
        className="max-w-2xl flex flex-col mx-auto w-full items-center"
      >
        {allPosts.map((post) => (
          <Post key={post.id} post={post} userId={data.userId} />
        ))}
      </InfiniteScroll>
    </div>
  );
}

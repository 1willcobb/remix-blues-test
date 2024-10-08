import type { ActionFunctionArgs } from "@remix-run/node";
import { Link, useRouteLoaderData, useFetcher } from "@remix-run/react";
import { useState, useEffect, React } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import FriendHeader from "~/components/FriendHeader";

import { followUser, unfollowUser } from "~/models/userFollow.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("Action function called");
  const formData = await request.formData();
  const follow = formData.get("follow");
  const unfollow = formData.get("unfollow");
  const loadedUserId = formData.get("loadedUserId");
  const userId = formData.get("userId");

  if (follow) {
    await followUser({
      followerId: loadedUserId.toString(),
      followedId: userId.toString(),
    });
  }

  if (unfollow) {
    const followId = formData.get("followId");
    await unfollowUser(
      followId.toString(),
      loadedUserId.toString(),
      userId.toString(),
    );
  }

  return null;
};

export default function UserIndex() {
  const { posts, friend, isFollowing, pageSize, hasNextPage } =
    useRouteLoaderData("routes/$username");

  const fetcher = useFetcher();
  const [allPosts, setAllPosts] = useState(posts);
  const [hasMore, setHasMore] = useState(hasNextPage);
  const [page, setPage] = useState(1);

  const fetchMoreData = () => {
    setPage((prevPage) => {
      const nextPage = prevPage + 1;

      // Construct the URL with search params
      const params = new URLSearchParams();
      params.append("page", nextPage.toString());
      params.append("pageSize", pageSize.toString());

      fetcher.load(`/${friend.username}/?${params.toString()}`); // Load new data for the next page
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
    setAllPosts(posts); // Reset posts to initial data
    setPage(1); // Reset the page number
    setHasMore(hasNextPage); // Reset hasMore based on initial load
  }, [friend.username, posts, hasNextPage]);

  return (
    <section className="bg-white w-full h-full flex flex-col z-10 ">
      <FriendHeader friend={friend} isFollowing={isFollowing} />
      <InfiniteScroll
        className="grid grid-cols-3 gap-1 max-w-2xl mx-auto z-0"
        dataLength={allPosts.length}
        next={fetchMoreData}
        hasMore={hasMore} // Use hasMore to control if more posts should be loaded
        loader={<div className="skeleton size-full"></div>}
      >
        {allPosts.map((post) => (
          <Link
            to={`${post.id}`}
            key={`${post.id}_allposts`}
            className="relative overflow-hidden pb-full z-0"
          >
            <img
              src={post.imageUrl}
              alt={post.caption}
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
          </Link>
        ))}
      </InfiniteScroll>
    </section>
  );
}

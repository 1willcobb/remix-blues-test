import { useRouteLoaderData, useFetcher } from "@remix-run/react";

import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import Post from "~/components/Post";

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
          <div key={post.id}>
            <Post
              key={post.id}
              mediaUrl={post.imageUrl}
              id={post.id}
              username={post.creatorUsername}
              content={post.content}
              likes={post.likeCount}
              comments={post.commentCount}
              votes={post.voteCount}
              createdAt={post.createdAt}
            />
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
}

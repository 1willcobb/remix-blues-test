import React from "react";
import {
  Link,
  useRouteLoaderData,
  useNavigate,
  useFetcher,
  useParams,
} from "@remix-run/react";
import { useState, useEffect, useCallback, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Post from "~/components/Post";

export default function UserIndex() {
  const { posts, friend, pageSize, hasNextPage, userId } =
    useRouteLoaderData("routes/$username");

  const fetcher = useFetcher();
  const params = useParams(); // Get the postId from URL params

  const [allPosts, setAllPosts] = useState(posts);
  const [hasMore, setHasMore] = useState(hasNextPage);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false); // Prevent race conditions during fetching
  const [targetPostId, setTargetPostId] = useState(null); // Initialize with null

  const observerRef = useRef(null); // Ref to store the intersection observer instance

  // Fetch more data (for pagination)
  const fetchMoreData = useCallback(() => {
    if (isFetching) return; // Prevent multiple fetches at the same time
    setIsFetching(true); // Set fetching state to true

    setPage((prevPage) => {
      const nextPage = prevPage + 1;

      // Construct the URL with search params
      const params = new URLSearchParams();
      params.append("page", nextPage.toString());
      params.append("pageSize", pageSize.toString());

      fetcher.load(`/${friend.username}/?${params.toString()}`); // Load new data for the next page
      return nextPage;
    });
  }, [friend.username, pageSize, isFetching, fetcher]);

  // Handle fetched data
  useEffect(() => {
    if (fetcher.data && fetcher.data.posts) {
      setAllPosts((prevPosts) => [...prevPosts, ...fetcher.data.posts]);
      setHasMore(fetcher.data.hasNextPage);
      setIsFetching(false); // Reset fetching state
    }
  }, [fetcher.data]);

  // Set target postId from params only after the component has mounted
  useEffect(() => {
    if (params.postid) {
      setTargetPostId(params.postid); // Set the target postId from URL params
    }
  }, [params.postid]);

  // Handle reset of posts on username change
  useEffect(() => {
    setAllPosts(posts); // Reset posts to initial data
    setPage(1); // Reset the page number
    setHasMore(hasNextPage); // Reset hasMore based on initial load
  }, [friend.username, posts, hasNextPage]);

  // Handle scrolling to the post when it becomes visible
  useEffect(() => {
    if (targetPostId && allPosts.some((post) => post.id === targetPostId)) {
      // The post is now visible, scroll to it
      const element = document.querySelector(
        `[data-post-id="${targetPostId}"]`
      );
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setTargetPostId(null); // Clear the target postId after scrolling
      }
    }
  }, [targetPostId, allPosts]);

  // Keep fetching data if target post is not loaded yet
  useEffect(() => {
    if (
      targetPostId &&
      !allPosts.some((post) => post.id === targetPostId) &&
      hasMore &&
      !isFetching // Ensure fetching is not happening simultaneously
    ) {
      fetchMoreData(); // Fetch more data until the post is loaded
    }
  }, [targetPostId, allPosts, hasMore, fetchMoreData, isFetching]);

  // Update the URL when a post is in view using IntersectionObserver
  useEffect(() => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const postId = entry.target.getAttribute("data-post-id");
              if (postId) {
                // Update the URL without reloading the page
                window.history.replaceState(null, "", `/${friend.username}/${postId}`);
              }
            }
          });
        },
        {
          threshold: 0.5, // Trigger when 50% of the post is visible
        }
      );
    }

    // Observe all posts
    const postElements = document.querySelectorAll("[data-post-id]");
    postElements.forEach((element) => {
      observerRef.current.observe(element);
    });

    return () => {
      // Cleanup the observer when the component unmounts
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [allPosts, friend.username]);

  return (
    <InfiniteScroll
      className="grid grid-cols-1 gap-1 max-w-2xl mx-auto z-0"
      dataLength={allPosts.length}
      next={fetchMoreData}
      hasMore={hasMore} // Use hasMore to control if more posts should be loaded
      loader={<div className="skeleton size-full"></div>}
    >
      <ul>
        {allPosts.map((post) => (
          <li key={post.id} data-post-id={post.id}>
            <Post post={post} userId={userId} />
          </li>
        ))}
      </ul>
    </InfiniteScroll>
  );
}

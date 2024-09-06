import {
  LoaderFunctionArgs,
  MetaFunction,
  ActionFunctionArgs,
  defer,
} from "@remix-run/node";
import {
  isRouteErrorResponse,
  useRouteError,
  Link,
  useLoaderData,
  useRouteLoaderData,
  useParams,
  useFetcher,
} from "@remix-run/react";

import FriendHeader from "~/components/FriendHeader";
import { requireUserId } from "~/session.server";
import { getUserPosts } from "~/models/post.server";
import { getUserByUsername } from "~/models/user.server";
import {
  followUser,
  unfollowUser,
  getFollowing,
} from "~/models/userFollow.server";

import InfiniteScroll from "react-infinite-scroll-component";
import { useState, useEffect } from "react";
import invariant from "tiny-invariant";

import ErrorBoundaryGeneral from "~/components/ErrorBoundaryGeneral";

export const action = async ({ request }: ActionFunctionArgs) => {
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

export default function UserAccountDashboard() {
  const { posts, friend, isFollowing, pageSize, hasNextPage } = useRouteLoaderData("routes/$username");

  console.log("Data: on index", friend);

  console.log("Friend on page _INDEX:", friend.username);
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

  return (
    <section className="bg-white w-full h-full justify-center z-10 overflow-auto">
      <FriendHeader
        friend={friend}
        count={allPosts.length}
        isFollowing={isFollowing}
      />
      <InfiniteScroll
        className="grid grid-cols-3 gap-1 max-w-2xl mx-auto z-0"
        dataLength={allPosts.length}
        next={fetchMoreData}
        hasMore={hasMore} // Use hasMore to control if more posts should be loaded
        loader={<div className="skeleton size-full"></div>}
      >
        {allPosts.map((post) => (
          <Link
            to={`/post/${post.id}`}
            key={post.id}
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

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <ErrorBoundaryGeneral page="user index" />;
  }
  return <ErrorBoundaryGeneral page="user index" />;
}

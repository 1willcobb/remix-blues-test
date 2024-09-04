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

export const meta: MetaFunction = ({ data }) => {
  return [
    {
      title: `MyFilmFriends | ${data.friend.username}`,
      description: "A community for photography lovers.",
    },
  ];
};

//!! JUST CHANGE THE NAME to PAGE but its still broken something is wrong with the loader call.

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  console.log("Loader function called");
  const userId = await requireUserId(request);
  const friend = await getUserByUsername(params.username);
  invariant(friend, "Friend not found");

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") || "15");

  console.log("Page:", page);
  console.log("PageSize:", pageSize);

  // Fetch user's posts with pagination
  const posts = await getUserPosts(friend.id, page, pageSize);

  // console.log("Posts:", posts);

  // Check if the user is following the friend
  const followingList = await getFollowing(userId);

  const isFollowing = followingList.some(
    (following) => following.followedUser.id === friend.id,
  );

  return defer({
    posts,
    friend,
    isFollowing,
    page,
    pageSize,
    hasNextPage: posts.length === pageSize, // If we fetched the full pageSize, there might be a next page
  });
};

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
  const { posts, friend, isFollowing, pageSize, hasNextPage } = useLoaderData();
  const fetcher = useFetcher();
  const [allPosts, setAllPosts] = useState(posts);
  const [hasMore, setHasMore] = useState(hasNextPage);
  const [page, setPage] = useState(1);

  const fetchMoreData = () => {
    const nextPage = page + 1;
    setPage(nextPage);

    // Construct the URL with search params
    const params = new URLSearchParams();
    params.append("page", nextPage.toString());
    params.append("pageSize", pageSize.toString());

    // Use fetcher.load with properly formatted URL and search params
    const url = `/${friend.username}/posts/${params.toString()}`;

    console.log(`Fetching more data from URL: ${url}`); // Debugging log
    fetcher.load(url);
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

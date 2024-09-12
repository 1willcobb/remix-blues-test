import {
  LoaderFunctionArgs,
  MetaFunction,
  ActionFunctionArgs,
} from "@remix-run/node";
import {
  isRouteErrorResponse,
  useRouteError,
  useLoaderData,
  useFetcher,
  useNavigate,
  Outlet,
} from "@remix-run/react";

import ControlBar from "~/components/ControlBar";
import ErrorBoundaryGeneral from "~/components/ErrorBoundaryGeneral";
import Header from "~/components/Header";
import { getUserByUsername } from "~/models/user.server";
import { requireUserId } from "~/session.server";
import { getUserPosts } from "~/models/post.server";

import FriendHeader from "~/components/FriendHeader";

import {
  followUser,
  unfollowUser,
  getFollowing,
} from "~/models/userFollow.server";

import InfiniteScroll from "react-infinite-scroll-component";

import { useState, useEffect } from "react";
import invariant from "tiny-invariant";

import PostModal from "~/components/PostModal";

// export const meta: MetaFunction = ({ data }) => {
//   return [
//     {
//       title: `MyFilmFriends | ${data.friend.username}`,
//       description: "A community for photography lovers.",
//     },
//   ];
// };

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  console.log("Loader function called");
  const userId = await requireUserId(request);
  const friend = await getUserByUsername(params.username);

  invariant(friend, "Friend not found");

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") || "15");

  // Fetch user's posts with pagination
  const posts = await getUserPosts(friend.id, page, pageSize);

  // console.log("Posts:", posts);

  // Check if the user is following the friend
  const followingList = await getFollowing(userId);

  const isFollowing = followingList.some(
    (following) => following.followedUser.id === friend.id,
  );

  return {
    posts,
    friend,
    isFollowing,
    page,
    pageSize,
    hasNextPage: posts.length === pageSize, // If we fetched the full pageSize, there might be a next page
  };
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

export default function UserPage() {
  const { posts, friend, isFollowing, pageSize, hasNextPage } = useLoaderData();

  const fetcher = useFetcher();
  const [allPosts, setAllPosts] = useState(posts);
  const [hasMore, setHasMore] = useState(hasNextPage);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

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

  const openModal = (postId) => {
    console.log("Opening modal", postId);
    navigate(`/${friend.username}/${postId}`);
  };

  return (
    <main className="flex flex-col min-h-screen">
      <Header friendUsername={friend.username} />
      <div className=" flex flex-col">
        <section className="bg-white w-full h-full flex flex-col z-10 ">
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
              <div
                to={`${post.id}`}
                key={`${post.id}_allposts`}
                className="relative overflow-hidden pb-full z-0"
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
              </div>
            ))}
          </InfiniteScroll>
        </section>
      </div>
      <ControlBar />
    </main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <ErrorBoundaryGeneral page="user" />;
  }
  return <ErrorBoundaryGeneral page="user" />;
}

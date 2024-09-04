import {
  useLoaderData,
  Form,
  useFetcher,
  useSearchParams,
  Link,
  useParams,
} from "@remix-run/react";
import { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { getMonthlyTopPosts, deletePost } from "~/models/post.server";
import { requireUser } from "~/session.server";
import { RiDeleteBin5Line } from "react-icons/ri";

import { useNavigate } from "@remix-run/react";

import InfiniteScroll from "react-infinite-scroll-component";

import dune from "~/images/dunes.jpg";

function FullScreenImageModal({
  currentImage,
  currentIndex,
  posts,
  onClose,
  setCurrentIndex,
}) {
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentIndex < posts.length - 1) {
      setCurrentIndex(currentIndex + 1);
      navigate(`?view=post&id=${posts[currentIndex + 1].id}`, { replace: true });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      navigate(`?view=post&id=${posts[currentIndex - 1].id}`, { replace: true });
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowRight") {
        handleNext();
      } else if (event.key === "ArrowLeft") {
        handlePrevious();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNext, handlePrevious, onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        role="button"
        tabIndex={0}
        aria-label="Image modal"
      >
        {currentIndex > 0 && (
          <button
            className="absolute left-4 text-white"
            onClick={handlePrevious}
            aria-label="Previous image"
          >
            &lt; Prev
          </button>
        )}

        <img src={currentImage} alt="Post" className="max-w-full max-h-full" />

        {currentIndex < posts.length - 1 && (
          <button
            className="absolute right-4 text-white"
            onClick={handleNext}
            aria-label="Next image"
          >
            Next &gt;
          </button>
        )}
      </div>

      <button
        className="absolute top-4 right-4 text-white"
        onClick={onClose}
        aria-label="Close modal"
      >
        Close
      </button>
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Monthly Top Posts",
      description: "A community for photography lovers.",
    },
  ];
};

export async function loader({ request }) {
  const user = await requireUser(request);
  console.log("LOADER", user);

  const url = new URL(request.url);
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const limit = parseInt(url.searchParams.get("limit") || "15");

  const posts = await getMonthlyTopPosts(offset / limit + 1, limit);

  // console.log("Posts", posts);

  return { posts, user, limit };
}

export async function action({ request }) {
  const formData = await request.formData();
  const postId = formData.get("postId");

  console.log("Deleting post", postId);
  await deletePost(postId);
  return null;
}

export default function Monthly() {
  const { posts, user, limit } = useLoaderData();
  const [currentIndex, setCurrentIndex] = useState(null);
  const [allPosts, setAllPosts] = useState(posts);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(posts.length);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetcher = useFetcher();
  const navigate = useNavigate();

  const fetchMoreData = () => {
    fetcher.load(`/explore/monthly?offset=${offset}&limit=${limit}`);
  };

  useEffect(() => {
    if (fetcher.data && fetcher.data.posts) {
      if (fetcher.data.posts.length < limit) {
        setHasMore(false);
      }
      setAllPosts((prevPosts) => [...prevPosts, ...fetcher.data.posts]);
      setOffset((prevOffset) => prevOffset + fetcher.data.posts.length);
    }
  }, [fetcher.data]);

  // Handle initial load based on URL params
  useEffect(() => {
    const postId = searchParams.get("id");
    if (postId) {
      const index = allPosts.findIndex((post) => post.id === postId);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [searchParams, allPosts]);

  const handleImageClick = (index) => {
    setCurrentIndex(index);
    navigate(`?view=post&id=${allPosts[index].id}`, { replace: true });
  };

  const handleCloseModal = () => {
    setCurrentIndex(null);
    navigate(`?view=post`, { replace: true });
  };

  return (
    <section className="bg-white w-full h-full justify-center z-0">
      <InfiniteScroll
        className="grid grid-cols-3 gap-1 max-w-2xl mx-auto z-0"
        dataLength={allPosts.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={
          <div className="flex w-full flex-col gap-4">
            <div className="skeleton size-full"></div>
          </div>
        }
        refreshFunction={fetchMoreData}
      >
        {allPosts.map((post, index) => (
          <div className="relative overflow-hidden z-0" key={post.id}>
            <div className="relative shadow-md overflow-hidden pb-full aspect-square">
              <button onClick={() => handleImageClick(index)}>
                <img
                  src={post.imageUrl || dune}
                  alt={post.content}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </button>
            </div>
            <div className="absolute top-2 right-2 p-2 indicator-item badge badge-neutral text-white ">
              {post.voteCount}
            </div>
          </div>
        ))}
      </InfiniteScroll>

      {currentIndex !== null && (
        <FullScreenImageModal
          currentImage={allPosts[currentIndex].imageUrl}
          currentIndex={currentIndex}
          posts={allPosts}
          onClose={handleCloseModal}
          setCurrentIndex={setCurrentIndex}
        />
      )}
    </section>
  );
}

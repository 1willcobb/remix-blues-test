import { useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { RiArrowLeftSFill, RiArrowRightSFill } from "react-icons/ri";

import Post from "./Post";

function PostModal({ post, onClose, onNext, onPrev }) {
  const fetcher = useFetcher();

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <dialog id="my_modal_1" className="modal modal-open">
      <div className="modal-box flex p-0 h-full max-w-full">
        <fetcher.Form
          method="post"
          className="flex justify-center bg-slate-300 bg-opacity-20 hover:bg-opacity-60  hover:text-white w-1/12 py-52 rounded-r-full sm:rounded-full"
        >
          <button type="submit">
            <RiArrowLeftSFill className="size-16 " />
          </button>
        </fetcher.Form>
        <Post
          mediaUrl={post.imageUrl}
          id={post.id}
          content={post.content}
          username={post.user.username}
          createdAt={post.createdAt}
          likes={post.likeCount}
          comments={post.commentCount}
        />

        <fetcher.Form
          method="post"
          className="flex justify-center bg-slate-300 bg-opacity-20 hover:bg-opacity-60  hover:text-white w-1/12 py-52 rounded-l-full sm:rounded-full"
        >
          <button type="submit">
            <RiArrowRightSFill className="size-16 " />
          </button>
        </fetcher.Form>
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

export default PostModal;

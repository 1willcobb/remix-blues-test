import { useFetcher, NavLink } from "@remix-run/react";
import {
  RiHeartLine,
  RiHeartFill,
  RiChat3Line,
  RiChat3Fill,
  RiThumbUpLine,
  RiThumbUpFill,
} from "react-icons/ri";

export default function Post(post) {
  const fetcher = useFetcher();

  const {
    id,
    imageUrl,
    content,
    likeCount,
    voteCount,
    commentCount,
    user,
    createdAt,
    userLiked,
    userVoted,
    camera,
  } = post.post;

  console.log(post.post)

  return (
    <div className="p-3 flex flex-col justify-center">
      <img src={imageUrl} alt={content} className=" shadow-xl" />
      <div className="flex items-center">
        <fetcher.Form
          method="post"
          className="flex gap-4 p-1 px-3 items-center"
        >
          <input type="hidden" name="postId" value={id} />
          <input type="hidden" name="like" value="like" />
          {likeCount === 0 ? (
            <>
              <button>
                <RiHeartLine className="size-6" />
              </button>
            </>
          ) : (
            <div className="indicator">
              <span className="indicator-item badge badge-ghost">
                {likeCount}
              </span>
              <button>
                {userLiked ? (
                  <RiHeartFill className="size-6 text-red-300" />
                ) : (
                  <div>
                    <RiHeartLine className="size-6" />
                  </div>
                )}
              </button>
            </div>
          )}
        </fetcher.Form>

        <fetcher.Form method="post" className="flex items-center">
          <input type="hidden" name="postId" value={id} />
          <input type="hidden" name="comment" value="comment" />
          {commentCount === 0 ? (
            <button>
              <RiChat3Line className="size-6" />
            </button>
          ) : (
            <div className="indicator">
              <span className="indicator-item badge badge-ghost">
                {commentCount}
              </span>
              <button>
                <RiChat3Line className="size-6" />
              </button>
            </div>
          )}
        </fetcher.Form>
        <fetcher.Form method="post" className="flex items-center">
          <input type="hidden" name="postId" value={id} />
          <input type="hidden" name="vote" value="vote" />
          {voteCount === 0 ? (
            <button className="flex items-center gap-1 border-2 p-1 rounded-xl">
              <RiThumbUpLine className="size-5" />
              <p>vote</p>
            </button>
          ) : (
            <div className="indicator">
              <span className="indicator-item badge badge-ghost">
                {voteCount}
              </span>
              {userVoted ? (
                <button className="flex items-center gap-1 border-2 p-1 rounded-xl ">
                  <RiThumbUpLine className="size-5" />
                  <p>vote</p>
                </button>
              ) : (
                <button className="flex items-center gap-1 border-2 p-1 rounded-xl">
                  <RiThumbUpLine className="size-5 " />
                  <p>vote</p>
                </button>
              )}
            </div>
          )}
        </fetcher.Form>
      </div>

      <div className="flex flex-col px-3">
        <div className="flex ">
          <h2>
            <NavLink
              prefetch="intent"
              to={`/${user.username}`}
              className=" text-xl font-extrabold"
            >
              {user.displayName}
            </NavLink>
            <p>{camera}</p>
            <p>{content}</p>
          </h2>
        </div>
        <p className="text-xs font-thin">{createdAt}</p>

        {/* <ul>
          {comments.map((id) => (
            <li key={id}>
              <p>{id}</p>
            </li>
          ))}
        </ul> */}
      </div>
    </div>
  );
}

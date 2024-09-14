import { useFetcher, NavLink } from "@remix-run/react";
import {
  RiHeartLine,
  RiHeartFill,
  RiChat3Line,
  RiChat3Fill,
  RiThumbUpLine,
  RiThumbUpFill,
} from "react-icons/ri";
import { useState } from "react";

import { dateConverter } from "~/utils";

import Comments from "./Comments";

export default function Post(post, userId) {
  const fetcher = useFetcher();
  const [showFullContent, setShowFullContent] = useState(false);
  const [showComments, setShowComments] = useState(false);

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
    comments,
  } = post.post;

  return (
    <div className="p-3 flex flex-col justify-center gap-2">
      <img src={imageUrl} alt={content} className=" shadow-xl" />
      <div className="flex items-center gap-2">
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
            <button onClick={() => setShowComments(!showComments)}>
              {showComments ? (
                <RiChat3Fill className="size-6" />
              ) : (
                <RiChat3Line className="size-6" />
              )}
            </button>
          ) : (
            <div className="indicator">
              <span className="indicator-item badge badge-ghost">
                {commentCount}
              </span>
              <button onClick={() => setShowComments(!showComments)}>
                {showComments ? (
                  <RiChat3Fill className="size-6" />
                ) : (
                  <RiChat3Line className="size-6" />
                )}
              </button>
            </div>
          )}
        </fetcher.Form>
        <fetcher.Form method="post" className="flex items-center">
          <input type="hidden" name="postId" value={id} />
          <input type="hidden" name="vote" value="vote" />
          {voteCount === 0 ? (
            <button className="flex items-center gap-1 border-2 p-1 rounded-xl">
              <RiThumbUpLine className="size-4" />
              <p>vote</p>
            </button>
          ) : (
            <div className="indicator">
              <span className="indicator-item badge badge-ghost">
                {voteCount}
              </span>
              {userVoted ? (
                <button className="flex items-center gap-1 border-2 p-1 rounded-xl bg-green-200">
                  <RiThumbUpFill className="size-4" />
                  <p>vote</p>
                </button>
              ) : (
                <button className="flex items-center gap-1 border-2 p-1 rounded-xl">
                  <RiThumbUpLine className="size-4 " />
                  <p>vote</p>
                </button>
              )}
            </div>
          )}
        </fetcher.Form>
      </div>

      <div className="flex flex-col px-3">
        <div className="flex ">
          <div>
            <NavLink
              prefetch="intent"
              to={`/${user.username}`}
              className=" text-xl font-extrabold"
            >
              {user.displayName}
            </NavLink>
            <p className="text-xs font-thin">{dateConverter(createdAt)}</p>
            <p>{camera}</p>
            <p>
              {content.length > 100 && !showFullContent
                ? `${content.substring(0, 100)}...`
                : content}
            </p>
            {content.length > 100 ? (
              <button
                onClick={() => setShowFullContent(!showFullContent)}
                className="text-teal-400"
              >
                {showFullContent ? "less" : "more"}
              </button>
            ) : null}
          </div>
        </div>

        {showComments ? (
          <Comments
            comments={comments}
            entityId={id}
            userId={userId}
            entityType="post"
          />
        ) : null}
      </div>
    </div>
  );
}

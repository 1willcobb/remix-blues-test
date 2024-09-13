import { useFetcher, NavLink } from "@remix-run/react";
import {
  RiHeartLine,
  RiHeartFill,
  RiChat3Line,
  RiChat3Fill,
  RiThumbUpLine,
  RiThumbUpFill,
} from "react-icons/ri";

import { dateConverter } from "~/utils";

export default function Post({
  mediaUrl,
  id,
  username,
  content,
  likes,
  comments,
  votes,
  createdAt,
}) {
  const fetcher = useFetcher();

  return (
    <div className="p-3 flex flex-col justify-center">
      <img src={mediaUrl} alt={content} className=" shadow-xl" />
      <fetcher.Form method="post" className="flex gap-4 p-1 px-3">
        <input type="hidden" name="postSk" value={id} />
        <div className="indicator">
          <span className="indicator-item badge badge-secondary">{likes}</span>
          <button>
            <RiHeartLine className="size-6" />
          </button>
        </div>
        <div className="indicator">
          <span className="indicator-item badge badge-secondary">
            {comments}
          </span>
          <button>
            <RiChat3Line className="size-6" />
          </button>
        </div>

        <button>
          <RiThumbUpLine className="size-6" />
        </button>
      </fetcher.Form>
      <div className="flex flex-col px-3">
        <div className="flex ">
          <h2>
            <span>
              <NavLink
                prefetch="intent"
                to={`/${username}`}
                className=" text-xl font-extrabold"
              >
                {username}
                {"  "}
              </NavLink>
            </span>
            {content}
          </h2>
        </div>
        <p className="text-xs font-thin">{dateConverter(createdAt)}</p>

        <p hidden>{comments}</p>
      </div>
    </div>
  );
}

import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { loadCommentsForEntity, handleCommentActions } from "~/utils/comments.server";
import { Comments } from "~/components/Comments";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  return loadCommentsForEntity(params.id, "blog", request);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  return handleCommentActions(request, params, "blog");
};

export default function BlogPost() {
  const { entity: blog, userId, userLikedEntity: userLikedBlog } = useLoaderData();

  return (
    <div>
      <h1>{blog.title}</h1>
      <p>by {blog.author.username}</p>
      <p>{new Date(blog.createdAt).toLocaleDateString()}</p>
      <div>
        <p>{blog.content}</p>
      </div>

      <div>
        <Comments
          comments={blog.comments}
          entityId={blog.id}
          userId={userId}
          entityType="blog"
        />
      </div>
    </div>
  );
}

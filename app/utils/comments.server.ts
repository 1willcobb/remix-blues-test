// app/utils/comments.server.ts

import { json, redirect } from "@remix-run/node";
import { createComment, deleteComment } from "~/models/comment.server";
import { getBlogById } from "~/models/blog.server";
import { getPostById } from "~/models/post.server";
import { createLike, deleteLike, hasUserLiked } from "~/models/like.server";
import { requireUserId } from "~/session.server";

// Utility function for comment-related loading
export async function loadCommentsForEntity(entityId: string, entityType: "blog" | "post", request: Request) {
  const userId = await requireUserId(request);

  const entity = await (entityType === "blog"
    ? getBlogById(entityId)
    : getPostById(entityId)); // Assuming you have getPostById

  if (!entity) {
    throw new Response("Entity not found", { status: 404 });
  }

  const userLikedEntity = await hasUserLiked({ userId, [entityType === "blog" ? "blogId" : "postId"]: entityId });

  return json({ entity, userId, userLikedEntity });
}

// Utility function for comment-related actions
export async function handleCommentActions(
  request: Request,
  params: { id?: string },
  entityType: "blog" | "post"
) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const actionType = formData.get("_action");
  const entityId = params.id;

  if (!entityId) {
    throw new Response("Entity ID not provided", { status: 400 });
  }

  switch (actionType) {
    case "addComment": {
      const content = formData.get("content");
      if (typeof content !== "string" || content.length === 0) {
        return json({ error: "Comment content is required" }, { status: 400 });
      }
      await createComment({ content, userId, [entityType === "blog" ? "blogId" : "postId"]: entityId });
      return redirect(`/${entityType}/${entityId}`);
    }

    case "deleteComment": {
      const commentId = formData.get("commentId");
      if (typeof commentId !== "string") {
        return json({ error: "Comment ID is required" }, { status: 400 });
      }
      await deleteComment(commentId, undefined, entityType === "blog" ? entityId : undefined);
      return redirect(`/${entityType}/${entityId}`);
    }

    case `like${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`: {
      await createLike({ userId, [entityType === "blog" ? "blogId" : "postId"]: entityId });
      return redirect(`/${entityType}/${entityId}`);
    }

    case `unlike${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`: {
      const likeId = formData.get("likeId");
      if (typeof likeId !== "string") {
        return json({ error: "Like ID is required" }, { status: 400 });
      }
      await deleteLike(likeId, undefined, undefined, entityType === "blog" ? entityId : undefined);
      return redirect(`/${entityType}/${entityId}`);
    }

    case "likeComment": {
      const commentId = formData.get("commentId");
      await createLike({ userId, commentId });
      return redirect(`/${entityType}/${entityId}`);
    }

    case "unlikeComment": {
      const likeId = formData.get("likeId");
      if (typeof likeId !== "string") {
        return json({ error: "Like ID is required" }, { status: 400 });
      }
      await deleteLike(likeId, undefined, commentId);
      return redirect(`/${entityType}/${entityId}`);
    }

    default:
      return json({ error: "Invalid action" }, { status: 400 });
  }
}

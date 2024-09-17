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

export async function handleCommentActions(
  request: Request,
  entityId: string,
  entityType: "blog" | "post",
  formData: FormData
) {
  const userId = await requireUserId(request);
  const actionType = formData.get("_action");

  // Logging for debugging
  console.log("Entity ID:", entityId);
  console.log("Entity Type:", entityType);
  console.log("Action Type:", actionType);

  // Ensure that the entityId is provided
  if (!entityId) {
    console.error("Entity ID not provided.");
    throw new Response("Entity ID not provided", { status: 400 });
  }

  // Ensure that actionType exists and is valid
  if (!actionType) {
    return json({ error: "Action type is required" }, { status: 400 });
  }

  // Switch between actions based on actionType and entityType (blog or post)
  switch (actionType) {
    case "addComment": {
      const content = formData.get("content");
      if (typeof content !== "string" || content.trim().length === 0) {
        return json({ error: "Comment content is required" }, { status: 400 });
      }

      console.log(`Adding comment to ${entityType} with ID: ${entityId}`);

      // Create comment for blog or post
      await createComment({
        content,
        userId,
        [entityType === "blog" ? "blogId" : "postId"]: entityId, // Dynamically connect to blogId or postId
      });

      return redirect(`/${entityType}/${entityId}`);
    }

    case "deleteComment": {
      const commentId = formData.get("commentId");
      if (typeof commentId !== "string") {
        return json({ error: "Comment ID is required" }, { status: 400 });
      }

      console.log(`Deleting comment with ID: ${commentId} for ${entityType}`);

      await deleteComment(
        commentId,
        undefined,
        entityType === "blog" ? entityId : undefined // Handle deletion based on entityType
      );

      return redirect(`/${entityType}/${entityId}`);
    }

    case `like${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`: {
      console.log(`Liking ${entityType} with ID: ${entityId}`);

      // Create like for blog or post
      await createLike({
        userId,
        [entityType === "blog" ? "blogId" : "postId"]: entityId,
      });

      return redirect(`/${entityType}/${entityId}`);
    }

    case `unlike${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`: {
      const likeId = formData.get("likeId");
      if (typeof likeId !== "string") {
        return json({ error: "Like ID is required" }, { status: 400 });
      }

      console.log(`Unliking ${entityType} with like ID: ${likeId}`);

      await deleteLike(
        likeId,
        undefined,
        undefined,
        entityType === "blog" ? entityId : undefined // Handle unlike for blog or post
      );

      return redirect(`/${entityType}/${entityId}`);
    }

    case "likeComment": {
      const commentId = formData.get("commentId");
      if (typeof commentId !== "string") {
        return json({ error: "Comment ID is required" }, { status: 400 });
      }

      console.log(`Liking comment with ID: ${commentId}`);

      await createLike({ userId, commentId }); // Create like for a specific comment
      return redirect(`/${entityType}/${entityId}`);
    }

    case "unlikeComment": {
      const likeId = formData.get("likeId");
      const commentId = formData.get("commentId");
      if (typeof likeId !== "string" || typeof commentId !== "string") {
        return json({ error: "Like ID and Comment ID are required" }, { status: 400 });
      }

      console.log(`Unliking comment with ID: ${commentId} and like ID: ${likeId}`);

      await deleteLike(likeId, undefined, undefined, undefined, commentId); // Delete like for a specific comment
      return redirect(`/${entityType}/${entityId}`);
    }

    default:
      return json({ error: "Invalid action" }, { status: 400 });
  }
}


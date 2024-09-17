import type { Comment, Like } from "@prisma/client";
import { useFetcher } from "@remix-run/react";

interface CommentsProps {
  comments: Array<Comment & { likes: Like[]; user: { username: string } }>;
  entityId: string; // This could be blogId or postId
  userId: string;
  entityType: "blog" | "post"; // Specify whether it's a blog or post
}

export default function Comments({
  comments,
  entityId,
  userId,
  entityType,
}: CommentsProps) {
  const fetcher = useFetcher();

  return (
    <div>
      <h3>Comments</h3>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>
            <p>
              <strong>{comment.user.username}</strong>: {comment.content}
            </p>
            <p>{new Date(comment.createdAt).toLocaleDateString()}</p>
            <div>
              {comment.userId === userId ? (
                <fetcher.Form method="post">
                  <input type="hidden" name="_action" value="deleteComment" />
                  <input type="hidden" name="commentId" value={comment.id} />
                  <button type="submit" disabled={comment.userId !== userId}>
                    Delete
                  </button>
                </fetcher.Form>
              ) : null}
              <fetcher.Form method="post">
                <input
                  type="hidden"
                  name="_action"
                  value={
                    comment.likes?.some((like) => like.userId === userId)
                      ? "unlikeComment"
                      : "likeComment"
                  }
                />
                {comment.likes?.some((like) => like.userId === userId) ? (
                  <input
                    type="hidden"
                    name="likeId"
                    value={
                      comment.likes.find((like) => like.userId === userId)?.id
                    }
                  />
                ) : null}
                <input type="hidden" name="commentId" value={comment.id} />
                <button type="submit">
                  {comment.likes?.some((like) => like.userId === userId)
                    ? "Unlike"
                    : "Like"}{" "}
                  ({comment.likeCount} Likes)
                </button>
              </fetcher.Form>
            </div>
          </li>
        ))}
      </ul>
      <fetcher.Form method="post">
        <input type="hidden" name="_action" value="addComment" />
        <textarea name="content" placeholder="Add a comment..." required />
        <input type="hidden" name={`${entityType}Id`} value={entityId} />
        <input type="hidden" name="newComment" value="newComment" />
        <button type="submit">Submit</button>
      </fetcher.Form>
    </div>
  );
}

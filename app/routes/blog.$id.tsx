import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  loadCommentsForEntity,
  handleCommentActions,
} from "~/utils/comments.server";
import Comments from "~/components/Comments";

import { MDXProvider } from "@mdx-js/react";

import { ClientOnly } from "remix-utils/client-only";

import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  quotePlugin,
} from "~/components/editor.client";

// import { compile } from "@mdx-js/mdx";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  return loadCommentsForEntity(params.id, "blog", request);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  return handleCommentActions(request, params.id, "blog", formData);
};

export default async function BlogPost() {
  const {
    entity: blog,
    userId,
    userLikedEntity: userLikedBlog,
  } = useLoaderData();

  // const compiled = await compile(blog.content);

  // console.log(String(compiled));

  return (
    <div>
      <h1>{blog.title}</h1>
      <p>by {blog.author.username}</p>
      <p>{new Date(blog.createdAt).toLocaleDateString()}</p>

      {/* <ClientOnly fallback={<p>Loading...</p>}>
        {() => (
          <MDXEditor
            markdown={blog.content}
            className="prose"
            readOnly={true}
            plugins={[
              headingsPlugin(),
              listsPlugin(),
              linkPlugin(),
              quotePlugin(),
            ]}
          />
        )}
      </ClientOnly> */}
      <p>{blog.content}</p>

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

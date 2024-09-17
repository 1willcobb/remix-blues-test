import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useTransition, useState } from "react";
import { createBlog } from "~/models/blog.server";
import { requireUserId } from "~/session.server";
import { ClientOnly } from "remix-utils/client-only";
import {
  MDXEditor,
  headingsPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  toolbarPlugin,
  listsPlugin,
  linkPlugin,
  quotePlugin,
  markdownShortcutPlugin,
} from "~/components/editor.client";

// Action to handle blog creation
export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const title = formData.get("title");
  const subtitle = formData.get("subtitle");
  const content = formData.get("content");
  const authorId = await requireUserId(request);

  // Validate form inputs
  if (typeof title !== "string" || title.length === 0) {
    return json({ error: "Title is required" }, { status: 400 });
  }
  if (typeof content !== "string" || content.length === 0) {
    return json({ error: "Content is required" }, { status: 400 });
  }

  // Create the blog in the database
  await createBlog({
    title,
    subtitle: subtitle || "",
    content,
    authorId,
  });

  return redirect("/blog"); // Redirect after creation
};

// NewBlog component
export default function NewBlog() {
  const actionData = useActionData();
  const transition = useTransition();
  const [markdown, setMarkdown] = useState(""); // State to store markdown content

  // Function to handle changes in the editor
  const handleContentChange = (content: string) => {
    setMarkdown(content); // Update the markdown state
  };

  return (
    <div className="card bg-base-100 w-96 shadow-xl">
      <Form method="POST" className="flex flex-col card-body">
        <div>
          <label htmlFor="title">Title</label>
          <input type="text" id="title" name="title" required />
        </div>

        <div>
          <label htmlFor="subtitle">Subtitle</label>
          <input type="text" id="subtitle" name="subtitle" />
        </div>

        <div className="flex flex-col">
          <ClientOnly fallback={<p>Loading...</p>}>
            {() => (
              <MDXEditor
                markdown={markdown}
                onChange={handleContentChange} // Capture the content change
                className="prose"
                plugins={[
                  headingsPlugin(),
                  listsPlugin(),
                  linkPlugin(),
                  quotePlugin(),
                  markdownShortcutPlugin(),
                  toolbarPlugin({
                    toolbarContents: () => (
                      <>
                        <UndoRedo />
                        <BoldItalicUnderlineToggles />
                      </>
                    ),
                  }),
                ]}
              />
            )}
          </ClientOnly>
          <input type="hidden" name="content" value={markdown} />
        </div>

        {actionData?.error && (
          <p style={{ color: "red" }}>{actionData.error}</p>
        )}

        <button
          type="submit"
          disabled={transition.state === "submitting"}
          className="btn btn-primary btn-sm"
        >
          {transition.state === "submitting" ? "Creating..." : "Create Blog"}
        </button>
      </Form>
    </div>
  );
}

import {
  isRouteErrorResponse,
  useRouteError,
  useActionData,
  Link,
  Form,
  useRouteLoaderData,
} from "@remix-run/react";

import { useState } from "react";

import { sendEmail } from "~/utils/mailgun.server";
import { render } from "@react-email/render";

import TipTap from "~/components/TipTap";

export const action = async ({ request }) => {
  try {
    const formData = await request.formData();
    const email = formData.get("email");
    const html = formData.get("content");
    console.log("sending email");
    console.log(email);
    console.log(html);

    const htmlsend = await render(html, {
      pretty: true,
    });

    await sendEmail({
      to: email,
      subject: "Password Reset",
      html: htmlsend,
    });

    return { message: "Email Sent" }; // or return a meaningful response like json({ success: true })
  } catch (error) {
    console.error("Error sending email:", error);
    // Handle the error appropriately, for example, by returning a response with an error message
    return new Response("Failed to send email", { status: 500 });
  }
};

export default function Emailer() {
  const data = useActionData();
  const { userId } = useRouteLoaderData("root");
  const [content, setContent] = useState("");

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="relative mx-auto w-full max-w-md px-8">
        <Form method="post">
          <label>
            Email
            <input type="email" name="email" required />
          </label>
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="content" value={content} />
          <TipTap content={content} setContent={setContent} />
          <button type="submit">Create Post</button>
        </Form>
        {data ? <p>Check email for password reset</p> : null}
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <Link to="/" role="alert" className="alert alert-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Error! Something went wrong. Click to return</span>
      </Link>
    );
  }
  return (
    <Link to="/" className="toast toast-top toast-end">
      <div className="alert alert-info">
        <span>Error! Something went wrong. Click to return</span>
      </div>
    </Link>
  );
}

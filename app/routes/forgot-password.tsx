import {
  isRouteErrorResponse,
  useRouteError,
  useActionData,
  Link,
  Form,
  useRouteLoaderData,
} from "@remix-run/react";

import { requestPasswordReset } from "~/models/password.server";
import { sendEmail } from "~/utils/mailgun.server";
import { render } from "@react-email/render";
import ResetEmail from "~/emails/resetEmail";

import dunes from "~/images/dunes.jpg"; 


export const action = async ({ request }) => {
  try {
    const formData = await request.formData();
    const email = formData.get("email");
    const userId = formData.get("userId");
    console.log("sending email");
    console.log(email, userId);

    const token = await requestPasswordReset(email);

    let resetUrl;
    if (process.env.NODE_ENV === "development") {
      resetUrl = `http://localhost:3000/reset-password?token=${token}`;
    } else if (process.env.NODE_ENV === "staging") {
      resetUrl = `https://remix-blues-testing-staging.fly.dev/?token=${token}`;
    } else {
      resetUrl = `https://remix-blues-testing.fly.dev/?token=${token}`;
    }
  

    const htmlsend = await render(<ResetEmail link={resetUrl} />, {
      pretty: true,
    });

    await sendEmail({
      to: email,
      subject: "Password Reset",
      html: htmlsend,
    });

    console.log(`Send reset email to ${email}: ${resetUrl}`);

    return { message: "Email Sent" }; // or return a meaningful response like json({ success: true })
  } catch (error) {
    console.error("Error sending email:", error);
    // Handle the error appropriately, for example, by returning a response with an error message
    return new Response("Failed to send email", { status: 500 });
  }
};

export default function ForgotPassword() {
  const data = useActionData();
  const { userId } = useRouteLoaderData("root")

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="absolute h-screen md:inset-0">
        <img
          className="h-full w-full object-cover"
          src={dunes}
          alt="Dunes in Pismo Beach, California"
        />
      </div>
      <div className="relative mx-auto w-full max-w-md px-8">
        <h1 className="text-center font-extrabold text-3xl uppercase text-red-500 drop-shadow-m">
          Crap, I forgot my password...
        </h1>
        <Form method="post">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
          />
          <input type="hidden" name="userId" value={userId} />
          <div className="w-full inline-grid grid-cols-2 gap-5 space-y-0 mt-4">
            <Link to="/" className="btn bg-base-300 w-full">
              Cancel
            </Link>
            <button className="btn btn-neutral w-full mt-3" type="submit">
              Reset
            </button>
          </div>
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

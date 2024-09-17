import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import dunes from "~/images/dunes.jpg";

import {getPasswordResetToken, resetPassword} from "~/models/password.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return redirect("/");
  }

  const result = await getPasswordResetToken(token);

  return {result};
}

export async function action({ request }) {
  const formData = await request.formData();
  const url = new URL(request.url);

  // Extract the token from the query parameter
  const token = url.searchParams.get("token");
  const password = formData.get("password");

  console.log('token', token);
  console.log('password', password);

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return json(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 },
    );
  }

  try {
    console.log('resetting password');
    await resetPassword(token, password);
    return redirect("/login?success=password_reset");
  } catch (error) {
    console.error(error);
    return json({ error: error.message }, { status: 400 });
  }
}

export default function ResetPassword() {
  const actionData = useActionData();
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

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
          We all forget sometimes. Let's get you back in.
        </h1>
        <br/>
        <Form method="post">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            New Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              ref={passwordRef}
              name="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={actionData?.errors?.password ? true : undefined}
              aria-describedby="password-error"
              className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
            />
            {actionData?.errors?.password ? (
              <div className="pt-1 text-white" id="password-error">
                {actionData.errors.password}
              </div>
            ) : null}
          </div>
          <div className="w-full space-y-0 mt-4">
            <button className="btn btn-neutral w-full mt-3" type="submit">
              Reset Password
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

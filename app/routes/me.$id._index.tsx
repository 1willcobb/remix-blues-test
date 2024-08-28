

import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  Link,
  Form,
  useRouteLoaderData,
  useActionData,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import { useState, useRef, useEffect } from "react";

import ErrorBoundaryGeneral from "~/components/ErrorBoundaryGeneral";
import { updateUser, getUserByEmail, getUserByUsername } from "~/models/user.server";
import { requireUserIdForUserData, requireUserId } from "~/session.server";
import { validateEmail } from "~/utils";
import { compressAndUploadFile } from "~/utils/photoUploadUtils.server";


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const user = await requireUserIdForUserData(request, userId);

  console.log("Me Authenticated", user);

  return { user };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  console.log("formData", formData);

  const profilePictureUrl = formData.get("profilePictureUrl") as string;
  const username = formData.get("username") as string;
  const displayName = formData.get("displayName") as string;
  const email = formData.get("email") as string;
  const userBio = formData.get("userBio") as string;
  const userId = formData.get("userId") as string;
  const url = formData.get("url") as string;
  const altName = formData.get("altName") as string;

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 },
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser && existingUser.id !== userId) {
    return json(
      {
        errors: {
          email: "A user already exists with this email",
        },
      },
      { status: 400 },
    );
  }

  const existingUsername = await getUserByUsername(username);
  if (existingUsername && existingUsername.id !== userId) {
    return json(
      {
        errors: {
          username: "A user already exists with this username",
        },
      },
      { status: 400 },
    );
  }

  const updatedUser = await updateUser(userId, {
    profilePictureUrl,
    username,
    displayName,
    email,
    userBio,
    link: { url, altName },
  });

  console.log("updatedUser", updatedUser);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return redirect(`/${updatedUser?.username}`);
};

export default function Me() {
  const { user } = useRouteLoaderData("root");
  const actionData = useActionData<typeof action>();
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (file && isValidFileType(file)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      setLoading(false);
    }
  };

  const isValidFileType = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    return allowedTypes.includes(file.type);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
    setLoading(true);
  };

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.username) {
      usernameRef.current?.focus();
    }
  }, [actionData]);

  return (
    <section className="flex flex-col w-full">
      <div className="collapse collapse-arrow ">
        {!user.displayName ? (<input type="radio" name="my-accordion-2" defaultChecked />) : <input type="radio" name="my-accordion-2" />}
        
        <div className="collapse-title text-xl font-bold">Profile</div>
        <div className="collapse-content">
          <Form
            method="post"
            className="flex flex-col"
            onSubmit={() => setLoading(true)}
          >
            <div className=" flex justify-between items-center ml-3">
              {user.profilePictureUrl || filePreviewUrl ? (
                <img
                  src={
                    !filePreviewUrl ? user.profilePictureUrl : filePreviewUrl
                  }
                  alt={user.username}
                  className="rounded-full size-20"
                />
              ) : (
                <div className="rounded-full size-20 bg-gray-300"></div>
              )}
              <div>
                <input
                  type="file"
                  accept=".jpeg,.jpg,.png,image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <button
                  className="btn btn-neutral"
                  type="button"
                  onClick={triggerFileInput}
                >
                  Change Profile Image
                </button>
              </div>
            </div>

            <input
              type="hidden"
              name="profilePictureUrl"
              value={!filePreviewUrl ? user.profilePictureUrl : filePreviewUrl}
            />
            <input type="hidden" name="userId" value={user.id} />
            <div className="form-control">
              <label className="label">
                <span className="label-text text-xl font-semibold">
                  Username
                </span>
                <input
                  name="username"
                  type="text"
                  placeholder="Username"
                  className="input input-bordered"
                  defaultValue={`${user.username}`}
                />
              </label>
            </div>
            {actionData?.errors?.username ? (
              <div className="pt-1 text-red-700" id="username-error">
                {actionData.errors.username}
              </div>
            ) : null}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-xl font-semibold">
                  Display Name
                </span>
                <input
                  name="displayName"
                  type="text"
                  placeholder="Display Name"
                  className="input input-bordered"
                  defaultValue={`${user.displayName || ""}`}
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-xl font-semibold">Email</span>
                <input
                  name="email"
                  type="text"
                  placeholder="email"
                  className="input input-bordered"
                  defaultValue={`${user.email}`}
                />
              </label>
            </div>
            {actionData?.errors?.email ? (
              <div className="pt-1 text-red-700" id="email-error">
                {actionData.errors.email}
              </div>
            ) : null}
            <div className="flex flex-col">
              <label className="label flex-col">
                <span className="label-text text-xl font-semibold w-full">
                  Bio
                </span>
                <textarea
                  name="userBio"
                  placeholder="Bio"
                  className="input input-bordered w-full h-28"
                  maxLength={150}
                  defaultValue={user.userBio || ""}
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-xl font-semibold">
                  URL Alt Name{" "}
                </span>
                <input
                  name="altName"
                  type="text"
                  placeholder="Alt Title"
                  className="input input-bordered"
                  defaultValue={user.link?.altName || ""}
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-xl font-semibold">Link</span>
                <input
                  type="text"
                  name="url"
                  placeholder="URL Link"
                  className="input input-bordered"
                  defaultValue={user.link?.url || ""}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-neutral"
            >
              {loading ? "Loading..." : "Submit Changes"}
            </button>
          </Form>
        </div>
      </div>
      <div className="collapse collapse-arrow ">
        <input type="radio" name="my-accordion-2" />
        <div className="collapse-title text-xl font-bold">Settings</div>
        <div className="collapse-content">
          <div className="flex flex-col mx-2">
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text text-xl font-semibold">
                  This Doesn't Do Anything
                </span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  defaultChecked
                />
              </label>
            </div>
          </div>
          <div className="flex flex-col mx-2">
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text text-xl font-semibold">
                  This Doesn't Do Anything
                </span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  defaultChecked
                />
              </label>
            </div>
          </div>
          <div className="flex flex-col mx-2">
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text text-xl font-semibold">
                  This Doesn't Do Anything
                </span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  defaultChecked
                />
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="collapse collapse-arrow ">
        <input type="radio" name="my-accordion-2" />
        <div className="collapse-title text-xl font-bold">Payments</div>
        <div className="collapse-content">
          <p>Comming Soon</p>
          <p>This app is projected to cost $5 a Month.</p>
          <p>
            This is due to hosting photos and the app and updating it with new
            features.
          </p>
          <p>Thank you for supporting this solo-dev journey.</p>
          <p>- Will</p>
        </div>
      </div>
      <div className="collapse collapse-arrow ">
        <input type="radio" name="my-accordion-2" />
        <div className="collapse-title text-xl font-bold">Security</div>
        <div className="collapse-content">
          <Link to={"/forgot-password"} className="btn btn-neutral w-full">
            Reset Password
          </Link>
        </div>
      </div>

      <Form
        action="/logout"
        method="post"
        className="sticky bottom-0 left-0 right-0 bg-white z-50"
      >
        <div className="m-3 ">
        <button type="submit" className="mx-auto btn btn-outline w-full">
          Logout
        </button>
        </div>
       
      </Form>
    </section>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <ErrorBoundaryGeneral page={"me settings"} />;
  }
  return <ErrorBoundaryGeneral page={"me settings"} />;
}

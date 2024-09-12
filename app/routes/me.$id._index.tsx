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
  useNavigate,
} from "@remix-run/react";
import { useState, useRef, useEffect } from "react";

import ErrorBoundaryGeneral from "~/components/ErrorBoundaryGeneral";
import {
  updateUser,
  getUserByEmail,
  getUserByUsername,
} from "~/models/user.server";
import { requireUserIdForUserData, requireUserId } from "~/session.server";
import { validateEmail } from "~/utils";
import { uploadFile } from "~/utils/photoUploadUtils.server";

import { compressFile } from "~/utils/imageCompresser";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const user = await requireUserIdForUserData(request, userId);

  console.log("Me Authenticated", user);

  return { user };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  console.log("formData", formData);

  const media = formData.get("profileImage") as string;
  const imageChanged = formData.get("imageChanged") as string;
  const profileImageNew = formData.get("profileImageNew") as string;

  const username = formData.get("username") as string;
  const displayName = formData.get("displayName") as string;
  const email = formData.get("email") as string;
  const userBio = formData.get("userBio") as string;
  const userId = formData.get("userId") as string;
  const link = formData.get("url") as string;
  const linkAltName = formData.get("altName") as string;

  console.log("media", typeof media, media);

  let profileImage = media ? media.name : null; // Check if the media file exists
  if (imageChanged === "true" && media) {
    console.log("Image changed");
    profileImage = await uploadFile(media); // Pass the actual File object directly
  } else {
    console.log("Image not changed");
  }

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
    profileImage,
    username,
    displayName,
    email,
    userBio,
    link,
    linkAltName,
  });

  console.log("updatedUser", updatedUser);

  return redirect(`/${updatedUser?.username}`);
};

export default function Me() {
  const { user } = useRouteLoaderData("root");
  const actionData = useActionData<typeof action>();
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Handle file change and compression
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    console.log("File selected:", file);
    if (file && isValidFileType(file)) {
      try {
        const { compressedFile } = await compressFile(file);
        setCompressedFile(compressedFile);

        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);
        console.log("compressedFile ", compressedFile);
        setLoading(false);
        setImageChanged(true);
      } catch (error) {
        console.error("Error compressing file:", error);
      }
    }
  };

  const isValidFileType = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    return allowedTypes.includes(file.type);
  };

  const triggerFileInput = async () => {
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = formRef.current!;
    const formData = new FormData(form);

    if (compressedFile) {
      formData.delete("profileImage");
      formData.append("profileImage", compressedFile);
    }

    form.submit();

    setTimeout(() => {
      setLoading(false);
      navigate(`/${user.username}`);
    }, 500);
  };

  return (
    <section className="flex flex-col w-full">
      <div className="collapse collapse-arrow ">
        {!user.displayName ? (
          <input type="radio" name="my-accordion-2" defaultChecked />
        ) : (
          <input type="radio" name="my-accordion-2" />
        )}

        <div className="collapse-title text-xl font-bold">Profile</div>
        <div className="collapse-content">
          <Form
            method="post"
            className="flex flex-col"
            encType="multipart/form-data"
            onSubmit={handleSubmit}
            ref={formRef} // Reference the form
          >
            <div className=" flex justify-between items-center ml-3">
              {user.profileImage || filePreviewUrl ? (
                <img
                  src={!filePreviewUrl ? user.profileImage : filePreviewUrl}
                  alt={user.username}
                  className="rounded-full size-20"
                />
              ) : (
                <div className="rounded-full size-20 bg-gray-300"></div>
              )}
              <div>
                <input
                  type="file"
                  name="profileImage" // Important: This should match in the `action`
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
              name="imageChanged"
              value={imageChanged.toString()}
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
                  defaultValue={user.linkAltName || ""}
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
                  defaultValue={user.link || ""}
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

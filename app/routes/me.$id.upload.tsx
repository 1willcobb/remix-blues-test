import {
  Form,
  useParams,
  Link,
  useNavigate,
  useLoaderData,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import { useState, useRef } from "react";
import { json, ActionFunction, redirect } from "@remix-run/node";


import { createPost } from "~/models/post.server";
import { requireUser } from "~/session.server";
import { uploadFile } from "~/utils/photoUploadUtils.server";

import { compressFile } from "~/utils/imageCompresser";

import ErrorBoundaryGeneral from "~/components/ErrorBoundaryGeneral";

// Server-side loader to require user
export const loader = async ({ request }) => {
  const user = await requireUser(request);
  return { user };
};

// Server-side action to handle form submission
export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);

  const formData = await request.formData();
  const caption = formData.get("caption") as string | null;
  const file = formData.get("file") as File; // Directly get the file

  console.log("Caption IN ACTION:", caption);
  console.log("File IN ACTION:", file);

  if (!file || !(file instanceof File)) {
    return json(
      { error: "No file uploaded or incorrect file type" },
      { status: 400 }
    );
  }

  try {
    const mediaUrl = await uploadFile(file);
    const post = await createPost({
      content: caption || "",
      imageUrl: mediaUrl,
      userId: user.id,
    });
    console.log("Post created:", post);
    return redirect(`/`);
  } catch (error) {
    console.error("Error creating post:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};

// Upload component for handling file selection and submission
export default function Upload() {
  const { id } = useParams();
  const { user } = useLoaderData();
  const [caption, setCaption] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCaptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCaption(event.target.value);
  };

  // Handle file change and compression
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      } catch (error) {
        console.error("Error compressing file:", error);
      }
    }
  };

  const isValidFileType = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    return allowedTypes.includes(file.type);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Custom form submission handling to use FormData
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!compressedFile) {
      console.error("No compressed file available to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("file", compressedFile); // Append the actual file

    try {
      setLoading(true);

      const response = await fetch(`/me/${id}/upload`, {
        method: "POST",
        body: formData,
      });

      setLoading(false);

      if (!response.ok) {
        throw new Error("Failed to upload");
      }

      navigate(`/explore/comingsoon`);
    } catch (error) {
      console.error("Error submitting form:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-grow items-center justify-center gap-3 bg-white">
      <div className="m-3">
        {loading ? <p>Send it 🤙...</p> : null}
        {!loading ? (
          <div>
            {filePreviewUrl ? (
              <img src={filePreviewUrl} alt="File preview" className="size-full" />
            ) : null}

            {!filePreviewUrl ? (
              <div>
                <input
                  type="file"
                  accept=".jpeg,.jpg,.png,image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button className="btn btn-outline" onClick={() => navigate(-1)}>
                    Back
                  </button>
                  <button className="btn btn-neutral" onClick={triggerFileInput}>
                    Select Image
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
        {filePreviewUrl && !loading ? (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center justify-center w-full gap-3"
          >
            <label htmlFor="camera" className="text-left">
              Camera
            </label>
            <input type="text" name="camera" placeholder="Mamiya 7ii" />
            <input type="hidden" name="file" value={compressFile} />
            <label htmlFor="caption" className="text-left">
              Caption
            </label>
            <textarea
              name="caption"
              value={caption}
              onChange={handleCaptionChange}
              className="h-50 p-2 text-wrap w-full"
              placeholder="Write a story about the image, how you captured it, what it means to you, camera shot on, or anything you want to say about it..."
            />
            <input type="hidden" name="contentType" value="image" />
            <input type="hidden" name="creatorUsername" value={user.username} />

            <div className="grid grid-cols-2 gap-4 w-full">
              <Link to="/explore/comingsoon" className="btn btn-outline">
                Cancel
              </Link>

              <button className="btn btn-neutral" type="submit" disabled={loading}>
                Submit
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <ErrorBoundaryGeneral page="user index" />;
  }
  return <ErrorBoundaryGeneral page="user index" />;
}


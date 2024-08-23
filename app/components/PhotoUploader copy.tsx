import { useRef } from "react";
import { useNavigate } from "@remix-run/react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import imageCompression from "browser-image-compression";

export default function PhotoUploader({ setFileUrl, setFilePreviewUrl, setLoading }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file && isValidFileType(file)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Trigger file upload asynchronously with compression
      await compressAndUploadFile(file, setFileUrl, setLoading);
    }
  };

  const isValidFileType = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    return allowedTypes.includes(file.type);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
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
  );
}

async function compressAndUploadFile(file, setFileUrl, setLoading) {
  // Compression options
  const options = {
    maxSizeMB: 0.75,
    maxWidthOrHeight: 800,
    useWebWorker: true
  };

  try {
    // Compress the image file
    const compressedFile = await imageCompression(file, options);
    console.log("Compressed file size:", compressedFile.size);

    // Upload the compressed file
    await uploadFile(compressedFile, setFileUrl, setLoading);
  } catch (error) {
    console.error("Error compressing or uploading file:", error);
    setLoading(false);
  }
}

async function uploadFile(file, setFileUrl, setLoading) {
  let apiUrl = "";
  if (process.env.NODE_ENV === "production") {
    apiUrl = "https://og547r5vea.execute-api.us-west-1.amazonaws.com/api/uploads-url";
  } else if (process.env.NODE_ENV === "staging") {
    apiUrl = "https://r9t1l3722a.execute-api.us-west-1.amazonaws.com/api/uploads-url";
  } else {
    apiUrl = "http://localhost:3333/api/uploads-url";
  }

  const uniqueFilename = `${uuidv4()}-${file.name}`;
  try {
    const response = await axios.get(apiUrl, {
      params: {
        filename: uniqueFilename,
        contentType: file.type,
      },
    });

    const { uploadUrl } = response.data;

    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
    });

    setFileUrl("https://d3hspsrf978pst.cloudfront.net/" + uniqueFilename);
    setLoading(false);
  } catch (error) {
    console.error("Error uploading file:", error);
    setLoading(false);
  }
}

import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import imageCompression from "browser-image-compression";

export async function compressAndUploadFile(file) {
  console.log("Compressing file:", file);
  // Compression options
  const options = {
    maxSizeMB: 0.75,
    maxWidthOrHeight: 800,
    useWebWorker: true
  };

  try {
    // Compress the image file
    const compressedFile = await imageCompression(file, options);

    // Upload the compressed file
    const fileUrl = await uploadFile(compressedFile);

    return {fileUrl}
  } catch (error) {
    console.error("Error compressing or uploading file:", error);

  }
}

export async function uploadFile(file) {
  console.log("Uploading file:", file);
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

    return "https://d3hspsrf978pst.cloudfront.net/" + uniqueFilename
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}
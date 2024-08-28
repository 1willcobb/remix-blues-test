import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import 'dotenv/config';


export async function uploadFile(file) {
  console.log("Uploading file:", file);

  // Generate a unique filename
  const uniqueFilename = `${uuidv4()}-${file.name}`;
  const uploadUrl = await getUploadUrl(uniqueFilename, file.type);

  console.log("Uploading to:", uploadUrl);

  try {
    // Convert Blob to ArrayBuffer and then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("Buffer length:", buffer.length); // Log buffer length

    if (buffer.length === 0) {
      throw new Error("Buffer is empty. File was not read correctly.");
    }

    await axios.put(uploadUrl, buffer, {
      headers: {
        "Content-Type": file.type,
      },
    });

    return `https://d3hspsrf978pst.cloudfront.net/${uniqueFilename}`;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

export async function getUploadUrl(filename, contentType) {

  
  const AWS_REGION = process.env.AWS_REGION;
  const AWS_ACCESS = process.env.AWS_ACCESS_KEY_ID;
  const AWS_SECRET = process.env.AWS_SECRET_ACCESS_KEY;
  const AWS_BUCKET = process.env.AWS_BUCKET;

  // Configure the S3 client
  const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS,
      secretAccessKey: AWS_SECRET,
    },
  });

  // Create a presigned URL
  const command = new PutObjectCommand({
    Bucket: AWS_BUCKET,
    Key: filename,
    ContentType: contentType,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

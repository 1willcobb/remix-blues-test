import { S3Client } from '@aws-sdk/client-s3'
import 'dotenv/config';


export default function s3Client(){
  const AWS_REGION = process.env.AWS_REGION;
  const AWS_ACCESS = process.env.AWS_ACCESS_KEY_ID;
  const AWS_SECRET = process.env.AWS_SECRET_ACCESS_KEY;

  // Configure the S3 client
  const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS,
      secretAccessKey: AWS_SECRET,
    },
  });

  return s3Client;
} 
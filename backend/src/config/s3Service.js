import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION, // e.g., "eu-north-1"
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const getPresignedUrl = async (fileName, fileType) => {
  const fileKey = `videos/${Date.now()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
  });

  
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
  
  return { uploadUrl, fileKey };
};
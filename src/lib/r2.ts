import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/**
 * Uploads a screenshot buffer to Cloudflare R2
 * @returns The public URL of the uploaded screenshot
 */
export async function uploadScreenshot(
  buffer: Buffer,
  key: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: `screenshots/${key}`,
    Body: buffer,
    ContentType: "image/png",
  });

  await s3.send(command);

  const publicUrl = process.env.R2_PUBLIC_URL;
  if (publicUrl) {
    return `${publicUrl}/screenshots/${key}`;
  }

  return `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/screenshots/${key}`;
}

/**
 * Deletes a screenshot from R2
 */
export async function deleteScreenshot(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: `screenshots/${key}`,
  });

  await s3.send(command);
}

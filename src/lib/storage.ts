import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const ENDPOINT = process.env.ARVAN_S3_ENDPOINT;
const BUCKET = process.env.ARVAN_S3_BUCKET;
const ACCESS_KEY = process.env.ARVAN_S3_ACCESS_KEY;
const SECRET_KEY = process.env.ARVAN_S3_SECRET_KEY;
const PUBLIC_URL = process.env.ARVAN_S3_PUBLIC_URL?.replace(/\/$/, "");

export const objectStorageEnabled = Boolean(ENDPOINT && BUCKET && ACCESS_KEY && SECRET_KEY && PUBLIC_URL);

let client: S3Client | null = null;
function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      endpoint: ENDPOINT,
      region: "default",
      forcePathStyle: false,
      credentials: { accessKeyId: ACCESS_KEY!, secretAccessKey: SECRET_KEY! },
    });
  }
  return client;
}

// Uploads to the configured bucket and returns the object's public URL. Only
// call this when objectStorageEnabled is true.
//
// ACL: "public-read" is required here — this isn't the AWS-S3 convention of
// a bucket-level public policy. Per ArvanCloud's own docs, a bucket's
// public/private setting only controls whether its object *listing* is
// browsable; it does not make individual objects public. Each object needs
// its own public-read ACL, which is exactly what this sets on every upload
// (confirmed via ArvanCloud's documented Node.js SDK example, which uses
// this identical PutObjectCommand + ACL shape).
export async function uploadObject(key: string, body: Buffer, contentType: string): Promise<string> {
  await getClient().send(
    new PutObjectCommand({
      Bucket: BUCKET!,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: "public-read",
    })
  );
  return `${PUBLIC_URL}/${key}`;
}

export async function deleteObject(key: string): Promise<void> {
  await getClient().send(new DeleteObjectCommand({ Bucket: BUCKET!, Key: key }));
}

// Recovers the object key from a URL previously returned by uploadObject, so
// it can be deleted later. Returns null for URLs that aren't ours.
export function keyFromPublicUrl(url: string): string | null {
  if (!PUBLIC_URL || !url.startsWith(`${PUBLIC_URL}/`)) return null;
  return url.slice(PUBLIC_URL.length + 1);
}

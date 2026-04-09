import { Router } from "express";
import rateLimit from "express-rate-limit";
import { randomUUID } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireSupabaseAuth } from "../lib/auth";
import { supabase } from "../queues/socialQueue";

const r2AccountId = process.env.R2_ACCOUNT_ID || "";
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID || "";
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
const r2Bucket = process.env.R2_BUCKET || "";
const r2PublicUrl = (process.env.R2_PUBLIC_URL || "").replace(/\/+$/, "");
const maxUploadBytes = Number(process.env.FORM_UPLOAD_MAX_BYTES || `${10 * 1024 * 1024}`);

const hasR2Config = Boolean(r2AccountId && r2AccessKeyId && r2SecretAccessKey && r2Bucket);

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const extensionFromMime: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "text/plain": "txt",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

const sanitizeBaseName = (fileName: string) =>
  fileName
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "file";

const toPublicUrl = (key: string) => {
  if (r2PublicUrl) return `${r2PublicUrl}/${key}`;
  return `https://${r2Bucket}.${r2AccountId}.r2.cloudflarestorage.com/${key}`;
};

const createR2Client = () =>
  new S3Client({
    region: "auto",
    endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2AccessKeyId,
      secretAccessKey: r2SecretAccessKey,
    },
  });

export const formUploadRouter = Router();
formUploadRouter.use(requireSupabaseAuth);

const formUploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many upload requests. Please slow down." },
});
formUploadRouter.use(formUploadLimiter);

formUploadRouter.post("/sign-url", async (req, res) => {
  if (!hasR2Config) {
    return res.status(500).json({ error: "R2 is not configured" });
  }

  const { fileName, fileType, fileSize } = req.body as {
    fileName?: string;
    fileType?: string;
    fileSize?: number;
  };

  if (!fileName || !fileType || !fileSize) {
    return res.status(422).json({ error: "fileName, fileType, and fileSize are required" });
  }

  if (!allowedMimeTypes.has(fileType)) {
    return res.status(422).json({ error: "Unsupported file type" });
  }

  if (fileSize <= 0 || fileSize > maxUploadBytes) {
    return res.status(422).json({ error: `File is too large. Max allowed is ${maxUploadBytes} bytes` });
  }

  const userId = res.locals.authUserId as string;
  const ext = extensionFromMime[fileType] || "bin";
  const safeBase = sanitizeBaseName(fileName);
  const now = new Date();
  const key = `forms/${userId}/${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}/${safeBase}-${randomUUID()}.${ext}`;

  const r2 = createR2Client();
  const command = new PutObjectCommand({
    Bucket: r2Bucket,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });
  return res.status(200).json({
    key,
    uploadUrl,
    publicUrl: toPublicUrl(key),
    expiresIn: 300,
    maxUploadBytes,
  });
});

formUploadRouter.post("/complete", async (req, res) => {
  const {
    key,
    publicUrl,
    originalName,
    mimeType,
    sizeBytes,
    fieldId,
    formId,
    submissionId,
  } = req.body as {
    key?: string;
    publicUrl?: string;
    originalName?: string;
    mimeType?: string;
    sizeBytes?: number;
    fieldId?: string;
    formId?: string | null;
    submissionId?: string | null;
  };

  if (!key || !publicUrl || !originalName || !mimeType || !sizeBytes || !fieldId) {
    return res.status(422).json({ error: "key, publicUrl, originalName, mimeType, sizeBytes, and fieldId are required" });
  }

  const userId = res.locals.authUserId as string;
  if (!key.startsWith(`forms/${userId}/`)) {
    return res.status(403).json({ error: "Invalid storage key for this user" });
  }

  const { data, error } = await supabase
    .from("form_uploads")
    .insert({
      user_id: userId,
      form_id: formId || null,
      submission_id: submissionId || null,
      field_id: fieldId,
      original_name: originalName,
      mime_type: mimeType,
      size_bytes: sizeBytes,
      storage_provider: "r2",
      storage_key: key,
      public_url: publicUrl,
      uploaded_by: "authenticated_user",
    })
    .select("*")
    .single();

  if (error) {
    return res.status(500).json({ error: "Failed to save upload metadata", details: error.message });
  }

  return res.status(201).json({ upload: data });
});

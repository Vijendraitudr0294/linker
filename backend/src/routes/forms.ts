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

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "form";

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

const createUniqueSlug = async (base: string, excludeFormId?: string) => {
  const root = slugify(base);
  for (let i = 0; i < 6; i += 1) {
    const candidate = i === 0 ? root : `${root}-${Math.floor(Math.random() * 10000)}`;
    let query = supabase.from("forms").select("id").eq("slug", candidate).limit(1);
    if (excludeFormId) query = query.neq("id", excludeFormId);
    const { data } = await query;
    if (!data || data.length === 0) return candidate;
  }
  return `${root}-${Math.floor(Math.random() * 100000)}`;
};

export const formsRouter = Router();

const publicSubmitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again in a minute." },
});

formsRouter.get("/public/:slug", async (req, res) => {
  const { slug } = req.params;
  const { data, error } = await supabase
    .from("forms")
    .select("id,name,slug,category,description,schema_json,style_json,published,status")
    .eq("archived", false)
    .eq("slug", slug)
    .eq("published", true)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return res.status(404).json({ error: "Form not found" });
  return res.status(200).json({ form: data });
});

formsRouter.post("/public/:slug/submit", publicSubmitLimiter, async (req, res) => {
  const { slug } = req.params;
  const payload = req.body;
  if (!payload || typeof payload !== "object") {
    return res.status(422).json({ error: "Submission payload is required" });
  }

  const { data: form, error: formError } = await supabase
    .from("forms")
    .select("id")
    .eq("archived", false)
    .eq("slug", slug)
    .eq("published", true)
    .eq("status", "published")
    .maybeSingle();

  if (formError || !form) return res.status(404).json({ error: "Form not found" });

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const userAgent = req.headers["user-agent"] || null;
  const { data, error } = await supabase
    .from("form_submissions")
    .insert({
      form_id: form.id,
      payload,
      source: "public",
      ip: typeof ip === "string" ? ip : null,
      user_agent: typeof userAgent === "string" ? userAgent : null,
    })
    .select("id,created_at")
    .single();

  if (error) return res.status(500).json({ error: "Failed to submit form", details: error.message });
  return res.status(201).json({ submission: data });
});

formsRouter.post("/public/:slug/upload/sign-url", publicSubmitLimiter, async (req, res) => {
  if (!hasR2Config) return res.status(500).json({ error: "R2 is not configured" });
  const { slug } = req.params;
  const { fileName, fileType, fileSize, fieldId } = req.body as {
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    fieldId?: string;
  };

  if (!fileName || !fileType || !fileSize || !fieldId) {
    return res.status(422).json({ error: "fileName, fileType, fileSize, and fieldId are required" });
  }
  if (!allowedMimeTypes.has(fileType)) return res.status(422).json({ error: "Unsupported file type" });
  if (fileSize <= 0 || fileSize > maxUploadBytes) return res.status(422).json({ error: "Invalid file size" });

  const { data: form } = await supabase
    .from("forms")
    .select("id,user_id")
    .eq("archived", false)
    .eq("slug", slug)
    .eq("published", true)
    .eq("status", "published")
    .maybeSingle();
  if (!form) return res.status(404).json({ error: "Form not found" });

  const ext = extensionFromMime[fileType] || "bin";
  const key = `forms/${form.user_id}/public/${form.id}/${fieldId}/${sanitizeBaseName(fileName)}-${randomUUID()}.${ext}`;
  const command = new PutObjectCommand({ Bucket: r2Bucket, Key: key, ContentType: fileType });
  const uploadUrl = await getSignedUrl(createR2Client(), command, { expiresIn: 300 });
  return res.status(200).json({ key, uploadUrl, publicUrl: toPublicUrl(key), formId: form.id });
});

formsRouter.post("/public/:slug/upload/complete", publicSubmitLimiter, async (req, res) => {
  const { slug } = req.params;
  const { key, publicUrl, originalName, mimeType, sizeBytes, fieldId } = req.body as {
    key?: string;
    publicUrl?: string;
    originalName?: string;
    mimeType?: string;
    sizeBytes?: number;
    fieldId?: string;
  };
  if (!key || !publicUrl || !originalName || !mimeType || !sizeBytes || !fieldId) {
    return res.status(422).json({ error: "Missing upload metadata" });
  }

  const { data: form } = await supabase
    .from("forms")
    .select("id,user_id")
    .eq("archived", false)
    .eq("slug", slug)
    .eq("published", true)
    .eq("status", "published")
    .maybeSingle();
  if (!form) return res.status(404).json({ error: "Form not found" });

  if (!key.startsWith(`forms/${form.user_id}/public/${form.id}/`)) {
    return res.status(403).json({ error: "Invalid upload key" });
  }

  const { data, error } = await supabase
    .from("form_uploads")
    .insert({
      user_id: form.user_id,
      form_id: form.id,
      field_id: fieldId,
      original_name: originalName,
      mime_type: mimeType,
      size_bytes: sizeBytes,
      storage_provider: "r2",
      storage_key: key,
      public_url: publicUrl,
      uploaded_by: "public_respondent",
    })
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: "Failed to save upload metadata", details: error.message });
  return res.status(201).json({ upload: data });
});

formsRouter.use(requireSupabaseAuth);

formsRouter.get("/", async (req, res) => {
  const userId = res.locals.authUserId as string;
  const { data: forms, error } = await supabase
    .from("forms")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) return res.status(500).json({ error: "Failed to fetch forms", details: error.message });
  const formIds = (forms || []).map((f) => f.id);
  let submissionsByForm: Record<string, number> = {};
  if (formIds.length > 0) {
    const { data: submissions } = await supabase
      .from("form_submissions")
      .select("form_id")
      .in("form_id", formIds);
    submissionsByForm = (submissions || []).reduce<Record<string, number>>((acc, row) => {
      acc[row.form_id] = (acc[row.form_id] || 0) + 1;
      return acc;
    }, {});
  }

  const enriched = (forms || []).map((f) => ({
    ...f,
    submission_count: submissionsByForm[f.id] || 0,
  }));

  return res.status(200).json({ forms: enriched });
});

formsRouter.post("/", async (req, res) => {
  const userId = res.locals.authUserId as string;
  const { name, category, description, schema_json, style_json } = req.body as Record<string, unknown>;
  if (!name || typeof name !== "string") return res.status(422).json({ error: "name is required" });

  const slug = await createUniqueSlug(name);
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("forms")
    .insert({
      user_id: userId,
      name,
      slug,
      category: typeof category === "string" ? category : "Lead",
      description: typeof description === "string" ? description : null,
      schema_json: schema_json && typeof schema_json === "object" ? schema_json : { fields: [] },
      style_json: style_json && typeof style_json === "object" ? style_json : {},
      status: "draft",
      published: false,
      archived: false,
      deleted_at: null,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: "Failed to create form", details: error.message });
  return res.status(201).json({ form: data });
});

formsRouter.patch("/:id", async (req, res) => {
  const userId = res.locals.authUserId as string;
  const { id } = req.params;
  const { data: existing } = await supabase.from("forms").select("id,user_id").eq("id", id).maybeSingle();
  if (!existing) return res.status(404).json({ error: "Form not found" });
  if (existing.user_id !== userId) return res.status(403).json({ error: "Forbidden" });

  const patch = req.body as Record<string, unknown>;
  const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof patch.name === "string") updatePayload.name = patch.name;
  if (typeof patch.category === "string") updatePayload.category = patch.category;
  if (typeof patch.description === "string" || patch.description === null) updatePayload.description = patch.description;
  if (patch.schema_json && typeof patch.schema_json === "object") updatePayload.schema_json = patch.schema_json;
  if (patch.style_json && typeof patch.style_json === "object") updatePayload.style_json = patch.style_json;
  if (typeof patch.status === "string") updatePayload.status = patch.status;
  if (typeof patch.published === "boolean") updatePayload.published = patch.published;

  const { data, error } = await supabase.from("forms").update(updatePayload).eq("id", id).select("*").single();
  if (error) return res.status(500).json({ error: "Failed to update form", details: error.message });
  return res.status(200).json({ form: data });
});

formsRouter.post("/:id/publish", async (req, res) => {
  const userId = res.locals.authUserId as string;
  const { id } = req.params;
  const { data: existing } = await supabase.from("forms").select("*").eq("id", id).maybeSingle();
  if (!existing) return res.status(404).json({ error: "Form not found" });
  if (existing.user_id !== userId) return res.status(403).json({ error: "Forbidden" });

  const slug = await createUniqueSlug(existing.name || "form", id);
  const { data, error } = await supabase
    .from("forms")
    .update({
      slug,
      published: true,
      status: "published",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: "Failed to publish form", details: error.message });
  return res.status(200).json({ form: data });
});

formsRouter.post("/:id/pause", async (req, res) => {
  const userId = res.locals.authUserId as string;
  const { id } = req.params;
  const { data: existing } = await supabase.from("forms").select("*").eq("id", id).maybeSingle();
  if (!existing) return res.status(404).json({ error: "Form not found" });
  if (existing.user_id !== userId) return res.status(403).json({ error: "Forbidden" });

  const { data, error } = await supabase
    .from("forms")
    .update({
      status: "paused",
      published: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return res.status(500).json({ error: "Failed to pause form", details: error.message });
  return res.status(200).json({ form: data });
});

formsRouter.post("/:id/resume", async (req, res) => {
  const userId = res.locals.authUserId as string;
  const { id } = req.params;
  const { data: existing } = await supabase.from("forms").select("*").eq("id", id).maybeSingle();
  if (!existing) return res.status(404).json({ error: "Form not found" });
  if (existing.user_id !== userId) return res.status(403).json({ error: "Forbidden" });

  const { data, error } = await supabase
    .from("forms")
    .update({
      status: "published",
      published: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return res.status(500).json({ error: "Failed to resume form", details: error.message });
  return res.status(200).json({ form: data });
});

formsRouter.post("/:id/stop", async (req, res) => {
  const userId = res.locals.authUserId as string;
  const { id } = req.params;
  const { data: existing } = await supabase.from("forms").select("*").eq("id", id).maybeSingle();
  if (!existing) return res.status(404).json({ error: "Form not found" });
  if (existing.user_id !== userId) return res.status(403).json({ error: "Forbidden" });

  const { data, error } = await supabase
    .from("forms")
    .update({
      status: "stopped",
      published: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return res.status(500).json({ error: "Failed to stop form", details: error.message });
  return res.status(200).json({ form: data });
});

formsRouter.post("/:id/cancel", async (req, res) => {
  const userId = res.locals.authUserId as string;
  const { id } = req.params;
  const { data: existing } = await supabase.from("forms").select("*").eq("id", id).maybeSingle();
  if (!existing) return res.status(404).json({ error: "Form not found" });
  if (existing.user_id !== userId) return res.status(403).json({ error: "Forbidden" });

  const { data, error } = await supabase
    .from("forms")
    .update({
      status: "cancelled",
      published: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return res.status(500).json({ error: "Failed to cancel form", details: error.message });
  return res.status(200).json({ form: data });
});

formsRouter.delete("/:id", async (req, res) => {
  const userId = res.locals.authUserId as string;
  const { id } = req.params;
  const { data: existing } = await supabase.from("forms").select("*").eq("id", id).maybeSingle();
  if (!existing) return res.status(404).json({ error: "Form not found" });
  if (existing.user_id !== userId) return res.status(403).json({ error: "Forbidden" });

  const { data, error } = await supabase
    .from("forms")
    .update({
      archived: true,
      deleted_at: new Date().toISOString(),
      published: false,
      status: "deleted",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: "Failed to delete form", details: error.message });
  return res.status(200).json({ form: data });
});

formsRouter.post("/:id/restore", async (req, res) => {
  const userId = res.locals.authUserId as string;
  const { id } = req.params;
  const { data: existing } = await supabase.from("forms").select("*").eq("id", id).maybeSingle();
  if (!existing) return res.status(404).json({ error: "Form not found" });
  if (existing.user_id !== userId) return res.status(403).json({ error: "Forbidden" });

  const { data, error } = await supabase
    .from("forms")
    .update({
      archived: false,
      deleted_at: null,
      status: "draft",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: "Failed to restore form", details: error.message });
  return res.status(200).json({ form: data });
});

formsRouter.get("/:id/submissions", async (req, res) => {
  const userId = res.locals.authUserId as string;
  const { id } = req.params;
  const { data: form } = await supabase.from("forms").select("id,user_id").eq("id", id).maybeSingle();
  if (!form) return res.status(404).json({ error: "Form not found" });
  if (form.user_id !== userId) return res.status(403).json({ error: "Forbidden" });

  const { data, error } = await supabase
    .from("form_submissions")
    .select("*")
    .eq("form_id", id)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return res.status(500).json({ error: "Failed to fetch submissions", details: error.message });
  return res.status(200).json({ submissions: data || [] });
});

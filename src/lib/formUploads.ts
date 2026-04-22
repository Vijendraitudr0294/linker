import { buildBackendUrl } from "@/lib/backendUrl";
import { supabase } from "@/integrations/supabase/client";

interface SignUploadResponse {
  key: string;
  uploadUrl: string;
  publicUrl: string;
  expiresIn: number;
  maxUploadBytes: number;
}

interface CompleteUploadResponse {
  upload: {
    id: string;
    user_id: string;
    form_id: string | null;
    submission_id: string | null;
    field_id: string;
    original_name: string;
    mime_type: string;
    size_bytes: number;
    storage_provider: string;
    storage_key: string;
    public_url: string;
    uploaded_by: string | null;
    created_at: string;
  };
}

export interface UploadFormFileParams {
  file: File;
  fieldId: string;
  formId?: string | null;
  submissionId?: string | null;
}

const getAuthHeaders = async (): Promise<HeadersInit> => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("You must be logged in to upload files");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const requestSignedUploadUrl = async (file: File): Promise<SignUploadResponse> => {
  const headers = await getAuthHeaders();
  const response = await fetch(buildBackendUrl("/api/v1/forms/uploads/sign-url"), {
    method: "POST",
    headers,
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || "Failed to create upload URL");
  }

  return response.json() as Promise<SignUploadResponse>;
};

const uploadBinaryToR2 = async (uploadUrl: string, file: File) => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Upload failed. Please try again.");
  }
};

const completeUpload = async (
  signResult: SignUploadResponse,
  params: UploadFormFileParams
): Promise<CompleteUploadResponse> => {
  const headers = await getAuthHeaders();
  const response = await fetch(buildBackendUrl("/api/v1/forms/uploads/complete"), {
    method: "POST",
    headers,
    body: JSON.stringify({
      key: signResult.key,
      publicUrl: signResult.publicUrl,
      originalName: params.file.name,
      mimeType: params.file.type || "application/octet-stream",
      sizeBytes: params.file.size,
      fieldId: params.fieldId,
      formId: params.formId || null,
      submissionId: params.submissionId || null,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || "Failed to save upload metadata");
  }

  return response.json() as Promise<CompleteUploadResponse>;
};

export const uploadFormFileToR2 = async (params: UploadFormFileParams) => {
  const signResult = await requestSignedUploadUrl(params.file);
  await uploadBinaryToR2(signResult.uploadUrl, params.file);
  const completion = await completeUpload(signResult, params);
  return {
    ...completion.upload,
    publicUrl: signResult.publicUrl,
  };
};

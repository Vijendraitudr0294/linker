import { supabase } from "@/integrations/supabase/client";

export type BuilderField = {
  id: string;
  type: 
    | "short_text" | "long_text" | "email" | "phone" | "address" | "website" 
    | "multiple_choice" | "dropdown" | "picture_choice" | "yes_no" | "legal" | "checkbox"
    | "nps" | "opinion_scale" | "rating" | "ranking" | "matrix"
    | "video_audio" | "ai_clarify" | "ai_faq"
    | "number" | "date" | "signature" | "payment" | "file" | "google_drive" | "calendly"
    | "welcome_screen" | "partial_submit" | "statement" | "question_group" | "end_screen" | "redirect";
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  correctAnswer?: string | string[];
  points?: number;
};

export type FormRecord = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  schema_json: { fields?: BuilderField[] };
  style_json: Record<string, unknown>;
  status: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  submission_count?: number;
  archived?: boolean;
  deleted_at?: string | null;
};

export type FormSubmissionRecord = {
  id: string;
  form_id: string;
  payload: Record<string, unknown>;
  source: string;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
};

const getAuthHeaders = async (): Promise<HeadersInit> => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Please login first");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const getCurrentUserId = async (): Promise<string> => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) throw new Error("Please login first");
  return data.user.id;
};

const withBackendFallback = async <T>(
  backendCall: () => Promise<T>,
  fallbackCall: () => Promise<T>
): Promise<T> => {
  try {
    return await backendCall();
  } catch {
    return fallbackCall();
  }
};

async function authedRequest<T>(url: string, init: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(url, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || "Request failed");
  }
  return response.json() as Promise<T>;
}

export const listMyForms = async () => {
  return withBackendFallback(
    async () => {
      const result = await authedRequest<{ forms: FormRecord[] }>("/api/v1/forms", { method: "GET" });
      return result.forms;
    },
    async () => {
      const userId = await getCurrentUserId();
      const { data: forms, error } = await (supabase as any)
        .from("forms")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });
      
      const activeForms = (forms || []).filter((f: any) => !f.archived);
      
      if (error) throw new Error(error.message || "Failed to load forms");

      const formIds = activeForms.map((f: any) => f.id);
      let submissionsByForm: Record<string, number> = {};
      if (formIds.length > 0) {
        const { data: submissions } = await (supabase as any).from("form_submissions").select("form_id").in("form_id", formIds);
        submissionsByForm = (submissions || []).reduce((acc: Record<string, number>, row: any) => {
          acc[row.form_id] = (acc[row.form_id] || 0) + 1;
          return acc;
        }, {});
      }

      return activeForms.map((f: any) => ({ ...f, submission_count: submissionsByForm[f.id] || 0 })) as FormRecord[];
    }
  );
};

export const createForm = async (payload: {
  name: string;
  category: string;
  description?: string;
  fields: BuilderField[];
  styleJson?: Record<string, unknown>;
}) => {
  return withBackendFallback(
    async () => {
      const result = await authedRequest<{ form: FormRecord }>("/api/v1/forms", {
        method: "POST",
        body: JSON.stringify({
          name: payload.name,
          category: payload.category,
          description: payload.description || null,
          schema_json: { fields: payload.fields },
          style_json: payload.styleJson || {},
        }),
      });
      return result.form;
    },
    async () => {
      const userId = await getCurrentUserId();
      const slugBase = payload.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "form";
      const slug = `${slugBase}-${Math.floor(Math.random() * 10000)}`;
      const { data, error } = await (supabase as any)
        .from("forms")
        .insert({
          user_id: userId,
          name: payload.name,
          slug,
          category: payload.category,
          description: payload.description || null,
          schema_json: { fields: payload.fields },
          style_json: payload.styleJson || {},
          status: "draft",
          published: false,
        })
        .select("*")
        .single();
      if (error) throw new Error(error.message || "Failed to create form");
      return data as FormRecord;
    }
  );
};

export const updateForm = async (formId: string, payload: {
  name: string;
  category: string;
  description?: string;
  fields: BuilderField[];
  styleJson?: Record<string, unknown>;
}) => {
  return withBackendFallback(
    async () => {
      const result = await authedRequest<{ form: FormRecord }>(`/api/v1/forms/${formId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: payload.name,
          category: payload.category,
          description: payload.description || null,
          schema_json: { fields: payload.fields },
          style_json: payload.styleJson || {},
        }),
      });
      return result.form;
    },
    async () => {
      const { data, error } = await (supabase as any)
        .from("forms")
        .update({
          name: payload.name,
          category: payload.category,
          description: payload.description || null,
          schema_json: { fields: payload.fields },
          style_json: payload.styleJson || {},
          updated_at: new Date().toISOString(),
        })
        .eq("id", formId)
        .select("*")
        .single();
      if (error) throw new Error(error.message || "Failed to update form");
      return data as FormRecord;
    }
  );
};

export const publishForm = async (formId: string) => {
  return withBackendFallback(
    async () => {
      const result = await authedRequest<{ form: FormRecord }>(`/api/v1/forms/${formId}/publish`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      return result.form;
    },
    async () => {
      const { data: existing, error: existingError } = await (supabase as any).from("forms").select("*").eq("id", formId).single();
      if (existingError || !existing) throw new Error(existingError?.message || "Form not found");
      const slugBase = String(existing.name || "form").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "form";
      const slug = existing.slug || `${slugBase}-${Math.floor(Math.random() * 10000)}`;
      const { data, error } = await (supabase as any)
        .from("forms")
        .update({
          slug,
          published: true,
          status: "published",
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", formId)
        .select("*")
        .single();
      if (error) throw new Error(error.message || "Failed to publish form");
      return data as FormRecord;
    }
  );
};

export const pauseForm = async (formId: string) => {
  return withBackendFallback(
    async () => (await authedRequest<{ form: FormRecord }>(`/api/v1/forms/${formId}/pause`, { method: "POST", body: JSON.stringify({}) })).form,
    async () => {
      const { data, error } = await (supabase as any).from("forms").update({ status: "paused", published: false, updated_at: new Date().toISOString() }).eq("id", formId).select("*").single();
      if (error) throw new Error(error.message || "Failed to pause form");
      return data as FormRecord;
    }
  );
};

export const resumeForm = async (formId: string) => {
  return withBackendFallback(
    async () => (await authedRequest<{ form: FormRecord }>(`/api/v1/forms/${formId}/resume`, { method: "POST", body: JSON.stringify({}) })).form,
    async () => {
      const { data, error } = await (supabase as any).from("forms").update({ status: "published", published: true, updated_at: new Date().toISOString() }).eq("id", formId).select("*").single();
      if (error) throw new Error(error.message || "Failed to resume form");
      return data as FormRecord;
    }
  );
};

export const stopForm = async (formId: string) => {
  return withBackendFallback(
    async () => (await authedRequest<{ form: FormRecord }>(`/api/v1/forms/${formId}/stop`, { method: "POST", body: JSON.stringify({}) })).form,
    async () => {
      const { data, error } = await (supabase as any).from("forms").update({ status: "stopped", published: false, updated_at: new Date().toISOString() }).eq("id", formId).select("*").single();
      if (error) throw new Error(error.message || "Failed to stop form");
      return data as FormRecord;
    }
  );
};

export const cancelForm = async (formId: string) => {
  return withBackendFallback(
    async () => (await authedRequest<{ form: FormRecord }>(`/api/v1/forms/${formId}/cancel`, { method: "POST", body: JSON.stringify({}) })).form,
    async () => {
      const { data, error } = await (supabase as any).from("forms").update({ status: "cancelled", published: false, updated_at: new Date().toISOString() }).eq("id", formId).select("*").single();
      if (error) throw new Error(error.message || "Failed to cancel form");
      return data as FormRecord;
    }
  );
};

export const deleteForm = async (formId: string) => {
  return withBackendFallback(
    async () => (await authedRequest<{ form: FormRecord }>(`/api/v1/forms/${formId}`, { method: "DELETE" })),
    async () => {
      const { error } = await (supabase as any).from("forms").delete().eq("id", formId);
      if (error) throw new Error(error.message || "Failed to delete form");
      return { id: formId } as FormRecord;
    }
  );
};

export const restoreForm = async (formId: string) => {
  return withBackendFallback(
    async () => (await authedRequest<{ form: FormRecord }>(`/api/v1/forms/${formId}/restore`, { method: "POST", body: JSON.stringify({}) })).form,
    async () => {
      const { data, error } = await (supabase as any).from("forms").update({ archived: false, deleted_at: null, status: "draft", updated_at: new Date().toISOString() }).eq("id", formId).select("*").single();
      if (error) throw new Error(error.message || "Failed to restore form");
      return data as FormRecord;
    }
  );
};

export const listFormSubmissions = async (formId: string) => {
  return withBackendFallback(
    async () => (await authedRequest<{ submissions: FormSubmissionRecord[] }>(`/api/v1/forms/${formId}/submissions`, { method: "GET" })).submissions,
    async () => {
      const { data: form } = await (supabase as any).from("forms").select("id").eq("id", formId).maybeSingle();
      if (!form) return [];
      const { data, error } = await (supabase as any).from("form_submissions").select("*").eq("form_id", formId).order("created_at", { ascending: false }).limit(200);
      if (error) throw new Error(error.message || "Failed to fetch submissions");
      return (data || []) as FormSubmissionRecord[];
    }
  );
};

export const getPublicForm = async (slug: string) => {
  return withBackendFallback(
    async () => {
      const response = await fetch(`/api/v1/forms/public/${slug}`);
      if (!response.ok) throw new Error("Form not found");
      return (await response.json()) as { form: FormRecord };
    },
    async () => {
      console.log("🔍 Fallback: Searching Supabase for form slug:", slug);
      const { data, error } = await (supabase as any)
        .from("forms")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      
      if (error) {
        console.error("❌ Supabase query error:", error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (!data) {
        console.warn("⚠️ Form not found in database for slug:", slug);
        throw new Error("Form not found");
      }
      
      console.log("✅ Form found in DB:", data.name, { published: data.published, status: data.status, archived: data.archived });
      
      if (!data.published || data.status !== "published") {
        console.warn("🚫 Form is not published yet:", data.status);
        throw new Error("Form is not published");
      }
      
      if (data.archived) {
        console.warn("👻 Form is archived");
        throw new Error("Form is archived");
      }

      return { form: data as FormRecord };
    }
  );
};

export const submitPublicForm = async (slug: string, payload: Record<string, unknown>) => {
  return withBackendFallback(
    async () => {
      const response = await fetch(`/api/v1/forms/public/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to submit");
      }
      return response.json();
    },
    async () => {
      const { data: form, error: formError } = await (supabase as any)
        .from("forms")
        .select("id, published, status, archived")
        .eq("slug", slug)
        .maybeSingle();
      
      if (formError) throw new Error(formError.message);
      if (!form) throw new Error("Form not found in database.");
      if (!form.published || form.status !== "published") throw new Error("Form is not published.");
      if (form.archived) throw new Error("Form is archived.");

      const { data, error } = await (supabase as any)
        .from("form_submissions")
        .insert({
          form_id: form.id,
          payload,
          source: "public",
        })
        .select("*")
        .single();
      if (error) throw new Error(error.message || "Failed to submit");
      return { submission: data };
    }
  );
};

export const signPublicFormUpload = async (slug: string, payload: {
  fileName: string;
  fileType: string;
  fileSize: number;
  fieldId: string;
}) => {
  const response = await fetch(`/api/v1/forms/public/${slug}/upload/sign-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || "Failed to create upload URL");
  }
  return response.json() as Promise<{ key: string; uploadUrl: string; publicUrl: string; formId: string }>;
};

export const completePublicFormUpload = async (
  slug: string,
  payload: {
    key: string;
    publicUrl: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    fieldId: string;
  }
) => {
  const response = await fetch(`/api/v1/forms/public/${slug}/upload/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || "Failed to save upload metadata");
  }
  return response.json() as Promise<{ upload: { id: string; public_url: string } }>;
};

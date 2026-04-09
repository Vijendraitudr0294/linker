import type { FormRecord } from "@/lib/formsApi";

export const buildPublicFormUrl = (origin: string, form: Pick<FormRecord, "published" | "slug"> | null | undefined): string | null => {
  if (!form?.published) return null;
  const slug = String(form.slug || "").trim();
  if (!slug) return null;
  return `${origin.replace(/\/+$/, "")}/forms/${slug}`;
};

export const upsertForm = (forms: FormRecord[], form: FormRecord): FormRecord[] => {
  const rest = forms.filter((item) => item.id !== form.id);
  return [form, ...rest];
};

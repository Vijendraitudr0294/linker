import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import {
  completePublicFormUpload,
  getPublicForm,
  signPublicFormUpload,
  submitPublicForm,
  type BuilderField,
  type FormRecord,
} from "@/lib/formsApi";

type UploadRef = {
  uploadId: string;
  name: string;
  url: string;
  size: number;
  fieldId: string;
};

const PublicFormPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [form, setForm] = useState<FormRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!slug) return;
      try {
        const result = await getPublicForm(slug);
        if (!mounted) return;
        setForm(result.form);
      } catch {
        if (!mounted) return;
        toast.error("Form not found");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void run();
    return () => {
      mounted = false;
    };
  }, [slug]);

  const fields = useMemo<BuilderField[]>(() => {
    if (!form?.schema_json?.fields || !Array.isArray(form.schema_json.fields)) return [];
    return form.schema_json.fields;
  }, [form]);

  const styleConfig = (form?.style_json || {}) as Record<string, unknown>;
  const formTheme = (styleConfig.theme as string) || "brutal";
  const successMessage = typeof styleConfig.successMessage === "string" ? styleConfig.successMessage : "Thanks! We got your response.";
  const collectFiles = styleConfig.collectFiles === undefined ? true : Boolean(styleConfig.collectFiles);

  const themeClasses = useMemo(() => {
    switch (formTheme) {
      case "clean":
        return {
          page: "bg-[#f6f7fb]",
          card: "border-2 border-black/20 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]",
          button: "border-2 border-black bg-black text-white",
          field: "border border-black/25 bg-white",
        };
      case "soft":
        return {
          page: "bg-[#fffaf3]",
          card: "border-2 border-[#d8b4fe] bg-white shadow-[0_10px_30px_rgba(88,28,135,0.12)]",
          button: "border-2 border-[#7e22ce] bg-[#a855f7] text-white",
          field: "border border-[#d8b4fe] bg-white",
        };
      case "dark":
        return {
          page: "bg-[#0f172a]",
          card: "border-2 border-[#334155] bg-[#111827] text-white",
          button: "border-2 border-white bg-white text-black",
          field: "border border-[#475569] bg-[#0b1220] text-white",
        };
      case "glass":
        return {
          page: "bg-gradient-to-br from-[#f0f9ff] to-[#eef2ff]",
          card: "border border-white/40 bg-white/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(30,41,59,0.15)]",
          button: "border border-[#334155] bg-[#0f172a] text-white",
          field: "border border-white/70 bg-white/80",
        };
      default:
        return {
          page: "bg-[#f2f3f5]",
          card: "border-4 border-black bg-white shadow-[10px_10px_0_0_rgba(0,0,0,1)]",
          button: "border-3 border-black bg-black text-white",
          field: "border-2 border-black bg-white",
        };
    }
  }, [formTheme]);

  const setFieldValue = (fieldId: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const onFileUpload = async (field: BuilderField, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    if (!file || !slug) return;

    setUploadingField(field.id);
    try {
      const sign = await signPublicFormUpload(slug, {
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
        fieldId: field.id,
      });

      const putResult = await fetch(sign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!putResult.ok) throw new Error("Upload failed");

      const done = await completePublicFormUpload(slug, {
        key: sign.key,
        publicUrl: sign.publicUrl,
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        fieldId: field.id,
      });

      const ref: UploadRef = {
        uploadId: done.upload.id,
        name: file.name,
        url: sign.publicUrl,
        size: file.size,
        fieldId: field.id,
      };
      setFieldValue(field.id, ref);
      toast.success("File attached");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploadingField(null);
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!slug || !form) return;

    for (const field of fields) {
      if (field.required && (values[field.id] === undefined || values[field.id] === null || values[field.id] === "")) {
        toast.error(`"${field.label}" is required.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await submitPublicForm(slug, {
        formId: form.id,
        submittedAt: new Date().toISOString(),
        values,
      });
      toast.success(successMessage);
      setValues({});
      setSubmitted(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f3f5]">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f3f5] p-5">
        <div className="border-4 border-black bg-white p-8 text-center shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
          <h1 className="text-3xl font-black">Form Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-6 px-3 ${themeClasses.page}`}>
      <div className={`max-w-2xl mx-auto p-5 md:p-7 ${themeClasses.card}`}>
        <p className="text-[11px] uppercase tracking-[0.18em] font-black text-emerald-600 mb-1">{form.category}</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">{form.name}</h1>
        {form.description && <p className="mt-2 text-sm md:text-base font-semibold opacity-70">{form.description}</p>}

        {submitted && (
          <div className="mt-4 border-2 border-emerald-600 bg-emerald-100/70 p-3 text-sm font-bold">
            {successMessage}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {fields.map((field) => (
            <div key={field.id} className="space-y-1.5">
              <label className="text-sm font-black">{field.label}{field.required ? " *" : ""}</label>

              {field.type === "long_text" ? (
                <textarea
                  rows={4}
                  value={(values[field.id] as string) || ""}
                  onChange={(e) => setFieldValue(field.id, e.target.value)}
                  className={`w-full p-2.5 ${themeClasses.field}`}
                  placeholder={field.placeholder || ""}
                />
              ) : field.type === "dropdown" ? (
                <select
                  value={(values[field.id] as string) || ""}
                  onChange={(e) => setFieldValue(field.id, e.target.value)}
                  className={`w-full h-11 px-2.5 ${themeClasses.field}`}
                >
                  <option value="">Select one</option>
                  {(field.options || []).map((opt, i) => (
                    <option key={`${opt}-${i}`} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === "rating" ? (
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFieldValue(field.id, n)}
                      className={`w-10 h-10 border-2 border-black font-black ${values[field.id] === n ? "bg-black text-white" : "bg-white text-black"}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              ) : field.type === "file" ? (
                <div className="space-y-2">
                  <label className={`inline-flex items-center gap-2 px-3 h-11 cursor-pointer ${themeClasses.field}`}>
                    {uploadingField === field.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    <span className="text-xs font-black uppercase tracking-[0.1em]">{uploadingField === field.id ? "Uploading..." : "Choose file"}</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => onFileUpload(field, e)}
                      disabled={uploadingField === field.id || !collectFiles}
                      accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.txt,.docx"
                    />
                  </label>
                  {!collectFiles && <p className="text-xs font-semibold text-red-500">File uploads are disabled for this form.</p>}
                  {values[field.id] && typeof values[field.id] === "object" && (
                    <a
                      href={(values[field.id] as UploadRef).url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-xs underline"
                    >
                      {(values[field.id] as UploadRef).name}
                    </a>
                  )}
                </div>
              ) : (
                <input
                  type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
                  value={(values[field.id] as string) || ""}
                  onChange={(e) => setFieldValue(field.id, e.target.value)}
                  className={`w-full h-11 px-2.5 ${themeClasses.field}`}
                  placeholder={field.placeholder || ""}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className={`w-full h-12 font-black uppercase tracking-[0.12em] ${themeClasses.button}`}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PublicFormPage;

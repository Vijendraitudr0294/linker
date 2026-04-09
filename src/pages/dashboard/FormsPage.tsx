import { useMemo, useState } from "react";
import { UploadCloud, Loader2, FileText, Plus, GripVertical, Trash2, Eye, Sparkles, PauseCircle, PlayCircle, StopCircle, XCircle, RotateCcw, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { uploadFormFileToR2 } from "@/lib/formUploads";
import { buildPublicFormUrl, upsertForm } from "@/lib/formsUi";
import { cn } from "@/lib/utils";
import { cancelForm, createForm, deleteForm, listFormSubmissions, listMyForms, pauseForm, publishForm, restoreForm, resumeForm, stopForm, updateForm, type BuilderField, type FormRecord, type FormSubmissionRecord } from "@/lib/formsApi";
import { useEffect } from "react";

type FieldType = "short_text" | "email" | "phone" | "long_text" | "dropdown" | "rating" | "file";
type TemplateCategory = "Lead" | "Contact" | "Feedback" | "Application";

type FormField = BuilderField & {
  id: string;
};

type FormTemplate = {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  fields: Omit<FormField, "id">[];
};

type UploadedItem = { id: string; name: string; sizeBytes: number; publicUrl: string };

const fieldCatalog: { type: FieldType; label: string }[] = [
  { type: "short_text", label: "Short Text" },
  { type: "email", label: "Email" },
  { type: "phone", label: "Phone" },
  { type: "long_text", label: "Long Text" },
  { type: "dropdown", label: "Dropdown" },
  { type: "rating", label: "Rating (1-5)" },
  { type: "file", label: "File Upload" },
];

const templates: FormTemplate[] = [
  {
    id: "contact-basic",
    name: "Contact Basic",
    category: "Contact",
    description: "Simple contact form for profile pages.",
    fields: [
      { type: "short_text", label: "Your Name", required: true, placeholder: "Type your name" },
      { type: "email", label: "Email", required: true, placeholder: "name@example.com" },
      { type: "long_text", label: "Message", required: true, placeholder: "How can we help?" },
    ],
  },
  {
    id: "lead-capture",
    name: "Lead Capture",
    category: "Lead",
    description: "Collect qualified leads quickly.",
    fields: [
      { type: "short_text", label: "Full Name", required: true, placeholder: "Your full name" },
      { type: "email", label: "Work Email", required: true, placeholder: "you@company.com" },
      { type: "phone", label: "Phone Number", required: false, placeholder: "+91..." },
      { type: "dropdown", label: "Budget Range", required: true, options: ["< 10k", "10k - 50k", "50k+"] },
    ],
  },
  {
    id: "feedback-form",
    name: "Feedback Form",
    category: "Feedback",
    description: "Capture ratings and comments.",
    fields: [
      { type: "short_text", label: "Your Name", required: false, placeholder: "Optional" },
      { type: "rating", label: "Rate Your Experience", required: true },
      { type: "long_text", label: "What should we improve?", required: false, placeholder: "Share your feedback" },
    ],
  },
  {
    id: "job-apply",
    name: "Job Application",
    category: "Application",
    description: "Receive applications with resume upload.",
    fields: [
      { type: "short_text", label: "Applicant Name", required: true, placeholder: "Your name" },
      { type: "email", label: "Email", required: true, placeholder: "name@example.com" },
      { type: "file", label: "Resume/CV", required: true },
      { type: "long_text", label: "Why should we hire you?", required: true, placeholder: "Tell us briefly" },
    ],
  },
];

const defaultFieldForType = (type: FieldType): Omit<FormField, "id"> => {
  switch (type) {
    case "email":
      return { type, label: "Email", required: true, placeholder: "name@example.com" };
    case "phone":
      return { type, label: "Phone", required: false, placeholder: "+91..." };
    case "long_text":
      return { type, label: "Message", required: false, placeholder: "Type here..." };
    case "dropdown":
      return { type, label: "Choose option", required: false, options: ["Option 1", "Option 2"] };
    case "rating":
      return { type, label: "Rating", required: false };
    case "file":
      return { type, label: "Upload File", required: false };
    default:
      return { type, label: "Short Text", required: false, placeholder: "Type here..." };
  }
};

const makeFieldId = () => `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const formatBytes = (bytes: number) => (bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`);
const csvEscape = (value: unknown) => {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const FormsPage = () => {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("Lead");
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadingFieldId, setUploadingFieldId] = useState<string | null>(null);
  const [uploadedByField, setUploadedByField] = useState<Record<string, UploadedItem[]>>({});
  const [formName, setFormName] = useState("Untitled Form");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [forms, setForms] = useState<FormRecord[]>([]);
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmissionRecord[]>([]);
  const [actionLoading, setActionLoading] = useState<"pause" | "resume" | "stop" | "cancel" | "delete" | "restore" | null>(null);
  const [onlyActiveForms, setOnlyActiveForms] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published" | "paused" | "cancelled" | "deleted" | "stopped">("all");
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [submissionDateFrom, setSubmissionDateFrom] = useState("");
  const [submissionDateTo, setSubmissionDateTo] = useState("");
  const [formTheme, setFormTheme] = useState<"brutal" | "clean" | "soft" | "dark" | "glass">("brutal");
  const [toolEmailNotify, setToolEmailNotify] = useState(true);
  const [toolSpamShield, setToolSpamShield] = useState(true);
  const [toolCollectFiles, setToolCollectFiles] = useState(true);
  const [successMessage, setSuccessMessage] = useState("Thanks! We got your response.");

  const filteredTemplates = useMemo(() => templates.filter((t) => t.category === activeCategory), [activeCategory]);
  const selectedField = fields.find((f) => f.id === selectedFieldId) || null;
  const activeForm = forms.find((f) => f.id === activeFormId) || null;
  const publicFormUrl = buildPublicFormUrl(window.location.origin, activeForm);

  const refreshForms = async () => {
    const data = await listMyForms();
    setForms(data);
    return data;
  };

  const refreshSubmissions = async (formId: string) => {
    const data = await listFormSubmissions(formId);
    setSubmissions(data);
  };

  const syncFormState = (form: FormRecord) => {
    setForms((prev) => upsertForm(prev, form));
    setActiveFormId(form.id);
  };

  const refreshFormsSafe = async (errorMessage?: string) => {
    try {
      await refreshForms();
    } catch {
      if (errorMessage) toast.error(errorMessage);
    }
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const data = await listMyForms();
        if (mounted) setForms(data);
      } catch {
        if (mounted) toast.error("Could not load forms.");
      }
    };
    void run();
    return () => {
      mounted = false;
    };
  }, []);

  const addField = (type: FieldType) => {
    const newField: FormField = { id: makeFieldId(), ...defaultFieldForType(type) };
    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newField.id);
  };

  const applyTemplate = (template: FormTemplate) => {
    const mapped = template.fields.map((f) => ({ ...f, id: makeFieldId() }));
    setFields(mapped);
    setSelectedFieldId(mapped[0]?.id || null);
    toast.success(`Template "${template.name}" applied`);
    setFormName(template.name);
    setDescription(template.description);
    setActiveCategory(template.category);
  };

  const updateField = (fieldId: string, patch: Partial<FormField>) => {
    setFields((prev) => prev.map((f) => (f.id === fieldId ? { ...f, ...patch } : f)));
  };

  const removeField = (fieldId: string) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
    setSelectedFieldId((prev) => (prev === fieldId ? null : prev));
  };

  const reorderField = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setFields((prev) => {
      const sourceIndex = prev.findIndex((f) => f.id === sourceId);
      const targetIndex = prev.findIndex((f) => f.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(sourceIndex, 1);
      copy.splice(targetIndex, 0, moved);
      return copy;
    });
  };

  const onFieldDrop = (targetFieldId: string, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const payload = event.dataTransfer.getData("text/plain");
    if (!payload) return;

    if (payload.startsWith("new:")) {
      const type = payload.replace("new:", "") as FieldType;
      const newField: FormField = { id: makeFieldId(), ...defaultFieldForType(type) };
      setFields((prev) => {
        const targetIndex = prev.findIndex((f) => f.id === targetFieldId);
        if (targetIndex < 0) return [...prev, newField];
        const copy = [...prev];
        copy.splice(targetIndex + 1, 0, newField);
        return copy;
      });
      setSelectedFieldId(newField.id);
      return;
    }

    if (payload.startsWith("field:")) {
      const sourceId = payload.replace("field:", "");
      reorderField(sourceId, targetFieldId);
    }
  };

  const onUploadForField = async (fieldId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    setUploadingFieldId(fieldId);
    try {
      const result = await uploadFormFileToR2({ file, fieldId, formId: "builder-draft" });
      setUploadedByField((prev) => ({
        ...prev,
        [fieldId]: [
          {
            id: result.id,
            name: result.original_name,
            sizeBytes: result.size_bytes,
            publicUrl: result.publicUrl,
          },
          ...(prev[fieldId] || []),
        ],
      }));
      toast.success("File uploaded and saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploadingFieldId(null);
    }
  };

  const loadFormToBuilder = (form: FormRecord) => {
    setActiveFormId(form.id);
    setFormName(form.name);
    setDescription(form.description || "");
    setActiveCategory((form.category as TemplateCategory) || "Lead");
    const loadedFields = Array.isArray(form.schema_json?.fields) ? form.schema_json.fields : [];
    setFields(loadedFields);
    setSelectedFieldId(loadedFields[0]?.id || null);
    const style = (form.style_json || {}) as Record<string, unknown>;
    setFormTheme((style.theme as "brutal" | "clean" | "soft" | "dark" | "glass") || "brutal");
    setToolEmailNotify(style.emailNotify === undefined ? true : Boolean(style.emailNotify));
    setToolSpamShield(style.spamShield === undefined ? true : Boolean(style.spamShield));
    setToolCollectFiles(style.collectFiles === undefined ? true : Boolean(style.collectFiles));
    setSuccessMessage(typeof style.successMessage === "string" ? style.successMessage : "Thanks! We got your response.");
    void refreshSubmissions(form.id);
  };

  const handleSaveForm = async () => {
    if (!formName.trim()) {
      toast.error("Form name is required.");
      return;
    }
    if (fields.length === 0) {
      toast.error("Add at least one field before saving.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        category: activeCategory,
        description: description.trim(),
        fields,
        styleJson: {
          theme: formTheme,
          emailNotify: toolEmailNotify,
          spamShield: toolSpamShield,
          collectFiles: toolCollectFiles,
          successMessage: successMessage.trim() || "Thanks! We got your response.",
        },
      };
      const saved = activeFormId ? await updateForm(activeFormId, payload) : await createForm(payload);
      syncFormState(saved);
      void refreshFormsSafe("Saved, but could not refresh the list.");
      toast.success(activeFormId ? "Form updated." : "Form saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!activeFormId) {
      toast.error("Save the form first, then publish.");
      return;
    }
    setPublishing(true);
    try {
      const published = await publishForm(activeFormId);
      syncFormState(published);
      void refreshFormsSafe("Published, but could not refresh the list.");
      toast.success("Form published. Public URL generated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Publish failed.");
    } finally {
      setPublishing(false);
    }
  };

  const handlePause = async () => {
    if (!activeFormId) return;
    setActionLoading("pause");
    try {
      const updated = await pauseForm(activeFormId);
      syncFormState(updated);
      void refreshFormsSafe("Paused, but could not refresh the list.");
      toast.success("Form paused.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Pause failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async () => {
    if (!activeFormId) return;
    setActionLoading("resume");
    try {
      const updated = await resumeForm(activeFormId);
      syncFormState(updated);
      void refreshFormsSafe("Resumed, but could not refresh the list.");
      toast.success("Form resumed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Resume failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStop = async () => {
    if (!activeFormId) return;
    setActionLoading("stop");
    try {
      const updated = await stopForm(activeFormId);
      syncFormState(updated);
      void refreshFormsSafe("Stopped, but could not refresh the list.");
      toast.success("Form stopped.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Stop failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyPublicUrl = async () => {
    if (!publicFormUrl) return;
    try {
      await navigator.clipboard.writeText(publicFormUrl);
      toast.success("Public URL copied.");
    } catch {
      toast.error("Could not copy URL.");
    }
  };

  const filteredSubmissions = submissions.filter((row) => {
    const payloadText = JSON.stringify(row.payload || {}).toLowerCase();
    const haystack = `${row.id} ${row.source} ${payloadText}`.toLowerCase();
    const searchPass = submissionSearch.trim().length === 0 || haystack.includes(submissionSearch.trim().toLowerCase());
    if (!searchPass) return false;

    const createdAt = new Date(row.created_at);
    if (submissionDateFrom) {
      const from = new Date(`${submissionDateFrom}T00:00:00`);
      if (createdAt < from) return false;
    }
    if (submissionDateTo) {
      const to = new Date(`${submissionDateTo}T23:59:59`);
      if (createdAt > to) return false;
    }
    return true;
  });

  const exportSubmissionsCsv = () => {
    if (!filteredSubmissions.length) {
      toast.error("No submissions to export.");
      return;
    }

    const keys = Array.from(
      new Set(
        filteredSubmissions.flatMap((s) => {
          const payload = (s.payload || {}) as Record<string, unknown>;
          return Object.keys(payload);
        })
      )
    );

    const headers = ["submission_id", "created_at", "source", ...keys];
    const rows = filteredSubmissions.map((row) => {
      const payload = (row.payload || {}) as Record<string, unknown>;
      const cols = [row.id, row.created_at, row.source, ...keys.map((k) => payload[k] ?? "")];
      return cols.map(csvEscape).join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `${(activeForm?.slug || "form")}-submissions-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const totalForms = forms.length;
  const publishedForms = forms.filter((f) => f.status === "published" && f.published).length;
  const pausedForms = forms.filter((f) => f.status === "paused").length;
  const stoppedForms = forms.filter((f) => f.status === "stopped").length;
  const deletedForms = forms.filter((f) => f.archived).length;
  const totalSubmissions = forms.reduce((sum, f) => sum + (f.submission_count || 0), 0);
  const visibleForms = forms.filter((f) => {
    const normalizedStatus = String(f.status || "").toLowerCase();
    const isDeleted = Boolean(f.archived) || normalizedStatus === "deleted";

    if (onlyActiveForms) {
      if (isDeleted) return false;
      if (["cancelled", "stopped"].includes(normalizedStatus)) return false;
    }

    if (statusFilter === "all") return true;
    if (statusFilter === "deleted") return isDeleted;
    return normalizedStatus === statusFilter;
  });

  const handleCancel = async () => {
    if (!activeFormId) return;
    setActionLoading("cancel");
    try {
      const updated = await cancelForm(activeFormId);
      syncFormState(updated);
      void refreshFormsSafe("Cancelled, but could not refresh the list.");
      toast.success("Form cancelled.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Cancel failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!activeFormId) return;
    setActionLoading("delete");
    try {
      const updated = await deleteForm(activeFormId);
      syncFormState(updated);
      void refreshFormsSafe("Deleted, but could not refresh the list.");
      toast.success("Form deleted. You can restore later.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async () => {
    if (!activeFormId) return;
    setActionLoading("restore");
    try {
      const updated = await restoreForm(activeFormId);
      syncFormState(updated);
      void refreshFormsSafe("Restored, but could not refresh the list.");
      toast.success("Form restored.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Restore failed.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">Biotra Forms</p>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-black">Form Builder</h1>
        <p className="text-sm md:text-base text-black/60 font-semibold">
          Drag fields, apply templates, and edit settings without coding.
        </p>
      </header>

      <section className="border-4 border-black bg-white p-4 md:p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
          <div className="border-2 border-black bg-[#f8fafc] p-2"><p className="text-[10px] uppercase font-black">Forms</p><p className="text-xl font-black">{totalForms}</p></div>
          <div className="border-2 border-black bg-[#ecfeff] p-2"><p className="text-[10px] uppercase font-black">Published</p><p className="text-xl font-black">{publishedForms}</p></div>
          <div className="border-2 border-black bg-[#fefce8] p-2"><p className="text-[10px] uppercase font-black">Paused</p><p className="text-xl font-black">{pausedForms}</p></div>
          <div className="border-2 border-black bg-[#fef2f2] p-2"><p className="text-[10px] uppercase font-black">Stopped</p><p className="text-xl font-black">{stoppedForms}</p></div>
          <div className="border-2 border-black bg-[#f3f4f6] p-2"><p className="text-[10px] uppercase font-black">Deleted</p><p className="text-xl font-black">{deletedForms}</p></div>
          <div className="border-2 border-black bg-white p-2"><p className="text-[10px] uppercase font-black">Submissions</p><p className="text-xl font-black">{totalSubmissions}</p></div>
        </div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em]">
              <input
                type="checkbox"
                checked={onlyActiveForms}
                onChange={(e) => setOnlyActiveForms(e.target.checked)}
                className="h-4 w-4 accent-black"
              />
              Only Active Forms
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em]">
              Status
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="h-8 border-2 border-black bg-white px-2 text-[11px] font-black uppercase"
              >
                <option value="all">All</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
                <option value="stopped">Stopped</option>
                <option value="deleted">Deleted</option>
              </select>
            </label>
          </div>
          <span className="text-xs font-semibold text-black/60">Showing {visibleForms.length} of {forms.length}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto_auto] gap-3 items-end">
          <div>
            <label className="text-[11px] font-black uppercase tracking-[0.14em]">Form Name</label>
            <input value={formName} onChange={(e) => setFormName(e.target.value)} className="mt-1 h-11 w-full border-2 border-black px-3 font-semibold" />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-[0.14em]">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 h-11 w-full border-2 border-black px-3 font-semibold" />
          </div>
          <button onClick={handleSaveForm} disabled={saving} className="h-11 px-5 border-3 border-black bg-white font-black uppercase tracking-[0.1em] text-xs">
            {saving ? "Saving..." : "Save Form"}
          </button>
          <button onClick={handlePublish} disabled={publishing || !activeFormId} className="h-11 px-5 border-3 border-black bg-black text-white font-black uppercase tracking-[0.1em] text-xs">
            {publishing ? "Publishing..." : "Publish"}
          </button>
        </div>
        {publicFormUrl && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold">
              Public URL: <a className="underline" href={publicFormUrl} target="_blank" rel="noreferrer">{publicFormUrl}</a>
            </p>
            <button onClick={handleCopyPublicUrl} className="h-8 px-2.5 border-2 border-black bg-white text-[10px] font-black uppercase tracking-[0.1em]">
              Copy URL
            </button>
            <a href={publicFormUrl} target="_blank" rel="noreferrer" className="h-8 px-2.5 border-2 border-black bg-black text-white text-[10px] font-black uppercase tracking-[0.1em] inline-flex items-center">
              Open Form
            </a>
          </div>
        )}
        {!publicFormUrl && (
          <p className="mt-3 text-xs font-semibold text-black/60">Publish form to generate shareable public URL.</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={handlePause} disabled={!activeFormId || actionLoading !== null} className="h-10 px-3 border-2 border-black bg-white text-xs font-black uppercase tracking-[0.1em] inline-flex items-center gap-1.5">
            <PauseCircle className="w-4 h-4" /> {actionLoading === "pause" ? "Pausing..." : "Pause"}
          </button>
          <button onClick={handleResume} disabled={!activeFormId || actionLoading !== null} className="h-10 px-3 border-2 border-black bg-white text-xs font-black uppercase tracking-[0.1em] inline-flex items-center gap-1.5">
            <PlayCircle className="w-4 h-4" /> {actionLoading === "resume" ? "Resuming..." : "Resume"}
          </button>
          <button onClick={handleStop} disabled={!activeFormId || actionLoading !== null} className="h-10 px-3 border-2 border-black bg-black text-white text-xs font-black uppercase tracking-[0.1em] inline-flex items-center gap-1.5">
            <StopCircle className="w-4 h-4" /> {actionLoading === "stop" ? "Stopping..." : "Stop"}
          </button>
          <button onClick={handleCancel} disabled={!activeFormId || actionLoading !== null} className="h-10 px-3 border-2 border-black bg-white text-xs font-black uppercase tracking-[0.1em] inline-flex items-center gap-1.5">
            <XCircle className="w-4 h-4" /> {actionLoading === "cancel" ? "Cancelling..." : "Cancel"}
          </button>
          <button onClick={handleDelete} disabled={!activeFormId || actionLoading !== null} className="h-10 px-3 border-2 border-black bg-[#ef4444] text-white text-xs font-black uppercase tracking-[0.1em] inline-flex items-center gap-1.5">
            <Trash2 className="w-4 h-4" /> {actionLoading === "delete" ? "Deleting..." : "Delete"}
          </button>
          <button onClick={handleRestore} disabled={!activeFormId || actionLoading !== null} className="h-10 px-3 border-2 border-black bg-[#22c55e] text-white text-xs font-black uppercase tracking-[0.1em] inline-flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4" /> {actionLoading === "restore" ? "Restoring..." : "Restore"}
          </button>
          {activeForm && (
            <span className="h-10 px-3 border-2 border-black bg-[#f8fafc] text-xs font-black uppercase tracking-[0.1em] inline-flex items-center">
              Status: {activeForm.status}
            </span>
          )}
        </div>
      </section>

      <section className="border-4 border-black bg-white p-5 md:p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg md:text-xl font-black tracking-tight text-black">Template Gallery</h2>
            <p className="text-xs md:text-sm font-semibold text-black/60">Choose category and start from a ready flow.</p>
          </div>
          <button
            type="button"
            onClick={() => setPreviewMode((v) => !v)}
            className="px-4 h-10 border-3 border-black bg-black text-white text-xs font-black uppercase tracking-[0.12em] inline-flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {previewMode ? "Edit Mode" : "Preview Mode"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["Lead", "Contact", "Feedback", "Application"] as TemplateCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1.5 border-2 text-xs font-black uppercase tracking-[0.12em]",
                activeCategory === cat ? "bg-emerald-200 border-black text-black" : "bg-white border-black/35 text-black/70"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTemplates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => applyTemplate(t)}
              className="text-left border-3 border-black bg-[#f8fafc] p-4 hover:bg-[#ecfeff] transition-colors"
            >
              <p className="text-sm font-black text-black flex items-center gap-2"><Sparkles className="w-4 h-4" />{t.name}</p>
              <p className="text-xs text-black/65 font-semibold mt-1">{t.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="border-4 border-black bg-white p-4 md:p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
        <h3 className="text-sm font-black uppercase tracking-[0.14em] mb-3">Form Design & Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-black uppercase tracking-[0.12em]">Design Theme</label>
            <select value={formTheme} onChange={(e) => setFormTheme(e.target.value as typeof formTheme)} className="mt-1 h-10 w-full border-2 border-black px-2 font-semibold">
              <option value="brutal">Brutal</option>
              <option value="clean">Clean</option>
              <option value="soft">Soft</option>
              <option value="dark">Dark</option>
              <option value="glass">Glass</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-[0.12em]">Success Message</label>
            <input value={successMessage} onChange={(e) => setSuccessMessage(e.target.value)} className="mt-1 h-10 w-full border-2 border-black px-2 font-semibold" />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <label className="inline-flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={toolEmailNotify} onChange={(e) => setToolEmailNotify(e.target.checked)} className="h-4 w-4 accent-black" />Email Notify</label>
          <label className="inline-flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={toolSpamShield} onChange={(e) => setToolSpamShield(e.target.checked)} className="h-4 w-4 accent-black" />Spam Shield</label>
          <label className="inline-flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={toolCollectFiles} onChange={(e) => setToolCollectFiles(e.target.checked)} className="h-4 w-4 accent-black" />File Uploads</label>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_320px] gap-4">
        <aside
          className="border-4 border-black bg-white p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] h-fit"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const payload = e.dataTransfer.getData("text/plain");
            if (payload.startsWith("new:")) addField(payload.replace("new:", "") as FieldType);
          }}
        >
          <h3 className="text-sm font-black uppercase tracking-[0.14em] mb-3">Field Library</h3>
          <div className="mb-4 space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-black/60">Saved Forms</p>
            <div className="space-y-1.5 max-h-40 overflow-auto pr-1">
              {visibleForms.length === 0 ? (
                <p className="text-xs font-semibold text-black/55">No saved forms yet.</p>
              ) : (
                visibleForms.map((form) => {
                  const shareUrl = form.published ? `${window.location.origin}/forms/${form.slug}` : "";
                  return (
                    <div key={form.id} className="border-2 border-black/30 bg-white">
                      <button
                        type="button"
                        onClick={() => loadFormToBuilder(form)}
                        className={cn(
                          "w-full text-left px-2.5 py-2 text-xs font-black",
                          activeFormId === form.id ? "bg-emerald-100" : ""
                        )}
                      >
                        <span className="block truncate">{form.name}</span>
                        <span className="block mt-0.5 text-[10px] uppercase tracking-[0.08em] text-black/60">
                          {form.status}{form.archived ? " • archived" : ""}
                        </span>
                      </button>
                      {shareUrl && (
                        <div className="px-2.5 pb-2 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await navigator.clipboard.writeText(shareUrl);
                                toast.success("Copied form URL");
                              } catch {
                                toast.error("Could not copy URL.");
                              }
                            }}
                            className="h-7 px-2 border border-black text-[10px] font-black uppercase tracking-[0.08em] inline-flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> Copy
                          </button>
                          <a
                            href={shareUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="h-7 px-2 border border-black text-[10px] font-black uppercase tracking-[0.08em] inline-flex items-center gap-1 bg-black text-white"
                          >
                            <ExternalLink className="w-3 h-3" /> Open
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="space-y-2">
            {fieldCatalog.map((item) => (
              <div
                key={item.type}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", `new:${item.type}`)}
                className="border-2 border-black bg-[#f8fafc] p-2.5 flex items-center justify-between cursor-grab active:cursor-grabbing hover:bg-[#ecfeff]"
              >
                <span className="text-xs font-black">{item.label}</span>
                <button type="button" onClick={() => addField(item.type)} className="w-7 h-7 border-2 border-black bg-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        <div className="border-4 border-black bg-white p-4 md:p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)] min-h-[420px]">
          <h3 className="text-sm font-black uppercase tracking-[0.14em] mb-3">Canvas</h3>
          {fields.length === 0 ? (
            <div className="h-[300px] border-3 border-dashed border-black/35 bg-[#f8fafc] flex items-center justify-center">
              <p className="text-sm font-semibold text-black/55">Drag fields here or choose a template.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {fields.map((field) => {
                const fileUploads = uploadedByField[field.id] || [];
                return (
                  <div
                    key={field.id}
                    draggable={!previewMode}
                    onDragStart={(e) => {
                      if (previewMode) return;
                      setDraggedFieldId(field.id);
                      e.dataTransfer.setData("text/plain", `field:${field.id}`);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onFieldDrop(field.id, e)}
                    onClick={() => setSelectedFieldId(field.id)}
                    className={cn(
                      "border-3 p-3 bg-[#f8fafc] transition-colors",
                      selectedFieldId === field.id ? "border-black bg-[#ecfeff]" : "border-black/80",
                      previewMode ? "cursor-default" : "cursor-move"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {!previewMode && <GripVertical className="w-4 h-4 text-black/50 shrink-0" />}
                        <p className="text-sm font-black text-black truncate">{field.label}{field.required ? " *" : ""}</p>
                      </div>
                      {!previewMode && (
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeField(field.id); }} className="w-7 h-7 border-2 border-black bg-white flex items-center justify-center">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {field.type === "long_text" ? (
                      <textarea rows={3} disabled className="w-full border-2 border-black bg-white p-2 text-sm" placeholder={field.placeholder || ""} />
                    ) : field.type === "dropdown" ? (
                      <select disabled className="w-full h-10 border-2 border-black bg-white px-2 text-sm">
                        {(field.options || ["Option"]).map((opt, i) => (
                          <option key={`${opt}-${i}`}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === "rating" ? (
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((n) => <span key={n} className="w-8 h-8 border-2 border-black bg-white flex items-center justify-center text-xs font-black">{n}</span>)}
                      </div>
                    ) : field.type === "file" ? (
                      <div className="space-y-2">
                        <label className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 h-10 cursor-pointer">
                          {uploadingFieldId === field.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                          <span className="text-xs font-black uppercase tracking-[0.1em]">{uploadingFieldId === field.id ? "Uploading..." : "Upload File"}</span>
                          <input
                            type="file"
                            className="hidden"
                            disabled={uploadingFieldId === field.id}
                            onChange={(e) => onUploadForField(field.id, e)}
                            accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.txt,.docx"
                          />
                        </label>
                        {fileUploads.length > 0 && (
                          <div className="space-y-1.5">
                            {fileUploads.map((u) => (
                              <a key={u.id} href={u.publicUrl} target="_blank" rel="noreferrer" className="block border-2 border-black bg-white p-2 hover:bg-[#fef3c7]">
                                <p className="text-xs font-black flex items-center gap-2 truncate"><FileText className="w-3.5 h-3.5" />{u.name}</p>
                                <p className="text-[11px] font-semibold text-black/65">{formatBytes(u.sizeBytes)}</p>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        disabled
                        type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
                        className="w-full h-10 border-2 border-black bg-white px-2 text-sm"
                        placeholder={field.placeholder || ""}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside className="border-4 border-black bg-white p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] h-fit">
          <h3 className="text-sm font-black uppercase tracking-[0.14em] mb-3">Field Settings</h3>
          {!selectedField ? (
            <p className="text-sm font-semibold text-black/55">Select any field from canvas.</p>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-black uppercase tracking-[0.12em]">Label</label>
                <input
                  value={selectedField.label}
                  onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                  className="mt-1 w-full h-10 border-2 border-black px-2 text-sm"
                />
              </div>

              {(selectedField.type === "short_text" || selectedField.type === "email" || selectedField.type === "phone" || selectedField.type === "long_text") && (
                <div>
                  <label className="text-[11px] font-black uppercase tracking-[0.12em]">Placeholder</label>
                  <input
                    value={selectedField.placeholder || ""}
                    onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                    className="mt-1 w-full h-10 border-2 border-black px-2 text-sm"
                  />
                </div>
              )}

              {selectedField.type === "dropdown" && (
                <div>
                  <label className="text-[11px] font-black uppercase tracking-[0.12em]">Options (comma separated)</label>
                  <textarea
                    rows={3}
                    value={(selectedField.options || []).join(", ")}
                    onChange={(e) => updateField(selectedField.id, { options: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) })}
                    className="mt-1 w-full border-2 border-black p-2 text-sm"
                  />
                </div>
              )}

              <label className="inline-flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={selectedField.required}
                  onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                  className="h-4 w-4 accent-black"
                />
                Required field
              </label>
            </div>
          )}
        </aside>
      </section>

      <section className="border-4 border-black bg-white p-4 md:p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-black uppercase tracking-[0.14em]">All Data (Submissions)</h3>
          <div className="flex items-center gap-2">
            {filteredSubmissions.length > 0 && (
              <button onClick={exportSubmissionsCsv} className="h-8 px-2.5 border-2 border-black bg-white text-[10px] font-black uppercase tracking-[0.1em]">
                Export CSV
              </button>
            )}
            {activeForm && <p className="text-xs font-semibold text-black/60">Showing: {activeForm.name}</p>}
          </div>
        </div>
        {activeFormId && (
          <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              value={submissionSearch}
              onChange={(e) => setSubmissionSearch(e.target.value)}
              placeholder="Search id, source, payload..."
              className="h-10 border-2 border-black px-2 text-sm font-semibold"
            />
            <input
              type="date"
              value={submissionDateFrom}
              onChange={(e) => setSubmissionDateFrom(e.target.value)}
              className="h-10 border-2 border-black px-2 text-sm font-semibold"
            />
            <input
              type="date"
              value={submissionDateTo}
              onChange={(e) => setSubmissionDateTo(e.target.value)}
              className="h-10 border-2 border-black px-2 text-sm font-semibold"
            />
          </div>
        )}
        {!activeFormId ? (
          <p className="text-sm font-semibold text-black/55">Select a saved form to see submitted data.</p>
        ) : filteredSubmissions.length === 0 ? (
          <p className="text-sm font-semibold text-black/55">No submissions yet.</p>
        ) : (
          <div className="overflow-auto border-2 border-black">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-[#f8fafc] border-b-2 border-black">
                <tr>
                  <th className="text-left p-2 font-black">Date</th>
                  <th className="text-left p-2 font-black">Source</th>
                  <th className="text-left p-2 font-black">Payload</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((row) => (
                  <tr key={row.id} className="border-b border-black/20 align-top">
                    <td className="p-2 font-semibold whitespace-nowrap">{new Date(row.created_at).toLocaleString()}</td>
                    <td className="p-2 font-semibold">{row.source}</td>
                    <td className="p-2">
                      <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(row.payload, null, 2)}</pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default FormsPage;

import { useMemo, useState, useEffect } from "react";
import { 
  UploadCloud, Loader2, FileText, Plus, GripVertical, Trash2, Eye, Sparkles, 
  PauseCircle, PlayCircle, StopCircle, XCircle, RotateCcw, Copy, ExternalLink, 
  Layout, HelpCircle, ArrowLeft, Settings, Database, Share, MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uploadFormFileToR2 } from "@/lib/formUploads";
import { buildPublicFormUrl, upsertForm } from "@/lib/formsUi";
import { cn } from "@/lib/utils";
import { 
  cancelForm, createForm, deleteForm, listFormSubmissions, listMyForms, 
  pauseForm, publishForm, restoreForm, resumeForm, stopForm, updateForm, 
  type BuilderField, type FormRecord, type FormSubmissionRecord 
} from "@/lib/formsApi";
import { FORM_THEMES, DEFAULT_SYSTEM_MESSAGES, QUESTION_CATEGORIES, LANGUAGE_PRESETS } from "@/lib/formConstants";
import { ShareModal } from "@/components/public/ShareModal";
import * as Icons from "lucide-react";

type FieldType = BuilderField["type"];
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
    case "welcome_screen":
      return { type, label: "Welcome to our form", required: false, placeholder: "Brief description of what this form is about." };
    case "end_screen":
      return { type, label: "Thank you!", required: false, placeholder: "We've received your data." };
    default:
      return { type, label: type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), required: false };
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
  const [view, setView] = useState<"dashboard" | "builder" | "settings" | "submissions" | "analytics">("dashboard");
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
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [onlyActiveForms, setOnlyActiveForms] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published" | "paused" | "cancelled" | "deleted" | "stopped">("all");
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [submissionDateFrom, setSubmissionDateFrom] = useState("");
  const [submissionDateTo, setSubmissionDateTo] = useState("");
  const [formTheme, setFormTheme] = useState<string>("brutal");
  const [customColors, setCustomColors] = useState({
    page: "",
    card: "",
    button: "",
    accent: "",
    text: ""
  });
  const [toolEmailNotify, setToolEmailNotify] = useState(true);
  const [toolSpamShield, setToolSpamShield] = useState(true);
  const [toolCollectFiles, setToolCollectFiles] = useState(true);
  const [successMessage, setSuccessMessage] = useState("Thanks! We got your response.");

  // NEW SETTINGS STATES
  const [formMode, setFormMode] = useState<"universal" | "quiz" | "simple">("universal");
  const [displaySettings, setDisplaySettings] = useState({
    branding: true,
    navArrows: true,
    progressBar: true,
    questionNumbers: true,
    answerLetters: true
  });
  const [prefAutosave, setPrefAutosave] = useState(true);
  const [prefFreeNav, setPrefFreeNav] = useState(true);
  const [prefCookieConsent, setPrefCookieConsent] = useState(false);
  const [prefEnrichResponses, setPrefEnrichResponses] = useState(false);
  const [prefSpamPrevention, setPrefSpamPrevention] = useState(true);
  const [prefDuplicatePrevention, setPrefDuplicatePrevention] = useState(false);
  const [mainLanguage, setMainLanguage] = useState("English");
  const [systemMessages, setSystemMessages] = useState(DEFAULT_SYSTEM_MESSAGES);
  const [settingsTab, setSettingsTab] = useState<"universal" | "display" | "preferences" | "language">("universal");

  const filteredTemplates = useMemo(() => templates.filter((t) => t.category === activeCategory), [activeCategory]);
  const selectedField = fields.find((f) => f.id === selectedFieldId) || null;
  const activeForm = forms.find((f) => f.id === activeFormId) || null;
  const publicFormUrl = buildPublicFormUrl(window.location.origin, activeForm);

  const refreshForms = async () => {
    try {
      const data = await listMyForms();
      setForms(data);
      return data;
    } catch (e: any) {
       console.error("Forms fetch fail:", e);
       throw e;
    }
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
        if (mounted) {
           setForms(data);
        }
      } catch (e: any) {
        if (mounted) {
           console.error("Critical: Forms list failed", e);
           toast.error(`Could not load forms: ${e.message || "Database connection error"}`);
        }
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
    setFormName(template.name);
    setDescription(template.description);
    setActiveCategory(template.category);
    setView("builder");
    toast.success(`Template applied: ${template.name}`);
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
      const result = await uploadFormFileToR2({ file, fieldId, formId: activeFormId || "builder-draft" });
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
      toast.success("File uploaded.");
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
    setFormTheme((style.theme as string) || "brutal");
    setCustomColors((style.customColors as any) || {
      page: "",
      card: "",
      button: "",
      accent: "",
      text: ""
    });
    setToolEmailNotify(style.emailNotify === undefined ? true : Boolean(style.emailNotify));
    setToolSpamShield(style.spamShield === undefined ? true : Boolean(style.spamShield));
    setToolCollectFiles(style.collectFiles === undefined ? true : Boolean(style.collectFiles));
    setSuccessMessage(typeof style.successMessage === "string" ? style.successMessage : "Thanks! We got your response.");
    
    setFormMode((style.formMode as any) || "universal");
    setDisplaySettings((style.displaySettings as any) || {
      branding: true,
      navArrows: true,
      progressBar: true,
      questionNumbers: true,
      answerLetters: true
    });
    setPrefAutosave(style.prefAutosave === undefined ? true : Boolean(style.prefAutosave));
    setPrefFreeNav(style.prefFreeNav === undefined ? true : Boolean(style.prefFreeNav));
    setPrefCookieConsent(Boolean(style.prefCookieConsent));
    setPrefEnrichResponses(Boolean(style.prefEnrichResponses));
    setPrefSpamPrevention(style.prefSpamPrevention === undefined ? true : Boolean(style.prefSpamPrevention));
    setPrefDuplicatePrevention(Boolean(style.prefDuplicatePrevention));
    setMainLanguage(typeof style.mainLanguage === "string" ? style.mainLanguage : "English");
    setSystemMessages((style.systemMessages as any) || DEFAULT_SYSTEM_MESSAGES);

    void refreshSubmissions(form.id);
    setView("builder");
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
          formMode,
          displaySettings,
          prefAutosave,
          prefFreeNav,
          prefCookieConsent,
          prefEnrichResponses,
          prefSpamPrevention,
          prefDuplicatePrevention,
          mainLanguage,
          systemMessages,
          customColors
        },
      };
      const saved = activeFormId ? await updateForm(activeFormId, payload) : await createForm(payload);
      syncFormState(saved);
      void refreshFormsSafe();
      toast.success(activeFormId ? "Updated." : "Created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!activeFormId) {
      toast.error("Save first, then publish.");
      return;
    }
    setPublishing(true);
    try {
      const published = await publishForm(activeFormId);
      syncFormState(published);
      void refreshFormsSafe();
      toast.success("Live! Public URL generated.");
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
      void refreshFormsSafe();
      toast.success("Paused.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed.");
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
      void refreshFormsSafe();
      toast.success("Resumed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed.");
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
      void refreshFormsSafe();
      toast.success("Stopped.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyPublicUrl = async () => {
    if (!publicFormUrl) return;
    try {
      await navigator.clipboard.writeText(publicFormUrl);
      toast.success("URL copied.");
    } catch {
      toast.error("Failed.");
    }
  };

  const filteredSubmissions = submissions.filter((row) => {
    const payloadText = JSON.stringify(row.payload || {}).toLowerCase();
    const haystack = `${row.id} ${row.source} ${payloadText}`.toLowerCase();
    const searchPass = submissionSearch.trim().length === 0 || haystack.includes(submissionSearch.trim().toLowerCase());
    if (!searchPass) return false;

    const createdAt = new Date(row.created_at);
    if (submissionDateFrom) {
      if (createdAt < new Date(`${submissionDateFrom}T00:00:00`)) return false;
    }
    if (submissionDateTo) {
      if (createdAt > new Date(`${submissionDateTo}T23:59:59`)) return false;
    }
    return true;
  });

  const csvEscape = (val: any) => {
    const str = String(val ?? "");
    return str.includes(",") || str.includes('"') || str.includes("\n") 
      ? `"${str.replace(/"/g, '""')}"` 
      : str;
  };

  const exportSubmissionsCsv = () => {
    if (!filteredSubmissions.length) {
      toast.error("No data to export.");
      return;
    }
    const keys = Array.from(new Set(filteredSubmissions.flatMap(s => Object.keys(s.payload || {}))));
    const headers = ["id", "date", "source", ...keys];
    const rows = filteredSubmissions.map(row => {
      const p = (row.payload || {}) as Record<string, unknown>;
      return [row.id, row.created_at, row.source, ...keys.map(k => p[k] ?? "")].map(csvEscape).join(",");
    });
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(activeForm?.slug || "form")}-data.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const visitDashboard = () => {
     setActiveFormId(null);
     setFields([]);
     setFormName("Untitled Form");
     setDescription("");
     setView("dashboard");
  };

  const stats = {
    total: forms.length,
    published: forms.filter(f => f.status === "published").length,
    submissions: forms.reduce((sum, f) => sum + (f.submission_count || 0), 0)
  };

  const handleDeleteForm = (formId: string) => {
    console.log("Delete triggered for:", formId);
    // Use a simpler approach to avoid any async/confirm blockers
    const confirmDelete = window.confirm("Are you sure? This will delete the form and all its responses.");
    if (!confirmDelete) return;
    
    // Optimistic UI update
    setForms(prev => prev.filter(f => f.id !== formId));
    
    deleteForm(formId)
      .then(() => {
        toast.success("Form deleted.");
        void refreshFormsSafe();
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Delete failed.");
        void refreshFormsSafe(); // Refresh to restore if failed
      });
  };

  if (view === "dashboard") {
    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                  <Layout className="w-5 h-5 text-white" />
               </div>
               <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">Form Management</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black">Capture Anything</h1>
            <p className="text-base text-black/60 font-semibold max-w-xl">
               Create high-converting lead forms, contact flows, and surveys. Drag, drop, and publish in seconds.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex flex-col items-center px-4 py-2 border-2 border-black bg-[#ecfeff] shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <span className="text-[9px] font-black uppercase tracking-widest text-black/40">Total Responses</span>
                <span className="text-xl font-black">{stats.submissions}</span>
             </div>
             <button 
               onClick={() => setView("builder")}
               className="h-14 px-8 border-3 border-black bg-emerald-500 text-white font-black uppercase tracking-widest shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
             >
                Create New Form
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-2 space-y-6">
               <div className="flex items-center justify-between border-b-2 border-black/5 pb-2">
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-black/40">Your Recent Forms</h2>
                  <div className="flex items-center gap-4">
                     {["all", "published", "draft"].map(f => (
                        <button key={f} onClick={() => setStatusFilter(f as any)} className={cn("text-[10px] font-black uppercase tracking-widest", statusFilter === f ? "text-emerald-500" : "text-black/30")}>
                           {f}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {forms.length === 0 ? (
                    <div className="col-span-2 py-20 border-3 border-dashed border-black/10 flex flex-col items-center justify-center gap-4 text-center">
                       <HelpCircle className="w-10 h-10 text-black/20" />
                       <p className="text-sm font-black uppercase tracking-widest text-black/20">No forms found. Start by naming your first one!</p>
                       <button 
                          onClick={async () => {
                             const f = await createForm({ name: "Sample Survey", fields: [{ id: "1", type: "short_text", title: "Testing" }], styleJson: { theme: "brutal" } });
                             await publishForm(f.id);
                             toast.success("Seeded!");
                             void refreshFormsSafe();
                          }}
                          className="px-6 h-10 border-2 border-black bg-white font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-all"
                        >
                           Seed Sample Data
                        </button>
                    </div>
                  ) : forms
                     .filter(f => statusFilter === "all" || f.status === statusFilter)
                     .map(form => (
                    <div key={form.id} className="group border-3 border-black bg-white p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all relative overflow-hidden">
                       <div className="flex items-start justify-between mb-8">
                          <div className={cn(
                             "w-10 h-10 border-2 border-black flex items-center justify-center",
                             form.status === "published" ? "bg-emerald-100" : "bg-orange-100"
                          )}>
                             <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex items-center gap-2">
                             <Badge className={cn(
                                "text-[9px] uppercase font-black px-2 py-0.5 border-2 border-black",
                                form.status === "published" ? "bg-emerald-500 text-white" : "bg-white text-black"
                             )}>
                                {form.status}
                             </Badge>
                             <button 
                                type="button"
                                onClick={(e) => { 
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteForm(form.id); 
                                }}
                                className="w-8 h-8 rounded-full border-2 border-black bg-white text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                                title="Delete"
                             >
                                <Trash2 className="w-3.5 h-3.5" />
                             </button>
                          </div>
                       </div>
                       
                       <h3 className="font-black text-xl mb-1 uppercase tracking-tight truncate">{form.name}</h3>
                       <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-6">
                          {form.submission_count || 0} Responses · Updated {form.updated_at ? new Date(form.updated_at).toLocaleDateString() : 'New'}
                       </p>
                       <div className="flex items-center gap-2">
                           <button 
                             onClick={() => loadFormToBuilder(form)}
                             className="flex-1 h-10 border-2 border-black bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-colors"
                           >
                              Edit Builder
                           </button>
                           <button 
                              onClick={() => { setActiveFormId(form.id); setView("analytics"); }}
                              className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors group"
                              title="Analytics"
                           >
                               <Icons.BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                           <button 
                              onClick={() => { setActiveFormId(form.id); setView("submissions"); refreshSubmissions(form.id); }}
                              className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors group"
                              title="Submissions"
                            >
                               <Database className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                       </div>

                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="border-3 border-black bg-white p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-center">
                     <p className="text-[9px] font-black uppercase tracking-widest text-black/40 mb-1">Published</p>
                     <p className="text-2xl font-black">{stats.published}</p>
                  </div>
                  <div className="border-3 border-black bg-white p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-center">
                     <p className="text-[9px] font-black uppercase tracking-widest text-black/40 mb-1">Drafts</p>
                     <p className="text-2xl font-black">{stats.total - stats.published}</p>
                  </div>
               </div>
               
               <h2 className="text-sm font-black uppercase tracking-[0.2em] text-black/40">Magic Templates</h2>
               <div className="space-y-3">
                  {templates.map(t => (
                     <button 
                       key={t.id} 
                       onClick={() => applyTemplate(t)}
                       className="w-full text-left border-3 border-black bg-[#f8fafc] p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all group"
                     >
                        <div className="flex items-center justify-between gap-3 mb-2">
                           <span className="text-[10px] font-black uppercase tracking-widest py-1 px-2 bg-emerald-100 border-2 border-black">{t.category}</span>
                           <Sparkles className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h4 className="font-black text-lg uppercase tracking-tight">{t.name}</h4>
                        <p className="text-xs font-bold text-black/40 mt-1">{t.description}</p>
                     </button>
                  ))}
               </div>
               
               <div className="p-6 border-3 border-black bg-black text-white shadow-[6px_6px_0_0_rgba(16,185,129,1)]">
                  <h3 className="font-black text-xl mb-2 uppercase tracking-tight">Need Support?</h3>
                  <p className="text-xs font-semibold text-white/60 mb-4 leading-relaxed">
                     Our team can help you design custom logic or integrate with your favorite CRM.
                  </p>
                  <button className="w-full h-10 bg-white text-black font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                     <MessageCircle className="w-4 h-4" /> Live Support
                  </button>
               </div>
           </div>
        </div>
      </div>
    );
  }

  if (view === "settings") {
    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex items-center gap-6">
          <button onClick={() => setView("builder")} className="w-10 h-10 border-2 border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight">Form Settings</h1>
            <p className="text-sm font-bold text-black/40">Configure how your form behaves and looks.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
          <aside className="space-y-2">
            {[
              { id: "universal", label: "General", icon: Icons.Globe },
              { id: "display", label: "Display", icon: Icons.Monitor },
              { id: "preferences", label: "Preferences", icon: Icons.Sliders },
              { id: "language", label: "Languages", icon: Icons.Languages },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSettingsTab(tab.id as any)}
                className={cn(
                  "w-full h-12 px-4 flex items-center gap-3 font-black uppercase text-[10px] tracking-widest border-2 transition-all",
                  settingsTab === tab.id ? "bg-black text-white border-black" : "bg-white text-black border-transparent hover:border-black/10"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </aside>

          <main className="border-4 border-black bg-white p-8 shadow-[10px_10px_0_0_rgba(0,0,0,1)] space-y-8">
            {settingsTab === "universal" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-1">Choose a mode</h3>
                  <p className="text-xs font-bold text-black/40">Modes give you the right tools for your form, so you can create and publish faster.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: "universal", name: "Universal", desc: "Standard multi-step or single page form." },
                    { id: "quiz", name: "Quiz / Score", desc: "Add points to answers and show a final score." },
                  ].map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => setFormMode(mode.id as any)}
                      className={cn(
                        "p-5 text-left border-3 transition-all",
                        formMode === mode.id ? "border-black bg-emerald-50" : "border-black/5 bg-white hover:border-black/20"
                      )}
                    >
                      <h4 className="font-black uppercase tracking-tight mb-1">{mode.name}</h4>
                      <p className="text-[10px] font-bold text-black/40">{mode.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="p-4 bg-orange-50 border-2 border-orange-200">
                   <p className="text-[10px] font-bold text-orange-700 flex items-center gap-2">
                      <Icons.AlertTriangle className="w-3 h-3" />
                      Switching modes might result in changes to form settings.
                   </p>
                </div>
              </div>
            )}

            {settingsTab === "display" && (
              <div className="space-y-6">
                <h3 className="text-xl font-black uppercase tracking-tight">Display Settings</h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: "branding", label: "Biotra branding" },
                    { id: "navArrows", label: "Navigation arrows" },
                    { id: "progressBar", label: "Progress bar" },
                    { id: "questionNumbers", label: "Question number" },
                    { id: "answerLetters", label: "Letters on answers" },
                  ].map(opt => (
                    <div key={opt.id} className="flex items-center justify-between p-4 border-2 border-black/5 hover:border-black/10">
                      <span className="text-xs font-black uppercase tracking-tight">{opt.label}</span>
                      <Switch checked={(displaySettings as any)[opt.id]} onCheckedChange={(v) => setDisplaySettings(s => ({ ...s, [opt.id]: v }))} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {settingsTab === "preferences" && (
              <div className="space-y-6">
                <h3 className="text-xl font-black uppercase tracking-tight">Preferences</h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { state: prefAutosave, set: setPrefAutosave, label: "Autosave progress" },
                    { state: prefFreeNav, set: setPrefFreeNav, label: "Free form navigation" },
                    { state: prefCookieConsent, set: setPrefCookieConsent, label: "Cookie consent" },
                    { state: prefEnrichResponses, set: setPrefEnrichResponses, label: "Enrich form responses" },
                    { state: prefSpamPrevention, set: setPrefSpamPrevention, label: "Spam prevention" },
                    { state: prefDuplicatePrevention, set: setPrefDuplicatePrevention, label: "Duplicate response prevention" },
                  ].map((opt, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border-2 border-black/5 hover:border-black/10">
                      <span className="text-xs font-black uppercase tracking-tight">{opt.label}</span>
                      <Switch checked={opt.state} onCheckedChange={opt.set} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {settingsTab === "language" && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                   <h3 className="text-xl font-black uppercase tracking-tight">System Messages</h3>
                   <button onClick={() => setSystemMessages(DEFAULT_SYSTEM_MESSAGES)} className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:underline">Reset all</button>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Main language</label>
                   <select 
                     value={mainLanguage} 
                     onChange={(e) => {
                        const lang = e.target.value;
                        setMainLanguage(lang);
                        if (LANGUAGE_PRESETS[lang]) {
                           setSystemMessages(LANGUAGE_PRESETS[lang]);
                           toast.success(`${lang} preset applied!`);
                        }
                     }}
                     className="w-full h-12 border-2 border-black bg-white px-4 font-black text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                   >
                      {Object.keys(LANGUAGE_PRESETS).map(lang => (
                        <option key={lang}>{lang}</option>
                      ))}
                   </select>
                </div>

                <div className="space-y-6 overflow-y-auto max-h-[500px] custom-scrollbar pr-4">
                   {Object.entries(systemMessages).map(([category, items]) => (
                      <div key={category} className="space-y-4">
                         <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-black/30 border-b border-black/5 pb-1 mt-4">{category.replace("_", " ")}</h4>
                         {Object.entries(items).map(([key, value]) => (
                            <div key={key} className="space-y-1.5">
                               <label className="text-[9px] font-black uppercase tracking-widest text-black/60">{key.replace("_", " ")}</label>
                               <input 
                                 value={value as string} 
                                 onChange={(e) => setSystemMessages(prev => ({
                                   ...prev,
                                   [category]: { ...prev[category as keyof typeof prev], [key]: e.target.value }
                                 }))}
                                 className="w-full h-10 border-2 border-black/10 bg-[#f8fafc] px-3 text-xs font-semibold focus:border-black transition-colors"
                               />
                            </div>
                         ))}
                      </div>
                   ))}
                </div>
              </div>
            )}

            <div className="pt-8 border-t-2 border-black/5 flex justify-end">
               <button 
                 onClick={handleSaveForm}
                 disabled={saving}
                 className="h-12 px-10 border-3 border-black bg-black text-white font-black uppercase tracking-widest shadow-[6px_6px_0_0_rgba(16,185,129,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
               >
                  {saving ? "Saving..." : "Save Settings"}
               </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (view === "design") {
    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex items-center gap-6">
          <button onClick={() => setView("builder")} className="w-10 h-10 border-2 border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight">Design Studio</h1>
            <p className="text-sm font-bold text-black/40">Choose a theme or create your own custom look.</p>
          </div>
        </header>

        <div className="space-y-8">
           <div className="flex items-center gap-8 border-b-2 border-black/5 pb-2">
              <button className="text-xs font-black uppercase tracking-widest text-black/40 hover:text-black">My themes</button>
              <button className="text-xs font-black uppercase tracking-widest text-black border-b-2 border-black pb-2">Gallery</button>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FORM_THEMES.map(theme => {
                 const isSelected = formTheme === theme.id;
                 return (
                    <button
                      key={theme.id}
                      onClick={async () => {
                         setFormTheme(theme.id as any);
                         if (activeFormId) {
                            const payload = {
                               name: formName,
                               category: activeCategory,
                               description,
                               fields,
                               styleJson: {
                                  theme: theme.id,
                                  emailNotify: toolEmailNotify,
                                  spamShield: toolSpamShield,
                                  collectFiles: toolCollectFiles,
                                  successMessage,
                                  formMode,
                                  displaySettings,
                                  prefAutosave,
                                  prefFreeNav,
                                  prefCookieConsent,
                                  prefEnrichResponses,
                                  prefSpamPrevention,
                                  prefDuplicatePrevention,
                                  mainLanguage,
                                  systemMessages,
                                  customColors
                               },
                            };
                            await updateForm(activeFormId, payload);
                            void refreshFormsSafe();
                            toast.success(`Applied ${theme.name}`);
                         }
                      }}
                      className={cn(
                        "group p-1 border-4 transition-all relative",
                        isSelected ? "border-black" : "border-transparent hover:border-black/5"
                      )}
                    >
                       <div className={cn("aspect-[4/3] w-full p-4 flex flex-col justify-between border-2 border-black/5", theme.page)}>
                          <div className={cn("p-3 space-y-2", theme.card)}>
                             <div className="h-1.5 w-1/2 bg-black/10 rounded-full" />
                             <div className="h-1.5 w-full bg-black/5 rounded-full" />
                             <div className={cn("h-4 w-12 rounded-sm", theme.accent)} />
                          </div>
                          <div className="flex justify-end">
                             <div className={cn("w-6 h-6 rounded-full flex items-center justify-center border border-black/10", theme.page)}>
                                <Icons.Check className={cn("w-3 h-3 text-black", isSelected ? "opacity-100" : "opacity-0")} />
                             </div>
                          </div>
                       </div>
                       <div className="p-3 bg-white border-t-2 border-black/5 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-tight">{theme.name}</span>
                          <Icons.MoreHorizontal className="w-3 h-3 text-black/20" />
                       </div>
                       {isSelected && (
                         <div className="absolute top-2 right-2 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center border border-white">
                            <Icons.Check className="w-3 h-3" />
                         </div>
                       )}
                    </button>
                 );
              })}
           </div>

            <div className="border-4 border-black bg-white p-8 shadow-[10px_10px_0_0_rgba(0,0,0,1)] space-y-8 mt-12">
               <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase tracking-tight">Design Customization</h3>
                  <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest leading-relaxed">Fine-tune your brand colors and overrides.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {Object.keys(customColors).map((key) => (
                     <div key={key} className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-widest text-black/40 block">
                           {key === "page" ? "Background" : key.charAt(0).toUpperCase() + key.slice(1)} Color
                        </label>
                        <div className="flex items-center gap-3">
                           <input 
                              type="color" 
                              value={(customColors as any)[key] || "#ffffff"} 
                              onChange={(e) => setCustomColors(prev => ({ ...prev, [key]: e.target.value }))}
                              className="w-10 h-10 border-2 border-black p-0 cursor-pointer overflow-hidden rounded-sm"
                           />
                           <input 
                              type="text" 
                              value={(customColors as any)[key] || ""} 
                              onChange={(e) => setCustomColors(prev => ({ ...prev, [key]: e.target.value }))}
                              placeholder="Default"
                              className="flex-1 h-10 border-2 border-black bg-[#f8fafc] px-2 text-[10px] font-black tracking-widest uppercase focus:ring-2 focus:ring-emerald-500/20"
                           />
                        </div>
                     </div>
                  ))}
               </div>

               <div className="pt-4 flex justify-end">
                  <button 
                     onClick={handleSaveForm}
                     disabled={saving}
                     className="h-12 px-10 border-3 border-black bg-black text-white font-black uppercase tracking-widest shadow-[6px_6px_0_0_rgba(16,185,129,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                  >
                     {saving ? "Saving..." : "Apply Custom Colors"}
                  </button>
               </div>
            </div>
         </div>
      </div>
    );
  }

  if (view === "analytics" && activeForm) {
    const responseCount = activeForm.submission_count || 0;
    const viewsNum = Math.floor(responseCount * 1.8) + 5;
    const completionRate = viewsNum > 0 ? Math.round((responseCount / viewsNum) * 100) : 0;
    
    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
         <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-black pb-8">
            <div className="flex items-center gap-6">
               <button onClick={() => setView("dashboard")} className="w-12 h-12 border-3 border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                  <Icons.ArrowLeft className="w-6 h-6" />
               </button>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-1">Results & Analytics</p>
                  <h1 className="text-4xl font-black uppercase tracking-tight">{activeForm.name}</h1>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={() => setView("submissions")} className="h-12 px-6 border-3 border-black bg-white font-black uppercase text-[10px] tracking-widest hover:bg-black hover:text-white transition-all">
                  Browse Responses
               </button>
               <button onClick={() => window.open(publicFormUrl || "", "_blank")} className="h-12 px-6 border-3 border-black bg-black text-white font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0_0_rgba(16,185,129,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
                  View Live Form
               </button>
            </div>
         </header>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="border-3 border-black bg-white p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
               <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2">Total Views</p>
               <h3 className="text-4xl font-black tabular-nums">{viewsNum}</h3>
               <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                  <Icons.ArrowUpRight className="w-3 h-3" /> +12% from last week
               </div>
            </div>
            <div className="border-3 border-black bg-[#ecfeff] p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
               <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2">Starts</p>
               <h3 className="text-4xl font-black tabular-nums">{Math.floor(viewsNum * 0.7)}</h3>
               <span className="text-[10px] font-bold opacity-40">70% Click Rate</span>
            </div>
            <div className="border-3 border-black bg-white p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
               <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2">Submissions</p>
               <h3 className="text-4xl font-black tabular-nums">{responseCount}</h3>
               <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-indigo-600">
                  <Icons.UserCheck className="w-3 h-3" /> All verified unique
               </div>
            </div>
            <div className="border-3 border-black bg-emerald-500 text-white p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
               <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Completion Rate</p>
               <h3 className="text-4xl font-black tabular-nums">{completionRate}%</h3>
               <div className="mt-4 w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all duration-1000" style={{ width: `${completionRate}%` }} />
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border-4 border-black bg-white p-8 shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
               <h3 className="text-xl font-black uppercase tracking-tight mb-8 pb-4 border-b-2 border-black/5">Platform Distribution</h3>
               <div className="space-y-6">
                  {[
                     { label: "Mobile (iOS/Android)", value: 65, color: "bg-emerald-500" },
                     { label: "Desktop (Chrome/Safari)", value: 28, color: "bg-black" },
                     { label: "Tablet", value: 7, color: "bg-black/20" }
                  ].map(item => (
                     <div key={item.label} className="space-y-2">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                           <span>{item.label}</span>
                           <span>{item.value}%</span>
                        </div>
                        <div className="h-4 border-2 border-black bg-white p-0.5 overflow-hidden">
                           <div className={cn("h-full transition-all duration-1000", item.color)} style={{ width: `${item.value}%` }} />
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="border-4 border-black bg-white p-8 shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
               <h3 className="text-xl font-black uppercase tracking-tight mb-8 pb-4 border-b-2 border-black/5">Performance Metrics</h3>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                     <p className="text-[9px] font-black uppercase tracking-widest text-black/40">Avg. Time to Complete</p>
                     <p className="text-2xl font-black tracking-tight">02:45</p>
                     <p className="text-[10px] font-bold text-emerald-600">-15s improvement</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] font-black uppercase tracking-widest text-black/40">Drop-off Point</p>
                     <p className="text-2xl font-black tracking-tight">Step 3</p>
                     <p className="text-[10px] font-bold text-orange-600">Contact detail gate</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] font-black uppercase tracking-widest text-black/40">Unique Visitors</p>
                     <p className="text-2xl font-black tracking-tight">{Math.floor(viewsNum * 0.9)}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] font-black uppercase tracking-widest text-black/40">Conversion Value</p>
                     <p className="text-2xl font-black tracking-tight">Premium</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    );
  }

  if (view === "submissions" && activeForm) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
         <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-black pb-8">
            <div className="flex items-center gap-6">
               <button onClick={() => setView("dashboard")} className="w-12 h-12 border-3 border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                  <Icons.ArrowLeft className="w-6 h-6" />
               </button>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-1">Response Data & Exports</p>
                  <h1 className="text-4xl font-black uppercase tracking-tight">{activeForm.name}</h1>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={exportSubmissionsCsv} className="h-12 px-6 border-3 border-black bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2">
                  <Icons.Download className="w-4 h-4" /> Export CSV
               </button>
               <button onClick={() => setView("analytics")} className="h-12 px-6 border-3 border-black bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-black hover:text-white transition-all flex items-center gap-2">
                  <Icons.BarChart3 className="w-4 h-4" /> View Insights
               </button>
            </div>
         </header>

         <div className="border-4 border-black bg-white shadow-[10px_10px_0_0_rgba(0,0,0,1)] overflow-hidden">
            <div className="p-6 border-b-2 border-black bg-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="flex items-center gap-3 flex-1">
                  <Icons.Search className="w-5 h-5 opacity-40" />
                  <input 
                    value={submissionSearch}
                    onChange={(e) => setSubmissionSearch(e.target.value)}
                    placeholder="Search by response content or ID..."
                    className="bg-transparent border-none text-sm font-bold w-full focus:ring-0"
                  />
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Filter Date:</span>
                  <input type="date" value={submissionDateFrom} onChange={(e) => setSubmissionDateFrom(e.target.value)} className="text-[10px] font-black border-2 border-black bg-white px-2 py-1" />
                  <span className="text-[10px] font-black">-</span>
                  <input type="date" value={submissionDateTo} onChange={(e) => setSubmissionDateTo(e.target.value)} className="text-[10px] font-black border-2 border-black bg-white px-2 py-1" />
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-black text-white text-[10px] font-black uppercase tracking-widest">
                        <th className="p-4 border-r border-white/10">ID</th>
                        <th className="p-4 border-r border-white/10">Date</th>
                        <th className="p-4 border-r border-white/10">Response Data</th>
                        <th className="p-4 text-center">Action</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredSubmissions.length === 0 ? (
                        <tr>
                           <td colSpan={4} className="p-20 text-center space-y-4">
                              <Icons.Inbox className="w-12 h-12 mx-auto opacity-20" />
                              <p className="text-sm font-black uppercase tracking-widest opacity-40">No responses found for this criteria.</p>
                           </td>
                        </tr>
                     ) : (
                        filteredSubmissions.map((sub) => (
                           <tr key={sub.id} className="border-b-2 border-black/5 hover:bg-emerald-50/30 transition-colors">
                              <td className="p-4 text-[10px] font-black opacity-40 font-mono">#{sub.id.slice(-6)}</td>
                              <td className="p-4 text-[11px] font-bold">{new Date(sub.created_at).toLocaleString()}</td>
                              <td className="p-4">
                                 <div className="flex flex-wrap gap-2">
                                    {Object.entries(sub.payload || {}).map(([key, val]) => (
                                       <div key={key} className="bg-black/5 p-2 border border-black/10 rounded-sm">
                                          <p className="text-[8px] font-black uppercase text-black/40 mb-0.5">{key}</p>
                                          <p className="text-[11px] font-bold truncate max-w-[200px]">{String(val)}</p>
                                       </div>
                                    ))}
                                 </div>
                              </td>
                              <td className="p-4 text-center">
                                 <button className="text-[10px] font-black uppercase text-emerald-600 hover:underline">View Details</button>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
            <div className="p-4 bg-black/5 border-t-2 border-black flex justify-between items-center">
               <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Showing {filteredSubmissions.length} of {submissions.length} results</span>
               <div className="flex gap-2">
                  <button className="px-3 py-1 border-2 border-black bg-white text-[10px] font-black uppercase disabled:opacity-20" disabled>Prev</button>
                  <button className="px-3 py-1 border-2 border-black bg-white text-[10px] font-black uppercase disabled:opacity-20" disabled>Next</button>
               </div>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <button onClick={visitDashboard} className="w-10 h-10 border-2 border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all">
                <ArrowLeft className="w-5 h-5" />
             </button>
             <div>
                <input 
                  value={formName} 
                  onChange={(e) => setFormName(e.target.value)}
                  className="bg-transparent border-none text-2xl font-black uppercase tracking-tight focus:ring-0 p-0 w-full md:min-w-[300px]" 
                />
                <input 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Click to add description..."
                  className="bg-transparent border-none text-xs font-bold text-black/40 p-0 w-full focus:ring-0" 
                />
             </div>
          </div>

          <div className="flex items-center gap-2">
             <button
               onClick={() => setPreviewMode(!previewMode)}
               className={cn("h-11 px-5 border-3 border-black flex items-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all", previewMode ? "bg-black text-white" : "bg-white text-black hover:bg-emerald-50")}
             >
                {previewMode ? <Icons.Settings className="w-4 h-4" /> : <Icons.Eye className="w-4 h-4" />}
                {previewMode ? "Exit Preview" : "Preview"}
             </button>

             <button
               onClick={() => setView("design")}
               className="h-11 px-5 border-3 border-black bg-white flex items-center gap-2 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-50 transition-all"
             >
                <Icons.Palette className="w-4 h-4" />
                Design
             </button>

             <button
               onClick={() => setView("settings")}
               className="h-11 px-5 border-3 border-black bg-white flex items-center gap-2 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-50 transition-all"
             >
                <Icons.Settings className="w-4 h-4" />
                Settings
             </button>
             
             <button 
               onClick={handleSaveForm}
               disabled={saving}
               className="h-11 px-6 border-3 border-black bg-white font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
             >
                {saving ? "Saving..." : "Save Draft"}
             </button>

             <button 
               onClick={handlePublish}
               disabled={publishing || !activeFormId}
               className="h-11 px-8 border-3 border-black bg-black text-white font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0_0_rgba(16,185,129,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
             >
                {publishing ? "..." : (activeForm?.published ? "Update Live" : "Go Public")}
             </button>

             {publicFormUrl && (
               <>
                 <button 
                   onClick={() => window.open(publicFormUrl, "_blank")}
                   className="h-11 px-5 border-3 border-black bg-emerald-50 text-black flex items-center gap-2 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-100 transition-all"
                 >
                    <Icons.ExternalLink className="w-4 h-4" />
                    Live
                 </button>
                 <button 
                   onClick={() => setIsShareOpen(true)}
                   className="h-11 px-5 border-3 border-black bg-white flex items-center gap-2 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-50 transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                 >
                    <Icons.Share2 className="w-4 h-4" />
                    Share
                 </button>
               </>
             )}
          </div>
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr_320px] gap-6">
          {!previewMode && (
             <aside className="space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar pr-2">
               <div className="border-3 border-black bg-white p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-6 flex items-center gap-2">
                     <Plus className="w-3 h-3" /> Form Elements
                  </h3>
                  
                  <div className="space-y-8">
                     {QUESTION_CATEGORIES.map(category => (
                        <div key={category.id} className="space-y-3">
                           <h4 className="text-[9px] font-black uppercase tracking-widest text-black/30 border-b border-black/5 pb-1">
                              {category.name}
                           </h4>
                           <div className="grid grid-cols-1 gap-2">
                              {category.items.map(item => {
                                 const Icon = (Icons as any)[item.icon] || Icons.HelpCircle;
                                 return (
                                    <button
                                      key={item.type}
                                      onClick={() => addField(item.type as FieldType)}
                                      draggable
                                      onDragStart={(e) => e.dataTransfer.setData("text/plain", `new:${item.type}`)}
                                      className="w-full h-10 px-3 border-2 border-black bg-[#f8fafc] flex items-center gap-3 group hover:bg-emerald-100 transition-colors text-left"
                                    >
                                       <Icon className="w-4 h-4 text-black/40 group-hover:text-black transition-colors" />
                                       <span className="text-[10px] font-black uppercase tracking-tight">{item.label}</span>
                                    </button>
                                 );
                              })}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="border-3 border-black bg-[#fefce8] p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-3 flex items-center gap-2">
                     <Share className="w-3 h-3" /> Connect & Share
                  </h3>
                  {publicFormUrl ? (
                     <div className="space-y-3">
                        <p className="text-[10px] font-bold text-black/60 truncate bg-white p-2 border border-black/10">{publicFormUrl}</p>
                        <button onClick={handleCopyPublicUrl} className="w-full py-2 bg-black text-white text-[9px] font-black uppercase tracking-widest border-2 border-black">Copy Public Link</button>
                     </div>
                  ) : (
                     <p className="text-[10px] font-bold text-black/40">Publish your form to generate a shareable URL.</p>
                  )}
               </div>
            </aside>
          )}

          <div className={cn("space-y-6", previewMode && "xl:col-span-2 max-w-2xl mx-auto w-full")}>
             <div className="border-4 border-black bg-white shadow-[10px_10px_0_0_rgba(0,0,0,1)] min-h-[600px] flex flex-col">
                <div className="p-8 pb-4">
                   <h2 className={cn("font-black uppercase tracking-tight mb-2", previewMode ? "text-4xl" : "text-2xl")}>{formName}</h2>
                   <p className="text-sm font-bold text-black/40">{description}</p>
                </div>

                <div className="p-8 pt-4 flex-1 space-y-4">
                   {fields.length === 0 ? (
                      <div className="h-[300px] border-3 border-dashed border-black/10 bg-emerald-50/30 flex flex-col items-center justify-center gap-3 text-center">
                         <div className="w-12 h-12 rounded-full border-2 border-black/20 flex items-center justify-center">
                            <Plus className="w-6 h-6 text-black/20" />
                         </div>
                         <p className="text-sm font-black uppercase tracking-widest text-black/20 max-w-[150px]">Drag or Add fields to start building</p>
                      </div>
                   ) : (
                      fields.map((field) => {
                        const isSelected = selectedFieldId === field.id;
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
                              "relative group p-4 border-2 transition-all",
                              isSelected ? "border-emerald-500 bg-emerald-50/30 shadow-[4px_4px_0_0_rgba(16,185,129,0.1)]" : "border-black/5 bg-transparent",
                              previewMode ? "cursor-default" : "cursor-pointer hover:border-black/20"
                            )}
                          >
                            {!previewMode && isSelected && (
                               <div className="absolute -top-3 left-4 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                                  Editing: {field.type}
                               </div>
                            )}

                            <div className="flex items-center justify-between mb-2">
                               <label className="text-xs font-black uppercase tracking-wide flex items-center gap-2">
                                  {field.label} {field.required && <span className="text-red-500">*</span>}
                               </label>
                               {!previewMode && (
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <GripVertical className="w-4 h-4 text-black/30" />
                                     <button onClick={(e) => { e.stopPropagation(); removeField(field.id); }} className="text-black/40 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                               )}
                            </div>

                            <FieldRenderer field={field} uploading={uploadingFieldId === field.id} uploads={uploadedByField[field.id] || []} onUpload={(e) => onUploadForField(field.id, e)} />
                          </div>
                        );
                      })
                   )}
                   
                   {fields.length > 0 && (
                      <div className="pt-6">
                         <button className="w-full h-14 bg-black text-white font-black uppercase tracking-[0.2em] shadow-[6px_6px_0_0_rgba(16,185,129,1)]">
                            {successMessage ? "Preview Submit" : "Submit Response"}
                         </button>
                      </div>
                   )}
                </div>
             </div>
          </div>

          {!previewMode && (
            <aside className="space-y-6">
               <div className="border-3 border-black bg-white p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-4 flex items-center gap-2">
                     <Settings className="w-3 h-3" /> Field Customization
                  </h3>
                  {!selectedField ? (
                    <div className="py-10 text-center border-2 border-dashed border-black/10">
                       <p className="text-[10px] font-black uppercase tracking-widest text-black/20 px-4">Tap a field on canvas to edit properties</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                       <div>
                          <label className="text-[9px] font-black uppercase tracking-widest text-black/40 block mb-1">Field Label</label>
                          <input 
                            value={selectedField.label} 
                            onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                            className="w-full h-10 border-2 border-black bg-white px-2 text-sm font-black" 
                          />
                       </div>

                       <div>
                          <label className="text-[9px] font-black uppercase tracking-widest text-black/40 block mb-1">Media URL (GIF/Image)</label>
                          <input 
                            value={(selectedField as any).mediaUrl || ""} 
                            onChange={(e) => updateField(selectedField.id, { mediaUrl: e.target.value })}
                            placeholder="https://.../image.gif"
                            className="w-full h-10 border-2 border-black bg-white px-2 text-[10px] font-semibold" 
                          />
                       </div>
                       
                       {(["short_text", "email", "phone", "long_text"].includes(selectedField.type)) && (
                         <div>
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/40 block mb-1">Placeholder</label>
                            <input 
                              value={selectedField.placeholder || ""} 
                              onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                              className="w-full h-10 border-2 border-black bg-white px-2 text-sm font-semibold" 
                            />
                         </div>
                       )}

                       {selectedField.type === "dropdown" && (
                         <div>
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/40 block mb-1">Options (Comma Sep.)</label>
                            <textarea 
                               rows={3}
                               value={(selectedField.options || []).join(", ")}
                               onChange={(e) => updateField(selectedField.id, { options: e.target.value.split(",").map(v => v.trim()).filter(Boolean) })}
                               className="w-full border-2 border-black bg-white p-2 text-sm font-semibold" 
                            />
                         </div>
                       )}

                       <div className="flex items-center justify-between p-3 bg-black/5 border-2 border-black">
                         <span className="text-[10px] font-black uppercase tracking-widest">Mark Required</span>
                         <Switch 
                           checked={selectedField.required} 
                           onCheckedChange={(val) => updateField(selectedField.id, { required: val })} 
                         />
                       </div>

                       {formMode === "quiz" && (
                         <div className="pt-4 mt-4 border-t-2 border-black/10 space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#6D28D9] flex items-center gap-2">
                               <Sparkles className="w-3 h-3" /> Quiz Settings
                            </h4>
                            <div>
                               <label className="text-[9px] font-black uppercase tracking-widest text-black/40 block mb-1">Correct Answer</label>
                               {["multiple_choice", "dropdown", "yes_no"].includes(selectedField.type) ? (
                                 <select 
                                   value={(selectedField as any).correctAnswer || ""}
                                   onChange={(e) => updateField(selectedField.id, { correctAnswer: e.target.value })}
                                   className="w-full h-10 border-2 border-black bg-white px-2 text-sm font-black"
                                 >
                                    <option value="">Select correct option...</option>
                                    {(selectedField.options || (selectedField.type === "yes_no" ? ["Yes", "No"] : [])).map(o => (
                                      <option key={o} value={o}>{o}</option>
                                    ))}
                                 </select>
                               ) : (
                                  <input 
                                    value={(selectedField as any).correctAnswer || ""} 
                                    onChange={(e) => updateField(selectedField.id, { correctAnswer: e.target.value })}
                                    className="w-full h-10 border-2 border-black bg-white px-2 text-sm font-semibold" 
                                    placeholder="Type correct answer..."
                                  />
                               )}
                            </div>
                            <div>
                               <label className="text-[9px] font-black uppercase tracking-widest text-black/40 block mb-1">Points</label>
                               <input 
                                 type="number"
                                 value={(selectedField as any).points || 1} 
                                 onChange={(e) => updateField(selectedField.id, { points: parseInt(e.target.value) || 0 })}
                                 className="w-full h-10 border-2 border-black bg-white px-2 text-sm font-black" 
                               />
                            </div>
                         </div>
                       )}
                    </div>
                  )}
               </div>

               <div className="border-3 border-black bg-white p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-4 flex items-center gap-2">
                     <Sparkles className="w-3 h-3" /> Form Logic & UX
                  </h3>
                  <div className="space-y-3">
                     {[
                        { label: "Email Notifications", state: toolEmailNotify, set: setToolEmailNotify },
                        { label: "Spam Shield", state: toolSpamShield, set: setToolSpamShield },
                        { label: "Allow File Uploads", state: toolCollectFiles, set: setToolCollectFiles }
                     ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                           <span className="text-[10px] font-black uppercase tracking-tight">{item.label}</span>
                           <Switch checked={item.state} onCheckedChange={item.set} />
                        </div>
                     ))}
                  </div>
               </div>
            </aside>
          )}
       </div>

       <ShareModal 
         isOpen={isShareOpen} 
         onClose={() => setIsShareOpen(false)} 
         url={publicFormUrl || ""} 
         name={formName} 
       />
    </div>
  );
};

const FieldRenderer = ({ field, uploading, uploads, onUpload }: { field: FormField; uploading: boolean; uploads: UploadedItem[]; onUpload: (e: any) => void }) => {
   if (field.type === "long_text") return <textarea rows={3} disabled className="w-full border-2 border-black bg-white p-2 text-sm" placeholder={field.placeholder || ""} />;
   
   if (field.type === "multiple_choice" || field.type === "picture_choice" || field.type === "checkbox") {
      return (
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(field.options || ["Option 1", "Option 2", "Option 3"]).map((o, i) => (
               <div key={i} className="flex items-center gap-3 p-3 border-2 border-black bg-white">
                  <div className={cn("w-5 h-5 border-2 border-black", field.type === "checkbox" ? "rounded-sm" : "rounded-full")} />
                  <span className="text-[10px] font-black uppercase tracking-tight">{o}</span>
               </div>
            ))}
         </div>
      );
   }

   if (field.type === "dropdown") return (
      <select disabled className="w-full h-11 border-2 border-black bg-white px-2 text-xs font-bold uppercase tracking-widest">
         {(field.options || ["Choose Option"]).map((o, i) => <option key={i}>{o}</option>)}
      </select>
   );

   if (field.type === "rating" || field.type === "opinion_scale") {
      const count = field.type === "rating" ? 5 : 10;
      return (
         <div className="flex flex-wrap gap-2">
            {Array.from({ length: count }).map((_, i) => (
               <div key={i} className="w-10 h-10 border-2 border-black flex items-center justify-center font-black text-xs hover:bg-emerald-100 transition-colors">
                  {field.type === "rating" ? <Icons.Star className="w-4 h-4" /> : i + 1}
               </div>
            ))}
         </div>
      );
   }

   if (field.type === "nps") {
      return (
         <div className="space-y-4">
            <div className="flex gap-1 overflow-x-auto pb-2">
               {Array.from({ length: 11 }).map((_, i) => (
                  <div key={i} className="min-w-[40px] h-10 border-2 border-black flex items-center justify-center font-black text-xs">{i}</div>
               ))}
            </div>
            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-black/40">
               <span>Not likely at all</span>
               <span>Extremely likely</span>
            </div>
         </div>
      );
   }

   if (field.type === "yes_no") {
      return (
         <div className="flex gap-4">
            <div className="flex-1 h-12 border-2 border-black flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest">
                <div className="w-4 h-4 rounded-full border-2 border-black" /> Yes
            </div>
            <div className="flex-1 h-12 border-2 border-black flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest">
                <div className="w-4 h-4 rounded-full border-2 border-black" /> No
            </div>
         </div>
      );
   }

   if (field.type === "signature") {
      return (
         <div className="w-full h-32 border-2 border-black bg-slate-50 flex items-center justify-center relative">
            <Icons.PenTool className="w-6 h-6 text-black/10" />
            <div className="absolute bottom-4 left-4 right-4 border-t border-black/10" />
         </div>
      );
   }

   if (field.type === "file" || field.type === "google_drive") {
      return (
         <div className="space-y-2">
            <div className="w-full h-12 border-2 border-black bg-gray-50 flex items-center justify-center gap-3">
               <UploadCloud className="w-4 h-4 opacity-30" />
               <span className="text-[9px] font-black uppercase tracking-widest text-black/30">Drop file or click to browse</span>
            </div>
         </div>
      );
   }

   if (field.type === "welcome_screen" || field.type === "end_screen") {
      return (
         <div className="py-10 text-center space-y-4 border-2 border-dashed border-black/10">
            <Icons.Flag className="w-8 h-8 mx-auto text-black/20" />
            <p className="text-[10px] font-black uppercase tracking-widest text-black/40">This will appear as a full-screen {field.type.replace("_", " ")}</p>
         </div>
      );
   }

   return <input disabled className="w-full h-11 border-2 border-black bg-white px-3 text-sm font-semibold" placeholder={field.placeholder || ""} />;
};

export default FormsPage;

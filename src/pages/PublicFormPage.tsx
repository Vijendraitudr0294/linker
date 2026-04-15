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
import { FORM_THEMES, DEFAULT_SYSTEM_MESSAGES } from "@/lib/formConstants";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { getClarification, getFieldFAQ } from "@/lib/aiForms";

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
  const [quizScore, setQuizScore] = useState<{ score: number; total: number } | null>(null);
  const [aiClarification, setAiClarification] = useState<string | null>(null);
  const [aiClarifying, setAiClarifying] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState<string | null>(null);
  const [faqLoading, setFaqLoading] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!slug) return;
      
      if (localStorage.getItem(`submitted_${slug}`)) {
        setAlreadySubmitted(true);
      }

      try {
        const result = await getPublicForm(slug);
        if (!mounted) return;
        setForm(result.form);
      } catch (err) {
        if (!mounted) return;
        toast.error(`Form error: ${err instanceof Error ? err.message : "Not found"}`);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void run();
    return () => { mounted = false; };
  }, [slug]);

  const fields = useMemo<BuilderField[]>(() => {
    if (!form?.schema_json?.fields || !Array.isArray(form.schema_json.fields)) return [];
    return form.schema_json.fields;
  }, [form]);

  const questions = useMemo(() => fields.filter(f => f.type !== "welcome_screen" && f.type !== "end_screen"), [fields]);
  const welcomeScreen = useMemo(() => fields.find(f => f.type === "welcome_screen"), [fields]);
  const endScreen = useMemo(() => fields.find(f => f.type === "end_screen"), [fields]);

  const styleConfig = (form?.style_json || {}) as Record<string, unknown>;
  const formTheme = (styleConfig.theme as string) || "brutal";
  const successMessage = typeof styleConfig.successMessage === "string" ? styleConfig.successMessage : "Thanks! We got your response.";
  const collectFiles = styleConfig.collectFiles === undefined ? true : Boolean(styleConfig.collectFiles);
  const custom = (styleConfig.customColors || {}) as Record<string, string>;

  const themeClasses = useMemo(() => {
    return FORM_THEMES.find(t => t.id === formTheme) || FORM_THEMES[0];
  }, [formTheme]);

  const systemMsgs = (styleConfig.systemMessages as any) || DEFAULT_SYSTEM_MESSAGES;
  const displaySettings = (styleConfig.displaySettings || {
    branding: true,
    navArrows: true,
    progressBar: true,
    questionNumbers: true,
    answerLetters: true
  }) as Record<string, boolean>;

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

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const totalSteps = questions.length;
  const currentField = questions[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  const renderMedia = (field: any) => {
    if (!field?.mediaUrl) return null;
    return (
      <div className="mb-6 rounded-xl overflow-hidden border-2 border-black/5 shadow-sm max-w-lg mx-auto animate-in zoom-in fade-in duration-1000">
        <img 
          src={field.mediaUrl} 
          alt="Media" 
          className="w-full h-auto object-cover max-h-[300px]"
          onError={(e) => { (e.target as any).style.display = 'none'; }}
        />
      </div>
    );
  };

  const nextStep = () => {
    const val = values[currentField?.id];
    if (currentField?.required) {
      if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
        toast.error(systemMsgs.errors.required || "Please fill this in");
        return;
      }
    }
    
    if (currentStep < totalSteps - 1) {
      setDirection(1);
      setCurrentStep(s => s + 1);
    } else {
      void onSubmitInternal();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(s => s - 1);
    } else {
      setStarted(false);
    }
  };

  const onSubmitInternal = async () => {
    if (!slug || !form) return;
    if (honeypot) { setSubmitted(true); return; }

    setSubmitting(true);
    try {
      const res = await submitPublicForm(slug, values);
      localStorage.setItem(`submitted_${slug}`, "true");
      
      if (styleConfig.formMode === "quiz") {
        let score = 0;
        const total = questions.length;
        questions.forEach(f => {
          if (f.correctAnswer === values[f.id]) score++;
        });
        setQuizScore({ score, total });
      }

      toast.success(successMessage);
      setSubmitted(true);
    } catch (error) {
      toast.error(`Submission Error: ${error instanceof Error ? error.message : "Failed"}`);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (submitted || loading || submitting) return;
      if (e.key === "Enter" && !e.shiftKey) {
        if (document.activeElement?.tagName === "TEXTAREA") return;
        if (!started && welcomeScreen) { setStarted(true); return; }
        nextStep();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, values, submitted, loading, submitting, started, welcomeScreen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f3f5] font-sans text-center">
        <div className="space-y-4">
           <Loader2 className="w-10 h-10 animate-spin mx-auto text-emerald-500" />
           <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Loading Form...</p>
        </div>
      </div>
    );
  }

  if (!form) return <div className="p-20 text-center font-black uppercase">Form not found.</div>;

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#f2f3f5] font-sans">
        <div className="border-4 border-black bg-white p-12 shadow-[15px_15px_0_0_rgba(0,0,0,1)] text-center max-w-sm animate-in zoom-in fade-in duration-500">
           <div className="relative inline-block mb-6">
              <Icons.ShieldAlert className="w-16 h-16 mx-auto text-emerald-500" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-black rounded-full border-2 border-white flex items-center justify-center">
                 <Icons.Check className="w-3 h-3 text-white" />
              </div>
           </div>
           <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Unique Only</h2>
           <p className="text-sm font-bold opacity-60 mb-8 leading-relaxed">
              To ensure data integrity, each visitor can only submit this form once. You have already completed this flow.
           </p>
           <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => window.location.href = "/"}
                className="h-14 bg-black text-white font-black uppercase tracking-widest text-xs border-2 border-black hover:bg-emerald-500 transition-all shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2"
              >
                 <Icons.Home className="w-4 h-4" /> Go Back Home
              </button>
              <button 
                onClick={() => window.history.back()}
                className="h-14 bg-white text-black font-black uppercase tracking-widest text-xs border-2 border-black hover:bg-gray-50 transition-all shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                 Return to Previous Page
              </button>
           </div>
        </div>
      </div>
    );
  }

  if (!started && welcomeScreen) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center p-6 font-sans transition-colors duration-1000", themeClasses.page)}>
        <div className={cn("max-w-2xl w-full p-8 md:p-16 transition-all duration-700 mx-auto", themeClasses.card)}>
           {renderMedia(welcomeScreen)}
           <p className="text-[10px] uppercase tracking-[0.2em] font-black text-emerald-600 mb-2">{form.category}</p>
           <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 leading-none">{welcomeScreen.label}</h1>
           <p className="text-lg font-bold opacity-60 mb-10 leading-relaxed">{welcomeScreen.placeholder}</p>
           <button onClick={() => setStarted(true)} className={cn("h-16 px-10 text-lg font-black uppercase tracking-[0.1em] shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-4", themeClasses.button)}>
              {systemMsgs.buttons.continue || "Start Form"}
              <Icons.ArrowRight className="w-6 h-6" />
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex flex-col p-4 md:p-8 font-sans transition-colors duration-1000", themeClasses.page)}>
      {displaySettings.progressBar && !submitted && (
        <div className="fixed top-0 left-0 w-full h-1.5 bg-black/5 z-50">
          <div className="h-full bg-emerald-500 transition-all duration-700 ease-out" style={{ width: `${((currentStep + 1) / Math.max(1, totalSteps)) * 100}%` }} />
        </div>
      )}

      <div className={cn("max-w-3xl w-full mx-auto mt-12 md:mt-24 p-8 md:p-12 relative overflow-hidden transition-all duration-700", themeClasses.card)}>
        <input type="text" className="hidden" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />

        <div className="flex items-center justify-between mb-8">
           <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-emerald-600 mb-1">{form.category}</p>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">{form.name}</h1>
           </div>
           {!submitted && totalSteps > 0 && displaySettings.questionNumbers && (
              <div className="text-[10px] font-black opacity-30 bg-black/5 px-2 py-1 rounded">
                 {currentStep + 1} / {totalSteps}
              </div>
           )}
        </div>

        {submitted ? (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className={`border-3 border-black p-8 text-center shadow-[8px_8px_0_0_rgba(0,0,0,1)] bg-white`}>
              {endScreen ? (
                 <div className="space-y-4">
                    {renderMedia(endScreen)}
                    <h2 className="text-4xl font-black uppercase tracking-tighter">{endScreen.label}</h2>
                    <p className="text-lg font-bold opacity-60">{endScreen.placeholder}</p>
                 </div>
              ) : (
                <>
                  <Icons.CheckCircle className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
                  <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Done!</h2>
                  <p className="text-sm font-bold opacity-60 mb-8">{successMessage}</p>
                </>
              )}
              {quizScore && (
                 <div className="pt-8 mt-8 border-t-2 border-dashed border-black/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-3">Your Score</p>
                    <div className="text-7xl font-black tabular-nums tracking-tighter">{quizScore.score}/{quizScore.total}</div>
                 </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button 
                 onClick={() => window.location.href = "/"}
                 className="h-14 text-xs font-black uppercase tracking-[0.2em] bg-black text-white border-2 border-black hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all shadow-[6px_6px_0_0_rgba(16,185,129,1)] flex items-center justify-center gap-2"
               >
                  <Icons.ArrowLeft className="w-4 h-4" /> Go Back Home
               </button>
               <button 
                 onClick={() => { localStorage.removeItem(`submitted_${slug}`); window.location.reload(); }}
                 className="h-14 text-xs font-black uppercase tracking-[0.2em] border-2 border-black hover:bg-black hover:text-white transition-all shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex items-center justify-center gap-2"
               >
                  <Icons.RotateCcw className="w-4 h-4" /> Restart Form
               </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 min-h-[300px] flex flex-col">
            {currentField ? (
              <div key={currentField.id} className="space-y-4 animate-in fade-in duration-500 flex-1">
                {renderMedia(currentField)}
                <div className="flex gap-4">
                   {displaySettings.questionNumbers && <div className="text-xl font-black text-emerald-500">{currentStep + 1} →</div>}
                   <div className="flex-1 space-y-4">
                      <label className="text-xl md:text-2xl font-black leading-tight block">{currentField.label}{currentField.required ? " *" : ""}</label>
                      {currentField.type === "long_text" ? (
                        <textarea rows={4} autoFocus value={(values[currentField.id] as string) || ""} onChange={(e) => setFieldValue(currentField.id, e.target.value)} className="w-full p-4 text-lg border-b-2 border-black/10 focus:border-black outline-none bg-transparent font-medium" />
                      ) : currentField.type === "dropdown" ? (
                        <select autoFocus value={(values[currentField.id] as string) || ""} onChange={(e) => setFieldValue(currentField.id, e.target.value)} className="w-full h-14 px-4 text-lg font-black bg-transparent border-b-2 border-black/10 outline-none">
                          <option value="">Select option...</option>
                          {(currentField.options || []).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                        </select>
                      ) : (currentField.type === "multiple_choice" || currentField.type === "checkbox") ? (
                        <div className="grid grid-cols-1 gap-3">
                           {(currentField.options || []).map((o, i) => {
                              const isSelected = currentField.type === "checkbox" ? (values[currentField.id] as any[] || []).includes(o) : values[currentField.id] === o;
                              return (
                                 <button key={i} type="button" onClick={() => {
                                      if (currentField.type === "checkbox") {
                                         const curr = (values[currentField.id] as any[]) || [];
                                         setFieldValue(currentField.id, curr.includes(o) ? curr.filter(x => x !== o) : [...curr, o]);
                                      } else setFieldValue(currentField.id, o);
                                 }} className={cn("flex items-center gap-4 p-5 border-2 transition-all text-left", isSelected ? "bg-emerald-500 text-white border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]" : "bg-white border-black/10")}>
                                    <span className="text-sm font-black uppercase">{o}</span>
                                 </button>
                              );
                           })}
                        </div>
                      ) : currentField.type === "date" ? (
                        <input autoFocus type="date" value={(values[currentField.id] as string) || ""} onChange={(e) => setFieldValue(currentField.id, e.target.value)} className="w-full h-14 px-4 text-xl font-black border-b-2 border-black/10 focus:border-black outline-none bg-transparent" />
                      ) : currentField.type === "email" ? (
                        <input autoFocus type="email" placeholder="name@domain.com" value={(values[currentField.id] as string) || ""} onChange={(e) => setFieldValue(currentField.id, e.target.value)} className="w-full h-14 px-4 text-xl font-black border-b-2 border-black/10 focus:border-black outline-none bg-transparent" />
                      ) : currentField.type === "phone" ? (
                        <input autoFocus type="tel" placeholder="+91..." value={(values[currentField.id] as string) || ""} onChange={(e) => setFieldValue(currentField.id, e.target.value)} className="w-full h-14 px-4 text-xl font-black border-b-2 border-black/10 focus:border-black outline-none bg-transparent" />
                      ) : currentField.type === "rating" ? (
                        <div className="flex gap-2">
                           {[1, 2, 3, 4, 5].map(num => (
                              <button key={num} onClick={() => setFieldValue(currentField.id, num)} className={cn("w-12 h-12 flex items-center justify-center border-2 border-black font-black text-lg transition-all", values[currentField.id] === num ? "bg-emerald-500 text-white shadow-[3px_3px_0_0_rgba(0,0,0,1)]" : "bg-white hover:bg-emerald-50")}>
                                {num}
                              </button>
                           ))}
                        </div>
                      ) : currentField.type === "file" ? (
                        <div className="space-y-4">
                           <div className="relative">
                              <input type="file" onChange={(e) => onFileUpload(currentField, e)} className="hidden" id={`file-${currentField.id}`} disabled={!!uploadingField} />
                              <label htmlFor={`file-${currentField.id}`} className={cn("flex items-center gap-4 p-6 border-2 border-dashed border-black/20 cursor-pointer hover:border-black transition-all", values[currentField.id] && "bg-emerald-50 border-emerald-500")}>
                                 {uploadingField === currentField.id ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                 ) : values[currentField.id] ? (
                                    <Icons.CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                 ) : (
                                    <Icons.UploadCloud className="w-6 h-6 opacity-30" />
                                 )}
                                 <span className="font-black uppercase tracking-widest text-[10px]">
                                    {uploadingField === currentField.id ? "Inverting pixels..." : values[currentField.id] ? (values[currentField.id] as any).name : "Click to select asset"}
                                 </span>
                              </label>
                           </div>
                        </div>
                      ) : (
                        <input autoFocus type="text" value={(values[currentField.id] as string) || ""} onChange={(e) => setFieldValue(currentField.id, e.target.value)} className="w-full h-14 px-4 text-xl font-black border-b-2 border-black/10 focus:border-black outline-none bg-transparent" />
                      )}
                   </div>
                </div>
              </div>
            ) : <div className="py-20 text-center opacity-40">No questions.</div>}

            <div className="pt-8 flex items-center justify-between">
              <div className="flex gap-1">
                 <button onClick={prevStep} disabled={currentStep === 0} className="w-12 h-12 flex items-center justify-center border-2 border-black/10 hover:border-black disabled:opacity-20"><Icons.ChevronUp /></button>
                 <button onClick={nextStep} className="w-12 h-12 flex items-center justify-center border-2 border-black/10 hover:border-black"><Icons.ChevronDown /></button>
              </div>
              <button onClick={nextStep} className={cn("px-8 h-12 font-black uppercase tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all bg-black text-white", themeClasses.button)}>
                {submitting ? "..." : isLastStep ? "Submit" : "Continue"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicFormPage;

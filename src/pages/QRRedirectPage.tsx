import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { type QRCodeItem } from "@/types/qrforge";
import { posthog } from "@/lib/posthog";
import { 
  Smartphone, 
  Contact, 
  Percent, 
  Share2, 
  MessageSquare, 
  Globe, 
  Download, 
  Apple, 
  Play, 
  ChevronRight,
  User,
  MapPin,
  Phone,
  Mail,
  Copy,
  ExternalLink,
  ChevronDown,
  Loader2,
  AlertCircle,
  ArrowRight,
  Instagram
} from "lucide-react";

const QRRedirectPage = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleRedirect = async () => {
      if (!shortCode) {
        setError("Invalid redirect code");
        setLoading(false);
        return;
      }

      try {
        // Fallback to real Supabase endpoint first for exact tracking accuracy
        const { data: supaQr, error: supaErr } = await supabase
          .from("qr_codes")
          .select("*")
          .eq("short_code", shortCode)
          .single();

        let qr = supaQr;
        let savedCodes = JSON.parse(localStorage.getItem("qrforge_codes") || "[]");

        if (supaErr || !qr) {
            // Check LocalStorage strictly for local demo mode if supabase lacks internet
            qr = savedCodes.find((item: any) => item.short_code === shortCode);
        }

        if (!qr) {
          // Emulate a 410 Status for crawlers explicitly mapped to history hooks
          document.title = "410 Gone - BIOTRA";
          const meta = document.createElement("meta");
          meta.name = "prerender-status-code";
          meta.content = "410";
          document.head.appendChild(meta);
          
          setError("QR Code not found or has been deleted (410 Gone).");
          setLoading(false);
          return;
        }

        if (!qr.is_active) {
            setError("This QR Code is currently inactive.");
            setLoading(false);
            return;
        }

        setQrCode(qr);

        const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
        const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
        const isAndroid = /android/i.test(ua);

        // 2. Log Scan Event to Supabase (Real Persistence)
        try {
           const platform = isIOS ? 'ios' : isAndroid ? 'android' : 'web';
           
           // Use the mock Supabase client to log the scan record
            const deviceType = isIOS || isAndroid ? 'Mobile' : 'Desktop';
            const { error: scanErr } = await supabase
              .from('qr_scans')
              .insert({
                qr_code_id: qr.id,
                os: platform,
                browser: ua.length > 200 ? ua.substring(0, 200) : ua,
                device_type: deviceType
              });
             
           if (scanErr) console.warn("Failed to log scan to Supabase:", scanErr);
           
           // PostHog Tracking (Step 4 & Tracking roadmap)
           posthog.capture('link_click', {
              item_id: qr.id,
              short_code: shortCode,
              platform: platform,
              type: qr.type
           });
        } catch(e) {
           console.error("Tracking Error:", e);
        }

        // 2. Log Scan Analytics locally (Increment count on the item)
        const updatedCodes = savedCodes.map((item: any) => 
          item.id === qr.id 
            ? { ...item, scans_count: (item.scans_count || 0) + 1 } 
            : item
        );
        localStorage.setItem("qrforge_codes", JSON.stringify(updatedCodes));

        // 3. Trigger Redirect if it's a simple link type
        const landingTypes = ["apps", "vcard_plus", "coupon", "social_links", "feedback"];

        if (!landingTypes.includes(qr.type)) {
            // Standard Link Redirect
            setTimeout(() => {
                let targetUrl = qr.content.startsWith("http") ? qr.content : `https://${qr.content}`;
                
                // Append ref data if it's internal or smart
                if (!targetUrl.includes("?")) targetUrl += `?ref=${shortCode}`;
                else targetUrl += `&ref=${shortCode}`;
                
                window.location.href = targetUrl;
            }, 800);
        } else if (qr.type === "apps") {
            // SMART LINK / DEEP LINKING LOGIC
            let appConfig = { appStoreUrl: "", googlePlayUrl: "", webUrl: "" };
            try { appConfig = JSON.parse(qr.content); } catch(e) {}
            
            if (isIOS && appConfig.appStoreUrl) {
                // iOS App Store with ref param
                let iosUrl = appConfig.appStoreUrl.startsWith("http") ? appConfig.appStoreUrl : `https://${appConfig.appStoreUrl}`;
                const separator = iosUrl.includes("?") ? "&" : "?";
                const redirectUrl = `${iosUrl}${separator}ref=${shortCode}`;
                
                setTimeout(() => { window.location.href = redirectUrl; }, 600);
            } else if (isAndroid && appConfig.googlePlayUrl) {
                // Android Play Store with referrer param (standard for attribution)
                let androidUrl = appConfig.googlePlayUrl.startsWith("http") ? appConfig.googlePlayUrl : `https://${appConfig.googlePlayUrl}`;
                const separator = androidUrl.includes("?") ? "&" : "?";
                // Google Play Store uses 'referrer' specifically for tracking
                const redirectUrl = `${androidUrl}${separator}referrer=${shortCode}`;
                
                setTimeout(() => { window.location.href = redirectUrl; }, 600);
            } else {
                // Web Fallback or Landing Page
                if (appConfig.webUrl) {
                   let webUrl = appConfig.webUrl.startsWith("http") ? appConfig.webUrl : `https://${appConfig.webUrl}`;
                   const sep = webUrl.includes("?") ? "&" : "?";
                   setTimeout(() => { window.location.href = `${webUrl}${sep}ref=${shortCode}`; }, 800);
                } else {
                   setLoading(false); // Render the apps landing page
                }
            }
        } else {
            // Complex landing type (vCard, Coupon, etc.)
            setLoading(false);
        }

      } catch (err) {
         setError("An error occurred while redirecting.");
         setLoading(false);
      }
    };

    handleRedirect();
  }, [shortCode]);

  // Handle Apps Landing Page View
  if (!loading && qrCode?.type === "apps") {
      let appConfig = { appName: "App Name", appSubtitle: "Subtitle", googlePlayUrl: "#", appStoreUrl: "#", appIconUrl: "" };
      try {
          appConfig = JSON.parse(qrCode.content);
      } catch (e) {}

      return (
          <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-800 flex items-center justify-center p-4">
              <div className="w-full max-w-sm aspect-[9/16] bg-slate-900/40 border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-2xl flex flex-col items-center p-6 text-white">
                  
                  {/* Background Accents */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px]" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 rounded-full blur-[60px]" />

                  {/* Top Bar spacing */}
                  <div className="w-full flex justify-between px-4 pb-8 pt-2 text-white/40 text-xs font-semibold">
                      <span>9:41</span>
                      <div className="flex gap-1.5 items-center">
                          <div className="w-3 h-2 bg-white/40 rounded-sm" />
                          <div className="w-4 h-2 bg-white/40 rounded-sm" />
                          <div className="w-3 h-3 border border-white/40 rounded-full" />
                      </div>
                  </div>

                  {/* App Icon */}
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl mb-4 border border-white/10 overflow-hidden">
                      {appConfig.appIconUrl ? (
                          <img src={appConfig.appIconUrl} alt={appConfig.appName} className="w-full h-full object-cover" />
                      ) : (
                          <Smartphone className="w-8 h-8 text-white" />
                      )}
                  </div>

                  <h1 className="text-xl font-black">{appConfig.appName}</h1>
                  <p className="text-xs text-white/60 mb-8">{appConfig.appSubtitle}</p>

                  {/* Card describing features */}
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl w-full mb-8 text-left">
                      <p className="text-xs text-white/50 leading-relaxed font-medium">
                          Find peace and mental clarity with {appConfig.appName}. Access mindfulness exercises, meditation, and much more right on your device.
                      </p>
                  </div>

                  {/* Download Buttons */}
                  <div className="w-full space-y-3">
                      {appConfig.appStoreUrl && (
                          <a href={appConfig.appStoreUrl} target="_blank" rel="noreferrer" className="w-full bg-black hover:bg-black/80 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 transition-transform active:scale-95 shadow-lg">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Apple_logo_black.svg" className="w-6 h-6 invert" alt="Apple" />
                              <div className="text-left">
                                  <p className="text-[10px] text-white/60 uppercase">Download on the</p>
                                  <p className="text-sm font-bold -mt-0.5">App Store</p>
                              </div>
                          </a>
                      )}

                      {appConfig.googlePlayUrl && (
                          <a href={appConfig.googlePlayUrl} target="_blank" rel="noreferrer" className="w-full bg-slate-800/80 hover:bg-slate-700/60 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3 transition-transform active:scale-95 shadow-lg">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_watermark_2022.svg" className="w-6 h-6" alt="Play Store" />
                              <div className="text-left">
                                  <p className="text-[10px] text-white/60 uppercase">GET IT ON</p>
                                  <p className="text-sm font-bold -mt-0.5">Google Play</p>
                              </div>
                          </a>
                      )}
                  </div>

                  {/* Bottom Trigger */}
                  <div className="mt-auto w-full pt-4">
                      <Button className="w-full rounded-2xl h-11 bg-primary font-bold shadow-2xl flex items-center justify-center gap-2">
                           Try Now <ArrowRight className="w-4 h-4" />
                      </Button>
                  </div>

              </div>
          </div>
      );
  }

  // Handle vCard Plus Page View
  if (!loading && qrCode?.type === "vcard_plus") {
      let config = { vCardFirstName: "John", vCardLastName: "", vCardOrg: "", vCardTitle: "", vCardEmail: "", vCardPhone: "", vCardWebsite: "" };
      try { config = JSON.parse(qrCode.content); } catch (e) {}

      const handleDownloadVCF = () => {
         const vcard = `BEGIN:VCARD\nVERSION:3.0\nN:${config.vCardLastName};${config.vCardFirstName};;;\nFN:${config.vCardFirstName} ${config.vCardLastName}\nORG:${config.vCardOrg}\nTITLE:${config.vCardTitle}\nTEL;TYPE=CELL:${config.vCardPhone}\nEMAIL;TYPE=PREF,INTERNET:${config.vCardEmail}\nURL:${config.vCardWebsite}\nEND:VCARD`;
         const blob = new Blob([vcard], { type: 'text/vcard' });
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `${config.vCardFirstName}_${config.vCardLastName || "Contact"}.vcf`;
         a.click();
      };

      return (
          <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 flex items-center justify-center p-4">
              <div className="w-full max-w-sm aspect-[9/16] bg-slate-900/40 border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-2xl flex flex-col items-center p-6 text-white animate-fade-in">
                  
                  {/* Background Accents */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px]" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 rounded-full blur-[60px]" />

                  {/* Top Bar spacing */}
                  <div className="w-full flex justify-between px-4 pb-8 pt-2 text-white/40 text-xs font-semibold">
                      <span>9:41</span>
                      <div className="flex gap-1.5 items-center">
                          <div className="w-3 h-2 bg-white/40 rounded-sm" />
                          <div className="w-4 h-2 bg-white/40 rounded-sm" />
                          <div className="w-3 h-3 border border-white/40 rounded-full" />
                      </div>
                  </div>

                  {/* Profile Avatar spacing */}
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-violet-600 rounded-full flex items-center justify-center shadow-2xl mb-4 border border-white/10 text-3xl font-black text-white">
                      {config.vCardFirstName?.[0] || "?"}{config.vCardLastName?.[0] || ""}
                  </div>

                  <h1 className="text-xl font-black">{config.vCardFirstName} {config.vCardLastName}</h1>
                  {config.vCardTitle && <p className="text-xs text-primary font-bold tracking-wider mt-0.5">{config.vCardTitle}</p>}
                  {config.vCardOrg && <p className="text-[10px] text-white/60 mb-6">{config.vCardOrg}</p>}

                  <div className="w-full space-y-2 mb-8 mt-2">
                       {config.vCardPhone && (
                           <a href={`tel:${config.vCardPhone}`} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl px-4 py-3 text-sm transition-colors duration-200">
                               <Phone className="w-4 h-4 text-primary" />
                               <span>{config.vCardPhone}</span>
                           </a>
                       )}
                       {config.vCardEmail && (
                           <a href={`mailto:${config.vCardEmail}`} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl px-4 py-3 text-sm transition-colors duration-200">
                               <Mail className="w-4 h-4 text-primary" />
                               <span className="truncate">{config.vCardEmail}</span>
                           </a>
                       )}
                       {config.vCardWebsite && (
                           <a href={config.vCardWebsite.startsWith("http") ? config.vCardWebsite : `https://${config.vCardWebsite}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl px-4 py-3 text-sm transition-colors duration-200">
                               <Globe className="w-4 h-4 text-primary" />
                               <span className="truncate">{config.vCardWebsite}</span>
                           </a>
                       )}
                  </div>

                  {/* Bottom Trigger */}
                  <div className="mt-auto w-full pt-4">
                      <Button onClick={handleDownloadVCF} className="w-full rounded-2xl h-12 bg-primary hover:bg-primary/90 font-bold shadow-2xl flex items-center justify-center gap-2 text-white">
                           Save Contact Details
                      </Button>
                  </div>

              </div>
          </div>
      );
  }

  // Handle Coupon Page View
  if (!loading && qrCode?.type === "coupon") {
      let config = { couponOffer: "50% OFF", couponCode: "PROMO", couponStore: "Brand", couponExpiry: "Ends Soon" };
      try { config = JSON.parse(qrCode.content); } catch (e) {}

      const handleCopyCode = () => {
         navigator.clipboard.writeText(config.couponCode); 
         toast.success("Code copied!");
      };

      return (
          <div className="min-h-screen bg-gradient-to-br from-red-950 via-slate-900 to-red-900 flex items-center justify-center p-4">
              <div className="w-full max-w-sm aspect-[9/16] bg-slate-900/40 border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-2xl flex flex-col items-center p-6 text-white animate-fade-in">
                  
                  {/* Background Accents */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-[60px]" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[60px]" />

                  {/* Top Bar spacing */}
                  <div className="w-full flex justify-between px-4 pb-8 pt-2 text-white/40 text-xs font-semibold">
                      <span>9:41</span>
                      <div className="flex gap-1.5 items-center">
                          <div className="w-3 h-2 bg-white/40 rounded-sm" />
                          <div className="w-4 h-2 bg-white/40 rounded-sm" />
                          <div className="w-3 h-3 border border-white/40 rounded-full" />
                      </div>
                  </div>

                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl mb-4 border border-white/10 text-2xl font-black">
                      %
                  </div>

                  <h1 className="text-xl font-black tracking-tight">{config.couponStore}</h1>
                  <p className="text-xs text-white/60 mb-8">Exclusive Promo Offer</p>

                  {/* Coupon Card container */}
                  <div className="w-full bg-gradient-to-br from-amber-500 to-red-500 p-6 rounded-3xl text-center shadow-2xl relative border border-white/20 select-none cursor-pointer">
                       <p className="text-4xl font-black text-white tracking-tight">{config.couponOffer}</p>
                       <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider mt-1">{config.couponExpiry}</p>

                       <div className="mt-4 bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/5 flex items-center justify-between">
                            <span className="font-mono text-sm font-black tracking-wider text-amber-100">{config.couponCode}</span>
                            <Button 
                              size="sm" 
                              onClick={handleCopyCode} 
                              className="h-7 rounded-lg px-3 bg-white text-dark font-bold text-xs"
                            >
                                 Copy
                            </Button>
                       </div>
                  </div>

                  <p className="text-[11px] text-white/40 mt-4 leading-relaxed px-4 text-center">
                        Scan items, save offers direct to checks. Redeem efficiently appropriately framing trigger properly setup securely correctly description triggers properly setup layout correctly.
                  </p>

                  <div className="mt-auto w-full pt-4">
                      <Button className="w-full rounded-2xl h-12 bg-white/10 hover:bg-white/20 border border-white/5 font-bold shadow-2xl">
                           View Store
                      </Button>
                  </div>

              </div>
          </div>
      );
  }

  // Handle Social Links bundle View
  if (!loading && qrCode?.type === "social_links") {
      let config = { socialInstagram: "", socialFacebook: "", socialYoutube: "", socialTiktok: "" };
      try { config = JSON.parse(qrCode.content); } catch (e) {}

      return (
          <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
              <div className="w-full max-w-sm aspect-[9/16] bg-slate-900/40 border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-2xl flex flex-col items-center p-6 text-white animate-fade-in">
                  
                  {/* Background Accents */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[60px]" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[60px]" />

                  {/* Top Bar spacing */}
                  <div className="w-full flex justify-between px-4 pb-8 pt-2 text-white/40 text-xs font-semibold">
                      <span>9:41</span>
                      <div className="flex gap-1.5 items-center">
                          <div className="w-3 h-2 bg-white/40 rounded-sm" />
                          <div className="w-4 h-2 bg-white/40 rounded-sm" />
                          <div className="w-3 h-3 border border-white/40 rounded-full" />
                      </div>
                  </div>

                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl mb-4 border border-white/20 text-sm font-black">
                      @
                  </div>

                  <h1 className="text-xl font-black tracking-tight">Connect With Us</h1>
                  <p className="text-xs text-white/60 mb-8">All our social channels in one place</p>

                  <div className="w-full space-y-3">
                       {config.socialInstagram && (
                           <a href={config.socialInstagram} target="_blank" rel="noreferrer" className="w-full bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-colors">
                               <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
                                   <Instagram className="w-5 h-5 text-pink-400" />
                               </div>
                               <span className="font-bold text-sm">Instagram</span>
                               <ArrowRight className="w-4 h-4 ml-auto text-white/40" />
                           </a>
                       )}
                       {config.socialFacebook && (
                           <a href={config.socialFacebook} target="_blank" rel="noreferrer" className="w-full bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-colors">
                               <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center">
                                   <Globe className="w-5 h-5 text-blue-400" />
                               </div>
                               <span className="font-bold text-sm">Facebook</span>
                               <ArrowRight className="w-4 h-4 ml-auto text-white/40" />
                           </a>
                       )}
                       {config.socialYoutube && (
                           <a href={config.socialYoutube} target="_blank" rel="noreferrer" className="w-full bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-colors">
                               <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                                   <Globe className="w-4 h-4 text-red-400" />
                               </div>
                               <span className="font-bold text-sm">YouTube</span>
                               <ArrowRight className="w-4 h-4 ml-auto text-white/40" />
                           </a>
                       )}
                       {config.socialTiktok && (
                           <a href={config.socialTiktok} target="_blank" rel="noreferrer" className="w-full bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-colors">
                               <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center">
                                   <Smartphone className="w-5 h-5 text-white" />
                               </div>
                               <span className="font-bold text-sm">TikTok</span>
                               <ArrowRight className="w-4 h-4 ml-auto text-white/40" />
                           </a>
                       )}
                  </div>

              </div>
          </div>
      );
  }

  // Handle Feedback bundle View
  if (!loading && qrCode?.type === "feedback") {
      let config = { feedbackTitle: "", feedbackDesc: "" };
      try { config = JSON.parse(qrCode.content); } catch (e) {}

      return (
          <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 flex items-center justify-center p-4">
              <div className="w-full max-w-sm aspect-[9/16] bg-slate-900/40 border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-2xl flex flex-col items-center p-6 text-white animate-fade-in flex-grow max-h-[85vh]">
                  
                  {/* Background Accents */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-[60px]" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px]" />

                  {/* Top Bar spacing */}
                  <div className="w-full flex justify-between px-4 pb-8 pt-2 text-white/40 text-xs font-semibold">
                      <span>9:41</span>
                      <div className="flex gap-1.5 items-center">
                          <div className="w-3 h-2 bg-white/40 rounded-sm" />
                          <div className="w-4 h-2 bg-white/40 rounded-sm" />
                          <div className="w-3 h-3 border border-white/40 rounded-full" />
                      </div>
                  </div>

                  <h1 className="text-xl font-black tracking-tight mt-12 text-center">{config.feedbackTitle || "Rate Us"}</h1>
                  <p className="text-xs text-white/60 mb-8 text-center">{config.feedbackDesc || "Leave us a quick rating"}</p>

                  <div className="w-full space-y-4">
                       <div className="flex justify-center gap-2 text-3xl">
                           {["★","★","★","★","★"].map((s, i) => (
                               <button key={i} className="text-amber-400 hover:scale-110 duration-200">
                                   {s}
                               </button>
                           ))}
                       </div>

                       <textarea placeholder="Write a comment..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-sm h-24 text-white focus:outline-none focus:border-teal-500 mt-2" />

                       <Button className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 font-bold h-11 rounded-xl mt-2">
                           Submit Feedback
                       </Button>
                  </div>

              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {loading ? (
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <h1 className="text-xl font-black tracking-tight">Redirecting you...</h1>
          <p className="text-sm text-muted-foreground">Please wait while we log your scan securely.</p>
        </div>
      ) : error ? (
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Redirect Failed</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => navigate("/")} className="mt-2 rounded-xl h-10 bg-primary font-bold text-white">
             Back to Home
          </Button>
        </div>
      ) : (
        <div className="text-center space-y-2">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            <p className="text-xs text-muted-foreground">Logging analytics and redirecting...</p>
        </div>
      )}
    </div>
  );
};

export default QRRedirectPage;

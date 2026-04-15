import { Link } from "react-router-dom";
import BiotraCCNavbar from "@/components/landing/legacy/BiotraCCNavbar";
import BiotraCCFooter from "@/components/landing/legacy/BiotraCCFooter";

const sections = [
  {
    title: "MAIN PAGES",
    color: "bg-[#22C55E]",
    links: [
      { label: "HOME", path: "/" },
      { label: "BLOG", path: "/blog" },
      { label: "FAQ", path: "/faq" },
      { label: "LOGIN", path: "/login" },
      { label: "REGISTER", path: "/register" },
    ],
  },
  {
    title: "PLATFORM",
    color: "bg-[#FDE047]",
    links: [
      { label: "DASHBOARD", path: "/dashboard" },
      { label: "LINK EDITOR", path: "/dashboard/links" },
      { label: "SHOP / CATALOG", path: "/dashboard/catalog" },
      { label: "QR FORGE", path: "/dashboard/qrforge" },
      { label: "ANALYTICS", path: "/dashboard/analytics" },
      { label: "FORMS", path: "/dashboard/forms" },
      { label: "THEMES", path: "/dashboard/appearance" },
      { label: "TEMPLATES", path: "/dashboard/templates" },
      { label: "SOCIAL FLOW", path: "/dashboard/socialflow" },
      { label: "SETTINGS", path: "/dashboard/settings" },
    ],
  },
  {
    title: "LEGAL & TRUST",
    color: "bg-[#FBCFE8]",
    links: [
      { label: "PRIVACY POLICY", path: "/privacy" },
      { label: "TERMS OF SERVICE", path: "/terms" },
      { label: "COOKIE POLICY", path: "/cookies" },
    ],
  },
  {
    title: "RESOURCES",
    color: "bg-[#CCFBF1]",
    links: [
      { label: "HELP CENTER", path: "/help" },
      { label: "API DOCS", path: "/api-docs" },
      { label: "STATUS PAGE", path: "/status" },
      { label: "CHANGELOG", path: "/changelog" },
      { label: "SITEMAP", path: "/sitemap" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans selection:bg-[#22C55E] selection:text-black">
      <BiotraCCNavbar />

      <main className="pt-36 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="inline-block px-4 py-2 bg-[#FDE047] border-4 border-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,1)] mb-6">
              INDEX MAP
            </span>
            <h1 className="text-[72px] md:text-[120px] font-black tracking-tighter text-black uppercase leading-[0.85]">
              SITEMAP.
            </h1>
            <p className="text-sm font-black uppercase tracking-widest text-black/40 mt-4 max-w-md">
              Every page on Biotra, organized for humans and search engines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sections.map((section) => (
              <div
                key={section.title}
                className={`${section.color} border-8 border-black rounded-[40px] p-10 shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[16px_16px_0_0_rgba(0,0,0,1)] transition-all`}
              >
                <h2 className="text-xl font-black uppercase tracking-[0.3em] text-black mb-8 border-b-4 border-black pb-4">
                  {section.title}
                </h2>
                <div className="space-y-3">
                  {section.links.map((link) => (
                    <Link
                      key={link.label}
                      to={link.path}
                      className="flex items-center justify-between group py-2 border-b-2 border-black/10 hover:border-black transition-all"
                    >
                      <span className="text-sm font-black uppercase tracking-widest text-black group-hover:translate-x-2 transition-transform">
                        {link.label}
                      </span>
                      <span className="text-[10px] font-black text-black/30 group-hover:text-black transition-colors uppercase">
                        {link.path}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* XML Sitemap Link */}
          <div className="mt-16 text-center">
            <a 
              href="/sitemap.xml" 
              target="_blank"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white border-4 border-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
            >
              📄 VIEW XML SITEMAP (FOR GOOGLE)
            </a>
          </div>
        </div>
      </main>

      <BiotraCCFooter />
    </div>
  );
}

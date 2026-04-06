import InfoPageLayout from "@/components/InfoPageLayout";
import { motion } from "framer-motion";
import { Code, Copy, Check } from "lucide-react";
import { useState } from "react";

const endpoints = [
  {
    method: "GET",
    path: "/p/:username",
    description: "Fetch a user's public profile page including bio, links, and appearance settings.",
    response: `{
  "profile": {
    "name": "John Doe",
    "username": "johndoe",
    "bio": "Creator & Designer",
    "avatar_url": "https://..."
  },
  "links": [...],
  "appearance": {...}
}`,
  },
  {
    method: "GET",
    path: "/p/:username/services",
    description: "Fetch a user's public catalog items (products, services, digital downloads).",
    response: `{
  "items": [
    {
      "id": "uuid",
      "title": "Product Name",
      "price": 29.99,
      "category": "product",
      "image_url": "https://..."
    }
  ]
}`,
  },
  {
    method: "POST",
    path: "/api/contact",
    description: "Send a message to a profile owner through their contact form.",
    response: `{
  "success": true,
  "message": "Message sent successfully"
}`,
  },
  {
    method: "POST",
    path: "/api/order",
    description: "Submit an order for a catalog item.",
    response: `{
  "order_id": "uuid",
  "status": "pending"
}`,
  },
];

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-secondary/50 rounded-xl p-4 mt-3">
      <button onClick={handleCopy} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
        {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
      </button>
      <pre className="text-xs text-muted-foreground overflow-x-auto"><code>{code}</code></pre>
    </div>
  );
};

const ApiDocs = () => (
  <InfoPageLayout title="API Documentation" subtitle="Integrate with BIOTRA programmatically.">
    <div className="not-prose">
      <div className="glass rounded-2xl p-6 mb-8">
        <h3 className="font-heading font-bold text-foreground mb-2">Base URL</h3>
        <CodeBlock code="https://BIOTRA.com/api/v1" />
        <p className="text-sm text-muted-foreground mt-3">All API endpoints are public and read-only unless otherwise specified. No authentication is required for public data.</p>
      </div>

      <div className="space-y-6">
        {endpoints.map((ep, i) => (
          <motion.div
            key={ep.path}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                ep.method === "GET" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
              }`}>
                {ep.method}
              </span>
              <code className="text-sm font-mono text-foreground">{ep.path}</code>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{ep.description}</p>
            <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1">Response</p>
            <CodeBlock code={ep.response} />
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6 mt-8 text-center">
        <Code className="w-8 h-8 text-primary mx-auto mb-3" />
        <h3 className="font-heading font-bold text-foreground mb-2">Need more?</h3>
        <p className="text-sm text-muted-foreground">Full API documentation with webhooks and SDKs coming soon. Email api@BIOTRA.com for early access.</p>
      </div>
    </div>
  </InfoPageLayout>
);

export default ApiDocs;

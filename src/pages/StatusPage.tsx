import InfoPageLayout from "@/components/InfoPageLayout";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

const services = [
  { name: "Website & App", status: "operational", uptime: "99.98%" },
  { name: "Public Profiles", status: "operational", uptime: "99.99%" },
  { name: "Dashboard & Editor", status: "operational", uptime: "99.95%" },
  { name: "Analytics Engine", status: "operational", uptime: "99.97%" },
  { name: "Image Uploads", status: "operational", uptime: "99.90%" },
  { name: "Order Processing", status: "operational", uptime: "99.96%" },
  { name: "Email Notifications", status: "operational", uptime: "99.88%" },
  { name: "AI Features", status: "operational", uptime: "99.85%" },
];

const incidents = [
  { date: "Mar 2, 2026", title: "Brief API latency increase", description: "Some users experienced slower load times for 12 minutes. Resolved by scaling backend instances.", status: "resolved" },
  { date: "Feb 18, 2026", title: "Image upload delays", description: "Image processing queue backed up for approximately 25 minutes. Resolved by clearing the queue.", status: "resolved" },
  { date: "Feb 1, 2026", title: "Scheduled maintenance", description: "5-minute planned downtime for database migration. All services restored on schedule.", status: "resolved" },
];

const StatusPage = () => (
  <InfoPageLayout title="System Status" subtitle="Real-time status of all BIOTRA services.">
    <div className="not-prose">
      {/* Overall status */}
      <div className="glass rounded-2xl p-6 mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-foreground text-lg">All Systems Operational</h3>
          <p className="text-sm text-muted-foreground">Everything is running smoothly.</p>
        </div>
      </div>

      {/* Services */}
      <div className="space-y-2 mb-10">
        {services.map((svc, i) => (
          <motion.div
            key={svc.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center justify-between py-3 px-4 glass rounded-xl"
          >
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-sm font-medium text-foreground">{svc.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">{svc.uptime} uptime</span>
              <span className="text-xs text-emerald-400 font-medium capitalize">{svc.status}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Incidents */}
      <h2 className="text-xl font-heading font-bold text-foreground mb-4">Recent Incidents</h2>
      <div className="space-y-4">
        {incidents.map((inc, i) => (
          <motion.div
            key={inc.date + inc.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.06 }}
            className="glass rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{inc.date}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold uppercase">{inc.status}</span>
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-1">{inc.title}</h4>
            <p className="text-xs text-muted-foreground">{inc.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </InfoPageLayout>
);

export default StatusPage;

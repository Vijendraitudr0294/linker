import { motion } from "framer-motion";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_TEAM = [
  {
    name: "Mia",
    role: "CEO",
    subtext: "Shih Tzu Dog",
    bio: "Lead visionary and strategic biscuits enthusiast. Ensures all operations meet the highest standards of cuteness and comfort.",
    image: "https://images.unsplash.com/photo-1593134257782-e89567b7718a?auto=format&fit=crop&q=80",
    color: "bg-[#FBCFE8]",
    filter: "contrast-[1.3] saturate-[1.8] brightness-[1.1]"
  },
  {
    name: "Billu",
    role: "CTO",
    subtext: "Orange Indi Cat",
    bio: "Chief Technical Orchestrator. Master of system purr-formance and cloud-climbing architectures. Always watches the mice (and bugs).",
    image: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80",
    color: "bg-white",
    filter: "contrast-[1.1] saturate-[1.8] brightness-[1.1]"
  },
  {
    name: "Myra",
    role: "CMO",
    subtext: "Chow Chow Dog",
    bio: "Chief Marketing Officer. Expert in brand fluffiness and global pawprint expansion. Specializes in heavy-duty loyalty programs.",
    image: "https://images.unsplash.com/photo-1597843798941-86567201c1bc?auto=format&fit=crop&q=80",
    color: "bg-[#B91C1C]",
    filter: "contrast-[1.4] saturate-[1.5] brightness-[1.1]"
  },
  {
    name: "Brandy",
    role: "CXO",
    subtext: "Fashion Master Cat",
    bio: "Chief eXperience Orchestrator. Oversees the user journey from landing to nap-time. Expert in high-friction carpet dynamics.",
    image: "https://images.unsplash.com/photo-1571566882372-1598d88abd90?auto=format&fit=crop&q=80",
    color: "bg-[#EAB308]",
    filter: "contrast-[1.2] saturate-[1.6] brightness-[1.1]"
  }
];

const BiotraCCTeam = ({ heading, members }: { heading?: string; members?: any[] }) => {
  const displayHeading = heading || "THE LEGENDS BEHIND BIOTRA";
  const displayMembers = members?.map((m, i) => ({
      ...m,
      image: m.image_url || DEFAULT_TEAM[i]?.image || "https://images.unsplash.com/photo-1593134257782-e89567b7718a",
      color: DEFAULT_TEAM[i % DEFAULT_TEAM.length].color,
      filter: DEFAULT_TEAM[i % DEFAULT_TEAM.length].filter,
  })) || DEFAULT_TEAM;

  const getHeadingParts = () => {
     if (displayHeading.includes("LEGENDS")) {
         const parts = displayHeading.split("LEGENDS");
         return { before: parts[0], highlight: "LEGENDS", after: parts[1] };
     }
     return { before: "", highlight: displayHeading, after: "" };
  };
  const parts = getHeadingParts();
  return (
    <section className="py-32 bg-[#F3F4F6] border-b-8 border-black overflow-hidden">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="flex flex-col mb-20 text-center">
            <h1 className="text-5xl md:text-7xl font-black uppercase text-black leading-none tracking-tight">
                {parts.before}<span className="bg-emerald-400 px-4 border-4 border-black inline-block -rotate-1 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">{parts.highlight}</span>{parts.after}
            </h1>
            <p className="mt-8 text-xl font-black text-black/50 uppercase tracking-[0.2em]">Pioneer Nodes // Strategic Orchestration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {displayMembers.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group"
            >
              <div className="relative mb-10">
                <div className="absolute inset-0 bg-black rounded-[40px] translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300" />
                <div className={member.color + " relative aspect-square border-8 border-black rounded-[40px] overflow-hidden shadow-sm flex items-end justify-center pt-8"}>
                  <div className="absolute inset-0 bg-white/10 mix-blend-overlay pointer-events-none" />
                  <motion.div
                    initial={{ y: "120%", x: "-50%" }}
                    whileInView={{ y: "20%", x: "-50%" }}
                    whileHover={{ y: "-15%", scale: 1.25, rotate: [0, -5, 5, 0] }}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-4/5 z-20"
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 15,
                      whileHover: { transition: { duration: 0.3 } }
                    }}
                  >
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className={cn(
                        "w-full h-full object-contain filter drop-shadow-[5px_5px_0_rgba(0,0,0,1)]",
                        member.filter
                      )}
                    />
                  </motion.div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                 <h2 className="text-3xl font-black uppercase text-black mb-1">{member.name}</h2>
                 <div className="px-5 py-1.5 bg-black text-white text-[12px] font-black uppercase tracking-[0.25em] mb-6 italic rotate-1">
                   {member.role}
                 </div>
                 <div className="relative p-6 bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all">
                    <p className="text-[13px] font-black uppercase tracking-tight text-black leading-relaxed">
                        {member.bio}
                    </p>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-white border-4 border-black rounded-lg flex items-center justify-center">
                       <User size={14} />
                    </div>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BiotraCCTeam;

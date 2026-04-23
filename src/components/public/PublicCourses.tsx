import { motion } from "framer-motion";
import { PlayCircle, BookOpen, Clock, GraduationCap, ChevronRight, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  price: number;
}

interface PublicCoursesProps {
  courses: Course[];
  textColor: string;
  cardBg: string;
  buttonBg: string;
  buttonText: string;
  onSelect: (course: Course) => void;
  isBrutalism?: boolean;
}

const PublicCourses = ({ courses, textColor, cardBg, buttonBg, buttonText, onSelect, isBrutalism = false }: PublicCoursesProps) => {
  if (courses.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6 w-full">
      {courses.map((course, index) => (
        <motion.div
          key={course.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            "group relative overflow-hidden transition-all",
            isBrutalism ? "rounded-none border-4 border-black" : "rounded-[32px] border-2 border-black/10 hover:border-black/30",
            "flex flex-col md:flex-row items-stretch"
          )}
          style={{ backgroundColor: cardBg }}
        >
          {/* Course Image */}
          <div className="w-full md:w-[240px] aspect-video md:aspect-square relative overflow-hidden shrink-0">
            {course.thumbnail_url ? (
              <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black/5">
                <GraduationCap className="w-12 h-12 opacity-10" style={{ color: textColor }} />
              </div>
            )}
            <div className="absolute top-4 left-4">
               <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-1.5">
                  <PlayCircle className="w-3.5 h-3.5 text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Video Course</span>
               </div>
            </div>
          </div>

          {/* Course Info */}
          <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: textColor }}>Curriculum Ready</span>
            </div>
            
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-2" style={{ color: textColor }}>
              {course.title}
            </h3>
            
            <p className="text-sm font-semibold opacity-60 line-clamp-2 mb-6" style={{ color: textColor }}>
              {course.description || "Transform your skills with this deep-dive masterclass."}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-6 border-t border-black/5">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-30" style={{ color: textColor }}>Investment</span>
                  <span className="text-lg font-black" style={{ color: textColor }}>₹{course.price}</span>
               </div>
               
               <Button
                onClick={() => onSelect(course)}
                className={cn(
                  "h-12 px-8 font-black uppercase tracking-widest transition-all",
                  isBrutalism 
                    ? "rounded-none border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1" 
                    : "rounded-2xl border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                )}
                style={{ backgroundColor: buttonBg, color: buttonText }}
               >
                  Get Access
               </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PublicCourses;

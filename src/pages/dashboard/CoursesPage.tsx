import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, PlayCircle, BookOpen, Clock, Trash2, 
  Settings, ChevronRight, GraduationCap, 
  UploadCloud, Save, X, Eye, DollarSign 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  listMyCourses, createCourse, updateCourse, deleteCourse, 
  listLessons, createLesson, updateLesson, deleteLesson,
  type Course, type Lesson 
} from "@/lib/coursesApi";
import { cn } from "@/lib/utils";

const CoursesPage = () => {
  const [view, setView] = useState<"list" | "lessons">("list");
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeCourse, setActiveCourse] = useState<Partial<Course> | null>(null);
  const [activeLesson, setActiveLesson] = useState<Partial<Lesson> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await listMyCourses();
      setCourses(data);
    } catch (e: any) {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setActiveCourse({
      title: "New Course",
      description: "",
      price: 0,
      published: false
    });
    setIsEditorOpen(true);
  };

  const handleEdit = (course: Course) => {
    setActiveCourse(course);
    setIsEditorOpen(true);
  };

  const handleSave = async () => {
    if (!activeCourse?.title) return toast.error("Title is required");
    setSaving(true);
    try {
      if (activeCourse.id) {
        await updateCourse(activeCourse.id, activeCourse);
        toast.success("Course updated");
      } else {
        await createCourse(activeCourse);
        toast.success("Course created");
      }
      setIsEditorOpen(false);
      fetchCourses();
    } catch (e) {
      toast.error("Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const handleEditLessons = async (course: Course) => {
    setActiveCourse(course);
    setLoading(true);
    try {
      const data = await listLessons(course.id);
      setLessons(data);
      setView("lessons");
    } catch (e) {
      toast.error("Failed to load lessons");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLesson = () => {
    setActiveLesson({
      course_id: activeCourse?.id,
      title: "New Lesson",
      content: "",
      order_index: lessons.length
    });
  };

  const handleSaveLesson = async () => {
    if (!activeLesson?.title) return toast.error("Lesson title required");
    setSaving(true);
    try {
      if (activeLesson.id) {
        await updateLesson(activeLesson.id, activeLesson);
        toast.success("Lesson updated");
      } else {
        await createLesson(activeLesson);
        toast.success("Lesson added");
      }
      setActiveLesson(null);
      const data = await listLessons(activeCourse!.id!);
      setLessons(data);
    } catch (e) {
      toast.error("Failed to save lesson");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    try {
      await deleteLesson(id);
      setLessons(lessons.filter(l => l.id !== id));
      toast.success("Lesson removed");
    } catch (e) {
      toast.error("Failed to remove lesson");
    }
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this course? All lessons will be lost.")) return;
    try {
      await deleteCourse(id);
      toast.success("Course deleted");
      fetchCourses();
    } catch (e) {
      toast.error("Failed to delete course");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {view === "list" ? (
        <>
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Your Courses</h1>
              <p className="text-sm text-gray-500 mt-1">Create and manage your video courses and lessons.</p>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" /> Create New Course
            </Button>
          </header>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="h-[400px] bg-black/5 animate-pulse rounded-[32px] border-2 border-dashed border-black/10" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <motion.div 
                  key={course.id}
                  whileHover={{ y: -5 }}
                  className="group relative bg-white border-3 border-black rounded-[32px] overflow-hidden shadow-sm hover:shadow-none transition-all"
                >
                  <div className="aspect-video bg-purple-50 border-b-3 border-black relative overflow-hidden">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-purple-200">
                        <PlayCircle className="w-20 h-20" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge className={cn(
                        "text-[9px] uppercase font-black px-3 py-1 border border-gray-200",
                        course.published ? "bg-emerald-400 text-black" : "bg-white text-black"
                      )}>
                        {course.published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      <span className="text-[10px] font-medium text-sm text-black/40">Build Mode</span>
                    </div>
                    <h3 className="text-2xl font-black text-black mb-2 uppercase tracking-tight truncate">{course.title}</h3>
                    <p className="text-sm font-semibold text-black/60 line-clamp-2 mb-6">
                      {course.description || "No description provided yet."}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t-2 border-black/5">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-medium text-sm text-black/40">Price</span>
                        <span className="text-xl font-black text-black">₹{course.price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditLessons(course)}
                          className="px-4 py-2 border border-gray-200 bg-[#a78bfa] text-white rounded-xl text-[10px] font-medium text-sm shadow-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                        >
                          Curriculum
                        </button>
                        <button 
                          onClick={() => handleEdit(course)}
                          className="w-10 h-10 border border-gray-200 bg-white rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {courses.length === 0 && (
                <div className="col-span-full py-32 border-3 border-dashed border-black/10 rounded-[40px] flex flex-col items-center justify-center text-center gap-6">
                   <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-10 h-10 text-purple-300" />
                   </div>
                   <div>
                      <h3 className="text-xl font-semibold text-lg mb-2">No courses yet</h3>
                      <p className="text-sm font-semibold text-black/40 max-w-xs mx-auto">
                        Transform your knowledge into income. Start by creating your first course.
                      </p>
                   </div>
                   <Button 
                    onClick={handleCreateNew}
                    variant="outline"
                    className="h-12 px-6 border border-gray-200 rounded-2xl font-medium text-sm shadow-sm"
                   >
                     Create First Course
                   </Button>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-10">
          <header className="flex items-center gap-6">
            <button 
              onClick={() => setView("list")}
              className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center bg-white hover:bg-black hover:text-white transition-all shadow-sm"
            >
              <X className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-3xl font-semibold text-lg">{activeCourse?.title}</h2>
              <p className="text-sm font-semibold text-black/40 uppercase tracking-widest">Curriculum Management</p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 space-y-6">
               <Card className="bg-white border border-gray-200 shadow-sm rounded-xl bg-white p-6 md:p-8">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-lg font-semibold text-lg">Lesson List</h3>
                     <Button 
                      onClick={handleAddLesson}
                      size="sm" 
                      className="bg-emerald-400 text-black border border-gray-200 shadow-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 h-10 px-4 font-black uppercase text-[10px]"
                     >
                        <Plus className="w-4 h-4 mr-1" /> Add
                     </Button>
                  </div>
                  <div className="space-y-3">
                    {lessons.map((lesson, idx) => (
                      <div 
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        className={cn(
                          "p-4 border border-gray-200 rounded-2xl flex items-center justify-between cursor-pointer transition-all",
                          activeLesson?.id === lesson.id ? "bg-primary text-primary-foreground shadow-sm" : "bg-gray-50 hover:bg-white"
                        )}
                      >
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black opacity-40">{idx + 1}</span>
                            <span className="text-xs font-black uppercase tracking-wide truncate max-w-[120px]">{lesson.title}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            {lesson.video_url && <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />}
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson.id); }} className="p-1 hover:text-red-500">
                               <Trash2 className="w-3.5 h-3.5" />
                            </button>
                         </div>
                      </div>
                    ))}
                    {lessons.length === 0 && (
                      <p className="text-center py-10 text-[10px] font-black uppercase text-black/20 tracking-widest">No lessons added yet</p>
                    )}
                  </div>
               </Card>
            </div>

            <div className="lg:col-span-2">
               {activeLesson ? (
                 <Card className="bg-white border border-gray-200 shadow-sm rounded-xl bg-white p-8 space-y-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-medium text-sm text-black/40">Lesson Title</label>
                       <Input 
                        value={activeLesson.title}
                        onChange={e => setActiveLesson({...activeLesson, title: e.target.value})}
                        className="h-14 border border-gray-200 rounded-2xl text-lg font-black px-6"
                       />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-medium text-sm text-black/40">Video URL (Vimeo/YouTube)</label>
                       <Input 
                        value={activeLesson.video_url || ""}
                        onChange={e => setActiveLesson({...activeLesson, video_url: e.target.value})}
                        placeholder="https://..."
                        className="h-14 border border-gray-200 rounded-2xl px-6"
                       />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-medium text-sm text-black/40">Lesson Content (Markdown)</label>
                       <Textarea 
                        value={activeLesson.content || ""}
                        onChange={e => setActiveLesson({...activeLesson, content: e.target.value})}
                        className="min-h-[250px] border border-gray-200 rounded-2xl p-6 font-semibold"
                        placeholder="Explain the lesson concepts here..."
                       />
                    </div>
                    <div className="flex gap-4 pt-4">
                       <Button 
                        onClick={handleSaveLesson}
                        disabled={saving}
                        className="flex-1 h-14 bg-primary text-primary-foreground border border-gray-200 rounded-xl font-medium text-sm shadow-sm"
                       >
                          {saving ? "Saving..." : "Save Lesson"}
                       </Button>
                       <Button 
                        onClick={() => setActiveLesson(null)}
                        variant="outline"
                        className="h-14 px-8 border border-gray-200 rounded-xl font-medium text-sm"
                       >
                          Cancel
                       </Button>
                    </div>
                 </Card>
               ) : (
                 <div className="h-full min-h-[400px] border-4 border-dashed border-black/10 rounded-[40px] flex flex-col items-center justify-center text-center gap-6 bg-gray-50/30">
                    <div className="w-16 h-16 bg-white border border-gray-200 rounded-3xl flex items-center justify-center shadow-sm">
                       <PlayCircle className="w-8 h-8 text-black/20" />
                    </div>
                    <p className="text-[10px] font-medium text-sm text-black/40">Select a lesson or create a new one to begin editing</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Course Editor Modal */}
      <AnimatePresence>
        {isEditorOpen && activeCourse && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsEditorOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white border-4 border-black rounded-[40px] shadow-sm overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b-4 border-black flex items-center justify-between bg-purple-50">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                       <BookOpen className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-semibold text-lg">Course Settings</h2>
                 </div>
                 <button onClick={() => setIsEditorOpen(false)} className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-all">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-medium text-sm text-black/40">Title</label>
                  <Input 
                    value={activeCourse.title}
                    onChange={e => setActiveCourse({...activeCourse, title: e.target.value})}
                    placeholder="E.g. Advanced Creator Growth"
                    className="h-14 border border-gray-200 rounded-2xl text-base font-black px-6"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-medium text-sm text-black/40">Description</label>
                  <Textarea 
                    value={activeCourse.description || ""}
                    onChange={e => setActiveCourse({...activeCourse, description: e.target.value})}
                    placeholder="What will your students learn?"
                    className="min-h-[120px] border border-gray-200 rounded-2xl p-6 text-base font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-medium text-sm text-black/40">Price (INR)</label>
                    <div className="relative">
                       <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                       <Input 
                        type="number"
                        value={activeCourse.price}
                        onChange={e => setActiveCourse({...activeCourse, price: parseFloat(e.target.value)})}
                        className="h-14 border border-gray-200 rounded-2xl pl-12 text-base font-black"
                       />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-medium text-sm text-black/40">Status</label>
                    <div className="flex items-center gap-4 h-14">
                       <button 
                        onClick={() => setActiveCourse({...activeCourse, published: !activeCourse.published})}
                        className={cn(
                          "flex-1 h-full border border-gray-200 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all",
                          activeCourse.published ? "bg-emerald-400 text-black" : "bg-gray-100 text-black/40"
                        )}
                       >
                         {activeCourse.published ? "Live" : "Draft"}
                       </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50 border-t-4 border-black flex gap-4">
                <Button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 h-16 border-3 border-black bg-primary text-primary-foreground rounded-2xl font-medium text-sm shadow-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  {saving ? "Saving..." : "Save Course"}
                </Button>
                {activeCourse.id && (
                  <Button 
                    variant="outline"
                    className="h-16 px-8 border-3 border-black bg-white rounded-2xl font-medium text-sm hover:bg-black/5"
                  >
                    Edit Lessons
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoursesPage;



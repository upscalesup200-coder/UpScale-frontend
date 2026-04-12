"use client";
import { useState, useEffect } from "react";
import { API_ROUTES } from "@/config/api";
import toast from "react-hot-toast"; 
import { 
  Users, Search, Trash2, X, Plus, AlertCircle, Loader2, 
  BookOpen, Zap, Layers 
} from "lucide-react";

export default function EnrollmentsManagement() {
  const [stats, setStats] = useState<any>({ courses: [], workshops: [], bootcamps: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'workshops' | 'bootcamps'>('courses');
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemStudents, setItemStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [enrollLoading, setEnrollLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

const fetchStats = async () => {
    try {
      const res = await fetch(API_ROUTES.ADMIN_STATS, {
        credentials: "include" 
      });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
      toast.error("فشل في جلب الإحصائيات");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'courses' | 'workshops' | 'bootcamps') => {
    setActiveTab(tab);
    setSelectedItem(null);
    setShowAddModal(false);
  };

const handleItemClick = async (item: any) => {
    setSelectedItem(item);
    setStudentsLoading(true);
    try {
      const res = await fetch(API_ROUTES.ADMIN_ITEM_STUDENTS(item.id), {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        const studentsList = data.map((enrollment: any) => enrollment.user).filter(Boolean);
        setItemStudents(studentsList);
      } else {
        toast.error("حدث خطأ أثناء جلب بيانات الطلاب");
      }
    } catch (err) {
      console.error(err);
      toast.error("خطأ في الاتصال بالسيرفر");
    } finally {
      setStudentsLoading(false);
    }
  };
const handleRemoveStudent = async (studentId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء اشتراك هذا الطالب؟")) return;
    try {
      const res = await fetch(API_ROUTES.ADMIN_REMOVE_ENROLLMENT(studentId, selectedItem.id), {
        method: 'DELETE',
        credentials: "include" 
      });
      if (res.ok) {
        setItemStudents(prev => prev.filter(s => s.id !== studentId));
        toast.success("تم إلغاء الاشتراك بنجاح"); 
        fetchStats();
      } else {
        toast.error("فشل إلغاء الاشتراك من السيرفر");
      }
    } catch (err) {
      toast.error("فشل الحذف، يرجى المحاولة لاحقاً"); 
    }
  };

const handleManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentEmail.trim()) {
        toast.error("يرجى إدخال البريد الإلكتروني");
        return;
    }
    setEnrollLoading(true);
    
    let type = 'COURSE';
    if (activeTab === 'workshops') type = 'WORKSHOP';
    if (activeTab === 'bootcamps') type = 'BOOTCAMP';

    try {
      const res = await fetch(API_ROUTES.ADMIN_MANUAL_ENROLL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({
          email: newStudentEmail,
          itemId: selectedItem.id,
          type: type
        })
      });
      
      const result = await res.json();
      if (result.success) {
        toast.success(result.message || "تم تسجيل الطالب بنجاح!"); 
        setNewStudentEmail(""); 
        setShowAddModal(false);
        handleItemClick(selectedItem);
        fetchStats();
      } else {
        toast.error(result.message || "فشل التسجيل"); 
      }
    } catch (err) {
      toast.error("حدث خطأ أثناء التسجيل"); 
    } finally {
      setEnrollLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white pt-24 px-4 md:px-8 pb-12">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-600/20 rounded-2xl">
            <Users className="text-indigo-400" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black">إدارة الطلاب والتسجيلات</h1>
            <p className="text-gray-400">مراقبة أعداد الطلاب وإدارة اشتراكاتهم</p>
          </div>
        </div>

        <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
          <button 
            onClick={() => handleTabChange('courses')} 
            className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'courses' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
          >
            <BookOpen size={18} /> المواد الأكاديمية
          </button>
          <button 
            onClick={() => handleTabChange('workshops')} 
            className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'workshops' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
          >
            <Layers size={18} /> الورشات
          </button>
          <button 
            onClick={() => handleTabChange('bootcamps')} 
            className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'bootcamps' ? 'bg-pink-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
          >
            <Zap size={18} /> المعسكرات
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 text-center py-20"><Loader2 className="animate-spin mx-auto text-indigo-500" size={40}/></div>
          ) : stats[activeTab]?.length === 0 ? (
            <div className="col-span-3 text-center py-20 text-gray-500">لا يوجد عناصر مضافة بعد</div>
          ) : (
            stats[activeTab]?.map((item: any) => (
              <div 
                key={item.id} 
                onClick={() => handleItemClick(item)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg line-clamp-1">{item.title}</h3>
                  <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded-lg border border-indigo-500/20">
                    {item.count} طالب
                  </span>
                </div>
                <p className="text-xs text-gray-400 group-hover:text-indigo-300 transition-colors">اضغط لإدارة الطلاب</p>
              </div>
            ))
          )}
        </div>

        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1e293b] w-full max-w-4xl rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95">
              
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20 rounded-t-3xl">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Users size={20} className="text-indigo-400"/>
                    طلاب: {selectedItem.title}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">عدد المسجلين: {itemStudents.length}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                  >
                    <Plus size={16} /> إضافة طالب
                  </button>
                  <button 
                    onClick={() => setSelectedItem(null)} 
                    className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-colors"
                    aria-label="إغلاق النافذة"
                    title="إغلاق"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-700">
                {studentsLoading ? (
                  <div className="text-center py-10"><Loader2 className="animate-spin mx-auto"/></div>
                ) : itemStudents.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">لا يوجد طلاب مسجلين في هذه المادة</div>
                ) : (
                  <table className="w-full text-right text-sm">
                    <thead className="text-gray-400 border-b border-white/10">
                      <tr>
                        <th className="pb-3 pr-2">اسم الطالب</th>
                        <th className="pb-3">البريد الإلكتروني</th>
                        <th className="pb-3">رقم الهاتف</th>
                        <th className="pb-3 text-left pl-2">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {itemStudents.map((student: any) => (
                        <tr key={student.id} className="group hover:bg-white/5 transition-colors">
                          <td className="py-3 pr-2 font-medium">{student.firstName} {student.lastName}</td>
                          <td className="py-3 text-gray-300">{student.email}</td>
                          <td className="py-3 text-gray-400">{student.phone || '-'}</td>
                          <td className="py-3 pl-2 text-left">
                            <button 
                              onClick={() => handleRemoveStudent(student.id)}
                              className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors" 
                              title="إلغاء الاشتراك"
                              aria-label={`إلغاء اشتراك الطالب ${student.firstName} ${student.lastName}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/20 w-full max-w-md shadow-2xl animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-lg font-bold mb-4">إضافة طالب يدوياً</h3>
              <p className="text-sm text-gray-400 mb-4">سيتم تفعيل الاشتراك للطالب فوراً في: <br/> <b className="text-indigo-400">{selectedItem?.title}</b></p>
              
              <form onSubmit={handleManualEnroll} className="space-y-4">
                <div>
                  <label htmlFor="studentEmailManual" className="text-xs text-gray-400 block mb-1">البريد الإلكتروني للطالب</label>
                  <input 
                    id="studentEmailManual"
                    type="email" 
                    required 
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                    placeholder="student@example.com"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="submit" 
                    disabled={enrollLoading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    {enrollLoading ? 'جاري الإضافة...' : 'تفعيل الاشتراك'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                        setShowAddModal(false);
                        setNewStudentEmail(""); 
                    }}
                    className="px-4 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
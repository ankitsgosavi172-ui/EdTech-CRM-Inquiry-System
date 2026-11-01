import { useState, useEffect } from "react";
import { PageHeader } from "../components/PageHeader";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../contexts/AuthContext";
import { listCourses, createCourse, deleteCourse, updateCourse } from "../services/api";
import { Plus, BookOpen as BookIcon } from "lucide-react";

export default function Courses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isActiveFilter, setIsActiveFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "", description: "", duration_months: "", fee: "", currency: "INR", is_active: true });

  useEffect(() => {
    load();
  }, [page, pageSize, isActiveFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listCourses({ page, page_size: pageSize, is_active: isActiveFilter === "" ? undefined : isActiveFilter === "true" });
      setCourses(res.data.items);
      setTotal(res.data.total);
    } catch (err: any) {
      toast(err.response?.data?.detail || "Failed to load courses", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCourse({ ...formData, duration_months: parseInt(formData.duration_months) || 0, fee: parseFloat(formData.fee) || 0 });
      setOpen(false);
      setFormData({ name: "", code: "", description: "", duration_months: "", fee: "", currency: "INR", is_active: true });
      load();
      toast("Course created successfully");
    } catch (err: any) {
      toast(err.response?.data?.detail || "Failed to create course", "error");
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await updateCourse(id, { is_active: !current });
      load();
      toast(`Course ${!current ? "activated" : "deactivated"}`);
    } catch (err: any) {
      toast(err.response?.data?.detail || "Failed to update", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader title="Courses" subtitle="Manage the course catalogue" />
        <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Course
        </button>
      </div>

      <div className="card p-4">
        <div className="flex gap-2">
          {["", "true", "false"].map((s) => (
            <button
              key={s}
              onClick={() => setIsActiveFilter(s)}
              className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                isActiveFilter === s
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {s === "" ? "All" : s === "true" ? "Active" : "Inactive"}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Code</th>
                <th>Duration</th>
                <th>Fee</th>
                <th>Status</th>
                <th className="w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c: any) => (
                <tr key={c.id}>
                  <td className="font-medium text-gray-900">{c.name}</td>
                  <td className="text-sm text-gray-600 font-mono">{c.code}</td>
                  <td className="text-sm text-gray-600">{c.duration_months} months</td>
                  <td className="text-sm text-gray-600">{c.currency} {c.fee}</td>
                  <td>
                    <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 border ${
                      c.is_active ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"
                    }`}>
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggle(c.id, c.is_active)}
                      className="p-2 text-gray-600 hover:text-indigo-600"
                    >
                      {c.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => { if(window.confirm("Delete this course?")) deleteCourse(c.id).then(() => load()).catch(() => toast("Failed", "error")); }}
                      className="p-2 text-gray-600 hover:text-red-600 ml-2"
                    >
                      <span className="sr-only">Delete</span>
                      <span className="block w-5 h-5 bg-red-100 rounded-full flex items-center justify-center"><span className="text-red-600 text-[10px]">✕</span></span>
                    </button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {open && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Add Course</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="label">Course Name</label>
                  <input type="text" className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Course Code</label>
                    <input type="text" className="input" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">Duration (months)</label>
                    <input type="number" className="input" value={formData.duration_months} onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Fee</label>
                    <input type="number" className="input" value={formData.fee} onChange={(e) => setFormData({ ...formData, fee: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">Currency</label>
                    <select className="input" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })}>
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea className="input" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="rounded" />
                  <label className="text-sm text-gray-700">Is Active</label>
                </div>
                <div className="flex gap-2 mt-6">
                  <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="btn-primary flex-1">Create Course</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

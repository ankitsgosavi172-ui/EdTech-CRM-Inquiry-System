import { useState, useEffect } from "react";
import { PageHeader } from "../components/PageHeader";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../contexts/AuthContext";
import { listStudents, createStudent, deleteStudent } from "../services/api";
import { Plus, Search, Mail, Phone } from "lucide-react";

export default function Students() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", email: "", phone: "", date_of_birth: "", academic_background: "" });

  useEffect(() => {
    load();
  }, [page, pageSize, q]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listStudents({ page, page_size: pageSize, q: q || undefined });
      setStudents(res.data.items);
      setTotal(res.data.total);
    } catch (err: any) {
      toast(err.response?.data?.detail || "Failed to load students", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStudent(formData);
      setOpen(false);
      setFormData({ full_name: "", email: "", phone: "", date_of_birth: "", academic_background: "" });
      load();
      toast("Student created successfully");
    } catch (err: any) {
      toast(err.response?.data?.detail || "Failed to create student", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader title="Students" subtitle="Manage enrolled student profiles" />
        <button
          onClick={() => setOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Add Student
        </button>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            className="input w-72"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>DOB</th>
                <th>Academic Background</th>
                <th className="w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s: any) => (
                <tr key={s.id}>
                  <td className="font-medium text-gray-900">{s.full_name}</td>
                  <td className="text-sm text-gray-600">{s.email || "—"}</td>
                  <td className="text-sm text-gray-600">{s.phone || "—"}</td>
                  <td className="text-sm text-gray-600">{s.date_of_birth || "—"}</td>
                  <td className="text-sm text-gray-600 truncate max-w-xs">{s.academic_background || "—"}</td>
                  <td>
                    <button
                      onClick={() => { if(window.confirm("Delete this student?")) deleteStudent(s.id).then(() => load()).catch(() => toast("Failed", "error")); }}
                      className="p-2 text-gray-600 hover:text-red-600"
                    >
                      <span className="sr-only">Delete</span>
                      <span className="block w-5 h-5 bg-red-100 rounded-full flex items-center justify-center"><span className="text-red-600 text-[10px]">✕</span></span>
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No students found.
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
              <h3 className="text-lg font-bold text-gray-900 mb-4">Add Student</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input type="text" className="input" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Email</label>
                    <input type="email" className="input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input type="tel" className="input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Date of Birth</label>
                    <input type="date" className="input" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Academic Background</label>
                    <input type="text" className="input" value={formData.academic_background} onChange={(e) => setFormData({ ...formData, academic_background: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="btn-primary flex-1">Create Student</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

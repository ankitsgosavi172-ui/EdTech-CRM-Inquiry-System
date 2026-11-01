import { useState, useEffect } from "react";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../contexts/AuthContext";
import {
  listInquiries,
  createInquiry,
  updateInquiry,
  deleteInquiry,
} from "../services/api";
import { Plus, Search, Edit2, Trash2, User as UserIcon, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Inquiries() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    q: "",
    status: "",
    source: "",
    course_id: "",
    assigned_to: "",
    from_date: "",
    to_date: "",
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    source: "",
    status: "new",
    notes: "",
  });

  const STATUS_OPTIONS = [
    "new",
    "contacted",
    "interested",
    "follow_up_scheduled",
    "application_submitted",
    "admission_confirmed",
    "not_interested",
    "unreachable",
    "on_hold",
    "lost",
  ];

  const SOURCE_OPTIONS = ["walk_in", "phone", "website", "referral", "event", "social_media"];

  useEffect(() => {
    load();
  }, [page, pageSize, filters]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listInquiries({
        page,
        page_size: pageSize,
        q: filters.q || undefined,
        status: filters.status || undefined,
        source: filters.source || undefined,
        course_id: filters.course_id || undefined,
        assigned_to: filters.assigned_to || undefined,
        from_date: filters.from_date || undefined,
        to_date: filters.to_date || undefined,
      });
      setInquiries(res.data.items);
      setTotal(res.data.total);
    } catch (err: any) {
      toast(err.response?.data?.detail || "Failed to load inquiries", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      if (editing) {
        await updateInquiry(editing.id, data);
        toast("Inquiry updated successfully");
      } else {
        await createInquiry(data);
        toast("Inquiry created successfully");
      }
      setOpen(false);
      setEditing(null);
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        source: "",
        status: "new",
        notes: "",
      });
      load();
    } catch (err: any) {
      toast(err.response?.data?.detail || "Failed to save inquiry", "error");
    }
  };

  const handleEdit = (inq: any) => {
    setEditing(inq);
    setFormData({
      full_name: inq.full_name,
      email: inq.email || "",
      phone: inq.phone || "",
      source: inq.source || "",
      status: inq.status,
      notes: inq.notes || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this inquiry?")) return;
    try {
      await deleteInquiry(id);
      load();
      toast("Inquiry deleted");
    } catch (err: any) {
      toast(err.response?.data?.detail || "Failed to delete", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader title="Inquiries" subtitle="Manage prospective student inquiries" />
        <div className="flex gap-2">
          <button
            onClick={() => { setEditing(null); setFormData({ full_name: "", email: "", phone: "", source: "", status: "new", notes: "" }); setOpen(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} /> Add Inquiry
          </button>
          <button
            className="btn-outline hidden md:flex items-center gap-2"
            onClick={() => {}}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              className="input w-64"
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
              </option>
            ))}
          </select>
          <select
            value={filters.source}
            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
            className="input"
          >
            <option value="">All sources</option>
            {SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Contact</th>
                <th>Source</th>
                <th>Status</th>
                <th>Course</th>
                <th>Assigned To</th>
                <th>Created</th>
                <th className="w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq: any) => (
                <tr key={inq.id}>
                  <td>
                    <div className="font-medium text-gray-900">{inq.full_name}</div>
                    {inq.student_id && <div className="text-xs text-gray-500">Student linked</div>}
                  </td>
                  <td>
                    {inq.email && <div className="text-sm"><Mail size={14} className="mr-1 inline" /> {inq.email}</div>}
                    {inq.phone && <div className="text-sm text-gray-600"><Phone size={14} className="mr-1 inline" /> {inq.phone}</div>}
                  </td>
                  <td className="text-sm text-gray-600">{inq.source || "—"}</td>
                  <td>
                    <StatusBadge status={inq.status} />
                  </td>
                  <td className="text-sm text-gray-600">{inq.course_id ? "Course assigned" : "—"}</td>
                  <td className="text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <UserIcon size={14} className="text-gray-400" />
                      {inq.assigned_to ? "Assigned" : "Unassigned"}
                    </div>
                  </td>
                  <td className="text-sm text-gray-500">{new Date(inq.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(inq)}
                        className="p-2 text-gray-600 hover:text-indigo-600"
                        title="Edit inquiry"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/inquiries/${inq.id}`)}
                        className="p-2 text-gray-600 hover:text-blue-600"
                        title="View details"
                      >
                        <span className="sr-only">View</span>
                        <span className="block w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center"><span className="text-blue-600 text-[10px]">👁</span></span>
                      </button>
                      <button
                        onClick={() => handleDelete(inq.id)}
                        className="p-2 text-gray-600 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {inquiries.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No inquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((page - 1) * pageSize + 1)} to {Math.min(page * pageSize, total)} of {total}
          </div>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <button
              disabled={page * pageSize >= total}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {open && (
          <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editing ? "Edit Inquiry" : "Create Inquiry"}
              </h3>
              <form onSubmit={(e) => { e.preventDefault(); handleCreate(formData); }} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
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
                    <label className="label">Source</label>
                    <select className="input" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })}>
                      <option value="">Select source</option>
                      {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select className="input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Notes</label>
                  <textarea className="input" rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>
                <div className="flex gap-2 mt-6">
                  <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    {editing ? "Save Changes" : "Create Inquiry"}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

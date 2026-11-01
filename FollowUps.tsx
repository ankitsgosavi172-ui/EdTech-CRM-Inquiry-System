import { useState, useEffect } from "react";
import { PageHeader } from "../components/PageHeader";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../contexts/AuthContext";
import { listFollowUps, completeFollowUp, createFollowUp } from "../services/api";
import { Plus, Clock, CheckCircle2, Phone, Mail } from "lucide-react";

export default function FollowUps() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ inquiry_id: "", assigned_to: "", due_at: "", channel: "", purpose: "", status: "pending" });

  useEffect(() => {
    load();
  }, [statusFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listFollowUps({
        status: statusFilter === "all" ? undefined : statusFilter,
        overdue_only: statusFilter === "overdue",
      });
      setFollowUps(res.data.items);
    } catch (err: any) {
      toast(err.response?.data?.detail || "Failed to load follow-ups", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeFollowUp(id);
      load();
      toast("Follow-up marked as completed");
    } catch (err: any) {
      toast(err.response?.data?.detail || "Failed to complete", "error");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFollowUp(formData);
      setOpen(false);
      setFormData({ inquiry_id: "", assigned_to: "", due_at: "", channel: "", purpose: "", status: "pending" });
      load();
      toast("Follow-up scheduled");
    } catch (err: any) {
      toast(err.response?.data?.detail || "Failed to create follow-up", "error");
    }
  };

  const CHANNELS = ["phone", "email", "whatsapp", "in_person"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader title="Follow-ups" subtitle="Schedule and track follow-up tasks" />
        <button
          onClick={() => setOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Schedule Follow-up
        </button>
      </div>

      <div className="card p-4">
        <div className="flex gap-2">
          {["all", "pending", "completed", "overdue"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                statusFilter === s
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {s === "overdue" ? "Overdue" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Inquiry</th>
                <th>Due Date</th>
                <th>Channel</th>
                <th>Purpose</th>
                <th>Status</th>
                <th className="w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {followUps.map((fu: any) => {
                const overdue = fu.status === "pending" && new Date(fu.due_at) < new Date();
                return (
                  <tr key={fu.id} className={overdue ? "bg-red-50" : ""}>
                    <td className="font-medium text-gray-900">Inquiry {fu.inquiry_id.slice(0, 8)}</td>
                    <td className="text-sm text-gray-600">{new Date(fu.due_at).toLocaleString()}</td>
                    <td className="text-sm text-gray-600">
                      <span className={`text-xs rounded-full px-2 py-0.5 ${fu.channel === "phone" ? "bg-blue-100 text-blue-700" : fu.channel === "email" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                        {fu.channel || "—"}
                      </span>
                    </td>
                    <td className="text-sm text-gray-600 truncate max-w-xs">{fu.purpose || "—"}</td>
                    <td>
                      <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 border ${
                        fu.status === "pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : fu.status === "completed"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}>
                        {fu.status}
                      </span>
                    </td>
                    <td>
                      {fu.status === "pending" && (
                        <button
                          onClick={() => handleComplete(fu.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle2 size={14} /> Complete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {followUps.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No follow-ups found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Modal */}
      {open && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Schedule Follow-up</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="label">Inquiry ID</label>
                  <input type="text" className="input" value={formData.inquiry_id} onChange={(e) => setFormData({ ...formData, inquiry_id: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Assigned To (User ID)</label>
                    <input type="text" className="input" value={formData.assigned_to} onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">Due Date/Time</label>
                    <input type="datetime-local" className="input" value={formData.due_at} onChange={(e) => setFormData({ ...formData, due_at: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <label className="label">Channel</label>
                  <select className="input" value={formData.channel} onChange={(e) => setFormData({ ...formData, channel: e.target.value })}>
                    <option value="">Select channel</option>
                    {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Purpose</label>
                  <textarea className="input" rows={3} value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} />
                </div>
                <div className="flex gap-2 mt-6">
                  <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="btn-primary flex-1">Schedule</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

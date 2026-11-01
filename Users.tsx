import { useState, useEffect } from "react";
import { PageHeader } from "../components/PageHeader";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../contexts/AuthContext";
import { listUsers, createUser, getUser, updateUser } from "../services/api";
import { Plus, Users as UsersIcon, Search } from "lucide-react";

export default function UsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", email: "", password: "", role_id: "", is_active: true });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listUsers();
      setUsers(res.data || []);
    } catch (err: any) {
      toast(err.response?.data?.detail || "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(formData);
      setOpen(false);
      setFormData({ full_name: "", email: "", password: "", role_id: "", is_active: true });
      load();
      toast("User created successfully");
    } catch (err: any) {
      toast(err.response?.data?.detail || "Failed to create user", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader title="Users" subtitle="Manage institution staff and roles" />
        <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id}>
                  <td className="font-medium text-gray-900">{u.full_name}</td>
                  <td className="text-sm text-gray-600">{u.email}</td>
                  <td className="text-sm text-gray-600 capitalize">{u.role_name || u.role || "—"}</td>
                  <td>
                    <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 border ${
                      u.is_active ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"
                    }`}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {open && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Add User</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input type="text" className="input" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input type="password" className="input" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Role ID</label>
                  <input type="text" className="input" placeholder="UUID" value={formData.role_id} onChange={(e) => setFormData({ ...formData, role_id: e.target.value })} />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="rounded" />
                  <label className="text-sm text-gray-700">Is Active</label>
                </div>
                <div className="flex gap-2 mt-6">
                  <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="btn-primary flex-1">Create User</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

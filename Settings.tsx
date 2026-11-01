import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../contexts/AuthContext";
import { Shield, Bell, Lock, Database, Globe } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "data", label: "Data & Backups", icon: Database },
    { id: "integrations", label: "Integrations", icon: Globe },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Configure your account and institution preferences" />

      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" className="input" defaultValue={user.full_name} />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" defaultValue={user.email} disabled />
            </div>
            <div>
              <label className="label">Role</label>
              <input type="text" className="input" defaultValue={(user.role || "").replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())} disabled />
            </div>
            <div>
              <label className="label">Institution ID</label>
              <input type="text" className="input font-mono text-sm" defaultValue={user.institution_id} disabled />
            </div>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
          <form onSubmit={(e) => { e.preventDefault(); toast("Password updated"); }} className="space-y-4 max-w-md">
            <div>
              <label className="label">Current Password</label>
              <input type="password" className="input" required />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" className="input" required />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" className="input" required />
            </div>
            <button className="btn-primary">Update Password</button>
          </form>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900">New inquiry alerts</p>
                <p className="text-xs text-gray-500">Receive notifications when new inquiries are created</p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900">Follow-up reminders</p>
                <p className="text-xs text-gray-500">Reminders for upcoming and overdue follow-ups</p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900">Admission confirmations</p>
                <p className="text-xs text-gray-500">Notify when an admission is confirmed</p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
          </div>
        </div>
      )}

      {activeTab === "data" && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900">Export inquiry data</p>
                <p className="text-xs text-gray-500">Download all inquiries as CSV</p>
              </div>
              <button className="btn-outline">Export CSV</button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900">Database backup</p>
                <p className="text-xs text-gray-500">Create a full system backup</p>
              </div>
              <button className="btn-outline">Create Backup</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "integrations" && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Integrations</h3>
          <p className="text-sm text-gray-500 mb-4">External integrations such as WhatsApp, SMS, and email are planned for future releases.</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
              <div>
                <p className="text-sm text-gray-900">WhatsApp Business</p>
                <p className="text-xs text-gray-500">Coming soon — message prospects directly</p>
              </div>
              <span className="text-xs text-gray-400">Future</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
              <div>
                <p className="text-sm text-gray-900">Email SMTP</p>
                <p className="text-xs text-gray-500">Coming soon — automated email notifications</p>
              </div>
              <span className="text-xs text-gray-400">Future</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

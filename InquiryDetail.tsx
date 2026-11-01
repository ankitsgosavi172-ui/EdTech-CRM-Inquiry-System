import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../contexts/AuthContext";
import { getInquiry, updateInquiry, getInquiryActivities } from "../services/api";
import { Mail, Phone, Activity, Clock, ChevronRight } from "lucide-react";

export default function InquiryDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [inquiry, setInquiry] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [inqRes, actRes] = await Promise.all([getInquiry(id), getInquiryActivities(id)]);
        setInquiry(inqRes.data);
        setActivities(actRes.data);
      } catch (err: any) {
        toast(err.response?.data?.detail || "Failed to load inquiry", "error");
        navigate("/inquiries");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!inquiry) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader title="Inquiry Details" subtitle={`Inquiry #${inquiry.id.slice(0, 8)}`} />
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/inquiries")}
            className="btn-secondary"
          >
            <ChevronRight size={16} className="-rotate-180" /> Back
          </button>
        </div>
      </div>

      {/* Header Card */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{inquiry.full_name}</h2>
            <p className="text-gray-500 text-sm mt-1">Prospective Student</p>
          </div>
          <div className="flex items-end gap-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border text-lg ${inquiry.status === 'admission_confirmed' ? 'bg-green-100 text-green-700 border-green-200' : inquiry.status === 'lost' ? 'bg-red-100 text-red-700 border-red-200' : inquiry.status === 'new' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
              {inquiry.status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Created</p>
            <p className="text-gray-900 font-medium">{new Date(inquiry.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-gray-400" />
            <span className="text-gray-700">{inquiry.email || "—"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={18} className="text-gray-400" />
            <span className="text-gray-700">{inquiry.phone || "—"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">Source:</span>
            <span className="text-gray-700">{inquiry.source || "—"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">Assigned:</span>
            <span className="text-gray-700">{inquiry.assigned_to ? "Assigned" : "Unassigned"}</span>
          </div>
        </div>
      </div>

      {/* Timeline / Activities */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-indigo-600" /> Activity Timeline
        </h3>
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((act: any) => (
              <div key={act.id} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2" />
                <div className="flex-1 border-l border-gray-200 pl-4 py-2 last:pb-0">
                  <p className="text-sm font-medium text-gray-900">{act.activity_type.replace(/_/g, " ")}</p>
                  {act.notes && <p className="text-sm text-gray-600">{act.notes}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(act.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              No activity history yet.
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionCard
          title="Schedule Follow-up"
          description="Set a date and channel for next contact"
          icon={Clock}
        />
        <ActionCard
          title="Convert to Student"
          description="Create student profile and link enrollment"
          icon={Mail}
        />
        <ActionCard
          title="Update Status"
          description="Move inquiry through the admission pipeline"
          icon={Activity}
        />
      </div>
    </div>
  );
}

function ActionCard({ title, description, icon: Icon }: { title: string; description: string; icon: any }) {
  return (
    <div className="card p-5 hover:border-indigo-200 transition-colors cursor-pointer group">
      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
        <Icon size={18} />
      </div>
      <h4 className="text-sm font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}

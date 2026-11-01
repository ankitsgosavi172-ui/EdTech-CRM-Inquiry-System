import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../contexts/AuthContext";
import { getDashboardAnalytics } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Users as UsersIcon,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDashboardAnalytics();
        setData(res.data);
      } catch (err: any) {
        toast(err.response?.data?.detail || "Failed to load analytics", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Overview of your admission pipeline" />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Inquiries"
          value={data?.total ?? 0}
          icon={UsersIcon}
          color="bg-blue-500"
          trend="+12% this month"
        />
        <MetricCard
          title="New"
          value={data?.new ?? 0}
          icon={GraduationCap}
          color="bg-indigo-500"
          trend="Pending first contact"
        />
        <MetricCard
          title="Admission Confirmed"
          value={data?.admission_confirmed ?? 0}
          icon={CheckCircle2}
          color="bg-green-500"
          trend={`Conversion: ${data?.conversion_percentage ?? 0}%`}
        />
        <MetricCard
          title="Overdue Follow-ups"
          value={data?.overdue_follow_ups ?? 0}
          icon={AlertCircle}
          color="bg-red-500"
          trend="Needs immediate attention"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Funnel */}
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inquiry Status Funnel</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "New", value: data?.new ?? 0 },
                    { name: "Contacted", value: data?.contacted ?? 0 },
                    { name: "Interested", value: data?.interested ?? 0 },
                    { name: "Follow-up Scheduled", value: data?.follow_up_scheduled ?? 0 },
                    { name: "Application Submitted", value: data?.application_submitted ?? 0 },
                    { name: "Admission Confirmed", value: data?.admission_confirmed ?? 0 },
                    { name: "Lost", value: data?.lost ?? 0 },
                  ] as { name: string; value: number }[]}
                  dataKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  labelLine={false}
                  label={({ name, percent }: any) => {
                    const p = (percent ?? 0) * 100;
                    return p > 5 ? `${name}: ${p.toFixed(0)}%` : null;
                  }}
                >
                  {COLORS.map((color, i) => (
                    <Cell key={`cell-${i}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Source Breakdown</h3>
          <div className="space-y-3">
            {(data?.source_breakdown ?? []).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.source}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600"
                      style={{
                        width: `${Math.min(((item.count / (data?.total ?? 1)) * 100), 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend Chart + Overdue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inquiry Trend (30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(data?.trend ?? []) as { day: string; count: number }[]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <QuickAction
              icon={Clock}
              label="View Overdue Follow-ups"
              hint="Pending tasks past due date"
              color="text-red-600"
            />
            <QuickAction
              icon={UsersIcon}
              label="Review New Inquiries"
              hint="Unassigned leads needing contact"
              color="text-indigo-600"
            />
            <QuickAction
              icon={GraduationCap}
              label="Manage Students"
              hint="View enrolled student profiles"
              color="text-green-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  trend: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-2">{trend}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${color}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  hint,
  color,
}: {
  icon: any;
  label: string;
  hint: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group">
      <div className={`w-8 h-8 rounded flex items-center justify-center text-xs ${color}`}>
        <Icon size={14} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900 group-hover:text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{hint}</p>
      </div>
    </div>
  );
}

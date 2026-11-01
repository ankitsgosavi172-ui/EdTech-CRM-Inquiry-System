import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../contexts/AuthContext";
import { getConversionsReport } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FileText } from "lucide-react";

export default function Reports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [report, setReport] = useState<any>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const load = async () => {
    try {
      const res = await getConversionsReport({ from_date: fromDate || undefined, to_date: toDate || undefined });
      setReport(res.data);
    } catch (err: any) {
      toast(err.response?.data?.detail || "Failed to load report", "error");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Conversion analytics and funnel performance" />

      <div className="card p-4">
        <div className="flex gap-4 items-end">
          <div>
            <label className="label block mb-1">From Date</label>
            <input type="date" className="input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <label className="label block mb-1">To Date</label>
            <input type="date" className="input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <button onClick={load} className="btn-primary">Load Report</button>
          <button className="btn-outline flex items-center gap-2">
            <FileText size={18} /> Export CSV
          </button>
        </div>
      </div>

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card p-5">
              <p className="text-sm text-gray-500 uppercase font-semibold">Total Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">{report.total_inquiries}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm text-gray-500 uppercase font-semibold">Applications</p>
              <p className="text-2xl font-bold text-gray-900">{report.applications}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm text-gray-500 uppercase font-semibold">Admissions</p>
              <p className="text-2xl font-bold text-gray-900">{report.admissions}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm text-gray-500 uppercase font-semibold">Overall Conversion</p>
              <p className="text-2xl font-bold text-indigo-600">{report.overall_conversion_percentage}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion Funnel Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: "Inquiries", value: report.total_inquiries },
                    { name: "Applications", value: report.applications },
                    { name: "Admissions", value: report.admissions },
                  ] as { name: string; value: number }[]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* By Source */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Inquiries by Source</h3>
              <div className="space-y-3">
                {(report.by_source || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{item.source}</span>
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Course */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Demand by Course</h3>
              <div className="space-y-3">
                {(report.by_course || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{item.course}</span>
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Counsellor */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Workload by Counsellor</h3>
              <div className="space-y-3">
                {(report.by_counsellor || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{item.counsellor}</span>
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

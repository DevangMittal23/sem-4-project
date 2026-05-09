"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, Activity, CheckCircle, Target, Briefcase, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import { apiAdminStats } from "@/lib/api";

export default function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiAdminStats();
      setStats(res);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load dashboard stats. Make sure you have admin privileges.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <p>{error}</p>
      </div>
    );
  }

  const statCards = [
    { title: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "from-blue-500 to-cyan-400" },
    { title: "Active Users (7d)", value: stats?.activeUsers || 0, icon: Activity, color: "from-emerald-400 to-teal-500" },
    { title: "Avg Profile Completion", value: `${stats?.profileCompletionPct || 0}%`, icon: UserCheck, color: "from-purple-500 to-pink-500" },
    { title: "Task Completion Rate", value: `${stats?.taskCompletionRate || 0}%`, icon: CheckCircle, color: "from-orange-400 to-red-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
            Platform Overview
          </h1>
          <p className="text-zinc-400">Monitor system performance and user engagement in real-time.</p>
        </div>
        <button 
          onClick={fetchStats}
          className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2 text-sm text-zinc-300 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-xl relative overflow-hidden group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-zinc-400 text-sm font-medium mb-2">{card.title}</p>
                <h3 className="text-3xl font-bold text-white">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} bg-opacity-10 shadow-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Auth Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-xl col-span-1"
        >
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Authentication Types
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">Google OAuth</span>
                <span className="text-white font-medium">{stats?.googleUsers}</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${(stats?.googleUsers / (stats?.totalUsers || 1)) * 100}%` }} 
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">Email / Password</span>
                <span className="text-white font-medium">{stats?.emailUsers}</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full" 
                  style={{ width: `${(stats?.emailUsers / (stats?.totalUsers || 1)) * 100}%` }} 
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top Careers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-xl col-span-1 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-400" />
              Most Selected Career Paths
            </h3>
          </div>
          <div className="space-y-3">
            {stats?.topCareers?.length > 0 ? (
              stats.topCareers.map((career: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs">
                      #{idx + 1}
                    </div>
                    <span className="font-medium text-sm text-zinc-200">{career.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">{career.count} users</span>
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-zinc-500 text-sm">No career path data available yet.</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

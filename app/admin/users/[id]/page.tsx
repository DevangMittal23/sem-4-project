"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, User, Briefcase, Target, Brain, Activity, Clock, Map, Star, ChevronLeft } from "lucide-react";
import { apiAdminUserDetail } from "@/lib/api";
import Link from "next/link";

export default function AdminUserDetail() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchUserDetail(params.id as string);
    }
  }, [params.id]);

  const fetchUserDetail = async (id: string) => {
    try {
      setLoading(true);
      const res = await apiAdminUserDetail(id);
      setData(res);
    } catch (err) {
      console.error(err);
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

  if (!data) {
    return (
      <div className="text-center py-12 text-zinc-500">
        User not found or you don't have permission to view.
      </div>
    );
  }

  const { user, profile, skillGap, careers, taskStats, recentActivity } = data;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/users"
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            {profile.name || user.username}
            <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">
              User ID: {user.id}
            </span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">{user.email} • Joined {new Date(user.joinedAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-xl lg:col-span-1"
        >
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
            <User className="w-5 h-5 text-blue-400" />
            Profile Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Profession & Exp</div>
              <div className="font-medium text-white">{profile.profession || "Not specified"} • {profile.experience || "Not specified"}</div>
            </div>
            
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Primary Goal</div>
              <div className="font-medium text-white capitalize">{profile.goal?.replace("_", " ") || "Not specified"}</div>
            </div>

            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Target Role</div>
              <div className="font-medium text-white">{profile.targetRole || "Not specified"}</div>
            </div>

            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Completion Status</div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" 
                    style={{ width: `${profile.completion || 0}%` }} 
                  />
                </div>
                <span className="text-sm font-medium text-zinc-300">{profile.completion || 0}%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats & Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Total Tasks</div>
                <div className="text-2xl font-bold text-white">{taskStats?.total || 0}</div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Completed</div>
                <div className="text-2xl font-bold text-white">{taskStats?.completed || 0}</div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                <Map className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Careers paths</div>
                <div className="text-2xl font-bold text-white">{careers?.length || 0}</div>
              </div>
            </div>
          </div>

          {/* Careers List */}
          {careers && careers.length > 0 && (
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-400" />
                AI Suggested Careers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {careers.map((c: any, idx: number) => (
                  <div key={idx} className={`p-4 rounded-xl border ${c.is_selected ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{c.title}</h4>
                      {c.is_selected && <Star className="w-4 h-4 text-purple-400 fill-purple-400" />}
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>Match: {c.match_score}%</span>
                      <span>{c.market_demand} Demand</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Gap */}
          {skillGap && (
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-orange-400" />
                Skill Gap Analysis
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-zinc-300 mb-2">Missing Skills Needed</div>
                  <div className="flex flex-wrap gap-2">
                    {skillGap.gapSkills?.slice(0, 8).map((skill: any, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs">
                        {typeof skill === 'string' ? skill : skill.skill || JSON.stringify(skill)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

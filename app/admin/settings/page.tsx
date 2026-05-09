"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Settings, Shield, Bot, Bell, Database, Mail, 
  Lock, Zap, Server, Save, CheckCircle2, AlertTriangle 
} from "lucide-react";

const SETTINGS_TABS = [
  { id: "general", label: "General", icon: Settings },
  { id: "ai", label: "AI Engine", icon: Bot },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Mock settings state
  const [settings, setSettings] = useState({
    platformName: "AI Career Mentor",
    maintenanceMode: false,
    requireEmailVerification: true,
    maxUsers: "10000",
    aiModel: "gemini-2.0-flash",
    groqModel: "llama-3.3-70b-versatile",
    strictMode: true,
    dailyTaskLimit: "5",
    adminEmails: "admin@careermentor.ai",
    sessionTimeout: "24",
  });

  const handleSave = () => {
    setSaving(true);
    setSaved(false);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  const handleChange = (key: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-400" />
            Platform Settings
          </h1>
          <p className="text-gray-400 mt-2">Manage global configurations, AI parameters, and security policies.</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Tabs */}
        <div className="lg:w-64 shrink-0 space-y-2">
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  isActive 
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-blue-400" : "text-gray-500"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md"
          >
            {activeTab === "general" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5 text-gray-400" /> General Configuration
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Platform Name</label>
                    <input 
                      type="text" 
                      value={settings.platformName}
                      onChange={(e) => handleChange("platformName", e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Admin Alert Emails</label>
                    <input 
                      type="text" 
                      value={settings.adminEmails}
                      onChange={(e) => handleChange("adminEmails", e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Maximum User Registration Limit</label>
                    <input 
                      type="number" 
                      value={settings.maxUsers}
                      onChange={(e) => handleChange("maxUsers", e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">Maintenance Mode</h4>
                        <p className="text-sm text-gray-400">Disable access for non-admin users.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={settings.maintenanceMode}
                          onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-gray-400" /> AI Engine Configuration
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Primary Analytical Model (Gemini)</label>
                    <select 
                      value={settings.aiModel}
                      onChange={(e) => handleChange("aiModel", e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors appearance-none"
                    >
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash (Default, Fast)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (Advanced Logic)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Chatbot Model (Groq)</label>
                    <select 
                      value={settings.groqModel}
                      onChange={(e) => handleChange("groqModel", e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors appearance-none"
                    >
                      <option value="llama-3.3-70b-versatile">Llama 3.3 70B (High Quality)</option>
                      <option value="llama-3.1-8b-instant">Llama 3.1 8B (Low Latency)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Daily Task Generation Limit (Per User)</label>
                    <input 
                      type="number" 
                      value={settings.dailyTaskLimit}
                      onChange={(e) => handleChange("dailyTaskLimit", e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">Strict JSON Enforcement</h4>
                        <p className="text-sm text-gray-400">Force LLM responses to adhere strictly to JSON schemas.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={settings.strictMode}
                          onChange={(e) => handleChange("strictMode", e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-gray-400" /> Security & Access
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Session Timeout (Hours)</label>
                    <input 
                      type="number" 
                      value={settings.sessionTimeout}
                      onChange={(e) => handleChange("sessionTimeout", e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">Require Email Verification</h4>
                        <p className="text-sm text-gray-400">Users must verify their email before taking the assessment.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={settings.requireEmailVerification}
                          onChange={(e) => handleChange("requireEmailVerification", e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 mt-4">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                    <div>
                      <h4 className="text-red-400 font-medium">Danger Zone</h4>
                      <p className="text-sm text-red-400/80 mb-3">Reset all user sessions globally. This will force all users to log in again.</p>
                      <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Revoke All Sessions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-gray-400" /> Email & Notifications
                </h2>
                
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm">SMTP Configuration is handled via environment variables (<code>.env</code>). System notification preferences can be toggled below.</p>
                  
                  <div className="space-y-3 pt-2">
                    {[
                      "Send welcome email on new user registration",
                      "Send weekly progress summary to users",
                      "Alert admin on new error spikes",
                      "Send AI assessment completion receipts"
                    ].map((label, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <input type="checkbox" id={`chk-${i}`} defaultChecked={i !== 2} className="w-4 h-4 rounded bg-black/40 border-gray-600 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-gray-900" />
                        <label htmlFor={`chk-${i}`} className="text-sm text-gray-300">{label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

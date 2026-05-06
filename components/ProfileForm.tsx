"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { useProfile, ProfileData } from "@/lib/profileContext";
import { apiUpdateProfile } from "@/lib/api";

interface FieldDef {
  key: keyof ProfileData;
  label: string;
  type: "text" | "select";
  options?: { label: string; value: string }[];
  placeholder?: string;
}

interface SectionDef {
  id: string;
  title: string;
  fields: FieldDef[];
}

// Frontend display value → backend choice code maps
const GOAL_TO_CODE: Record<string, string> = {
  "Switch Domain": "switch_domain",
  "Excel in Current Domain": "excel_current",
  "Get a Job": "get_job",
  "Promotion": "promotion",
  "Side Income": "side_income",
};
const CODE_TO_GOAL: Record<string, string> = Object.fromEntries(Object.entries(GOAL_TO_CODE).map(([k, v]) => [v, k]));

const STATUS_TO_CODE: Record<string, string> = {
  "Student": "student", "Employed": "employed", "Freelance": "freelance",
  "Unemployed": "unemployed", "Career Break": "career_break",
};
const CODE_TO_STATUS: Record<string, string> = Object.fromEntries(Object.entries(STATUS_TO_CODE).map(([k, v]) => [v, k]));

const AVAIL_TO_CODE: Record<string, string> = {
  "< 5 hrs/week": "lt5", "5-10 hrs/week": "5_10", "10-20 hrs/week": "10_20", "20+ hrs/week": "gt20",
};
const CODE_TO_AVAIL: Record<string, string> = Object.fromEntries(Object.entries(AVAIL_TO_CODE).map(([k, v]) => [v, k]));

const LEVEL_TO_CODE: Record<string, string> = {
  "Fresher": "fresher", "Junior": "junior", "Mid": "mid", "Senior": "senior", "Lead": "lead",
};
const CODE_TO_LEVEL: Record<string, string> = Object.fromEntries(Object.entries(LEVEL_TO_CODE).map(([k, v]) => [v, k]));

const EDU_TO_CODE: Record<string, string> = {
  "High School": "high_school", "Diploma": "diploma", "Bachelor's": "bachelors",
  "Master's": "masters", "PhD": "phd", "Self-taught": "self_taught",
};
const CODE_TO_EDU: Record<string, string> = Object.fromEntries(Object.entries(EDU_TO_CODE).map(([k, v]) => [v, k]));

// Convert stored value (may be code or display) to display label for the form
function toDisplay(key: keyof ProfileData, val: string): string {
  if (key === "goal") return CODE_TO_GOAL[val] ?? val;
  if (key === "status") return CODE_TO_STATUS[val] ?? val;
  if (key === "availability") return CODE_TO_AVAIL[val] ?? val;
  if (key === "level") return CODE_TO_LEVEL[val] ?? val;
  if (key === "education") return CODE_TO_EDU[val] ?? val;
  return val;
}

// Convert display label to backend code before saving
function toCode(key: keyof ProfileData, val: string): string {
  if (key === "goal") return GOAL_TO_CODE[val] ?? val;
  if (key === "status") return STATUS_TO_CODE[val] ?? val;
  if (key === "availability") return AVAIL_TO_CODE[val] ?? val;
  if (key === "level") return LEVEL_TO_CODE[val] ?? val;
  if (key === "education") return EDU_TO_CODE[val] ?? val;
  return val;
}

const SECTIONS: SectionDef[] = [
  {
    id: "identity",
    title: "Identity",
    fields: [
      { key: "name", label: "Full Name", type: "text", placeholder: "Your name" },
      { key: "profession", label: "Profession", type: "text", placeholder: "e.g. Software Engineer" },
      { key: "bio", label: "Short Bio", type: "text", placeholder: "Tell us about yourself" },
      { key: "linkedin", label: "LinkedIn URL", type: "text", placeholder: "https://linkedin.com/in/..." },
    ],
  },
  {
    id: "experience",
    title: "Experience",
    fields: [
      { key: "experience", label: "Years of Experience", type: "text", placeholder: "e.g. 3" },
      {
        key: "level", label: "Role Level", type: "select",
        options: ["Fresher", "Junior", "Mid", "Senior", "Lead"].map((v) => ({ label: v, value: v })),
      },
      {
        key: "education", label: "Education Level", type: "select",
        options: ["High School", "Diploma", "Bachelor's", "Master's", "PhD", "Self-taught"].map((v) => ({ label: v, value: v })),
      },
      {
        key: "status", label: "Current Status", type: "select",
        options: ["Student", "Employed", "Freelance", "Unemployed", "Career Break"].map((v) => ({ label: v, value: v })),
      },
    ],
  },
  {
    id: "goals",
    title: "Goals & Availability",
    fields: [
      {
        key: "goal", label: "Primary Goal", type: "select",
        options: ["Switch Domain", "Excel in Current Domain", "Get a Job", "Promotion", "Side Income"].map((v) => ({ label: v, value: v })),
      },
      {
        key: "target_domain", label: "Target / Current Domain", type: "text",
        placeholder: "e.g. Software Engineering, Data Science",
      },
      {
        key: "availability", label: "Weekly Availability", type: "select",
        options: [
          { label: "< 5 hrs/week", value: "< 5 hrs/week" },
          { label: "5-10 hrs/week", value: "5-10 hrs/week" },
          { label: "10-20 hrs/week", value: "10-20 hrs/week" },
          { label: "20+ hrs/week", value: "20+ hrs/week" },
        ],
      },
    ],
  },
];

function FieldInput({ field, value, onChange }: { field: FieldDef; value: string; onChange: (v: string) => void }) {
  const base = "w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-purple-500/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] transition-all";
  if (field.type === "select") {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${base} [&>option]:bg-[#0d0d14]`}>
        <option value="">Select...</option>
        {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  }
  return (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder} className={base} />
  );
}

function Section({ section }: { section: SectionDef }) {
  const { profile, updateProfile } = useProfile();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const startEdit = () => {
    const initial: Record<string, string> = {};
    section.fields.forEach((f) => {
      const raw = profile[f.key];
      const val = Array.isArray(raw) ? raw.join(", ") : String(raw ?? "");
      // Convert stored code back to display label for the form
      initial[f.key as string] = toDisplay(f.key, val);
    });
    setDraft(initial);
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);

    try {
      // Build backend payload — map display values to backend field names and codes
      const payload: Record<string, string> = {};

      section.fields.forEach((f) => {
        const displayVal = draft[f.key as string] ?? "";
        const codeVal = toCode(f.key, displayVal);

        // Map frontend field keys → backend field names
        const backendKey: Record<string, string> = {
          name: "name",
          profession: "profession",
          experience: "experience_years",
          level: "experience_level",
          education: "education",
          status: "current_status",
          availability: "availability",
          goal: "goal",
          target_domain: "preferred_domain",
          linkedin: "linkedin",
          bio: "bio",
        };

        const bk = backendKey[f.key as string];
        if (bk) payload[bk] = codeVal;
      });

      const updated = await apiUpdateProfile(payload);

      // Only update local context AFTER successful API save
      const contextUpdate: Partial<ProfileData> = {};
      section.fields.forEach((f) => {
        (contextUpdate as Record<string, unknown>)[f.key as string] = draft[f.key as string] ?? "";
      });
      updateProfile({ ...contextUpdate, backend_completion: updated.profile_completion });
      setEditing(false);
    } catch (err) {
      console.error("Profile save failed:", err);
      // Keep editing open so user can retry — do not update local state
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass glow-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">{section.title}</h3>
        {!editing ? (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startEdit}
            className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors px-3 py-1.5 rounded-lg border border-purple-500/20 hover:border-purple-500/40">
            <Pencil size={12} /> Edit
          </motion.button>
        ) : (
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.95 }} onClick={save} disabled={saving}
              className="flex items-center gap-1 text-xs text-green-400 px-3 py-1.5 rounded-lg border border-green-500/20 hover:bg-green-500/10 transition-colors disabled:opacity-60">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              {saving ? "Saving..." : "Save"}
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditing(false)}
              className="flex items-center gap-1 text-xs text-white/40 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
              <X size={12} /> Cancel
            </motion.button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {section.fields.map((field) => (
          <div key={field.key as string}>
            <label className="text-xs text-white/40 mb-1.5 block">{field.label}</label>
            <AnimatePresence mode="wait">
              {editing ? (
                <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <FieldInput field={field} value={draft[field.key as string] ?? ""}
                    onChange={(v) => setDraft((d) => ({ ...d, [field.key as string]: v }))} />
                </motion.div>
              ) : (
                <motion.p key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-sm text-white/70 py-2 px-3 rounded-xl bg-white/3 border border-white/5 min-h-[38px]">
                  {(() => {
                    const raw = profile[field.key];
                    const val = Array.isArray(raw) ? raw.join(", ") : String(raw ?? "");
                    const display = toDisplay(field.key, val);
                    return display || <span className="text-white/20 italic">Not set</span>;
                  })()}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfileForm() {
  return (
    <div className="flex flex-col gap-4">
      {SECTIONS.map((s) => <Section key={s.id} section={s} />)}
    </div>
  );
}

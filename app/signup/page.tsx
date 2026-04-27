import AuthForm from "@/components/AuthForm";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Sign Up — AI Career Mentor" };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}

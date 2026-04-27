import AuthForm from "@/components/AuthForm";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Login — AI Career Mentor" };

export default function LoginPage() {
  return <AuthForm mode="login" />;
}

"use client";

import AuthForm from "@/components/AuthForm";
import { AuthProvider } from "@/context/AuthContext";

export default function LoginPage() {
  return (
    <AuthProvider>
        <AuthForm />
    </AuthProvider>
  );
}

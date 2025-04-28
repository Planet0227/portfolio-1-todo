"use client";

import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";
import { AuthProvider } from "@/context/AuthContext";

export default function LoginPage() {
  return (
    <AuthProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <AuthForm />
      </Suspense>
    </AuthProvider>
  );
}

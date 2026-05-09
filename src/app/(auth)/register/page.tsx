import Link from "next/link";
import { Suspense } from "react";

import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function RegisterPage() {
  return (
    <AuthShell
      footer={
        <>
          Already have an account?{" "}
          <Link className="font-medium text-primary hover:text-primary/80" href="/login">
            Sign in
          </Link>
        </>
      }
      subtitle="Create your seller workspace and connect the Chrome extension when you are ready."
      title="Start your automation workspace"
    >
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
    </AuthShell>
  );
}

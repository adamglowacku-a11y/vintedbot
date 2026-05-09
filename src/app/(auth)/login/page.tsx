import Link from "next/link";
import { Suspense } from "react";

import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      footer={
        <>
          New to VintedFlow?{" "}
          <Link className="font-medium text-primary hover:text-primary/80" href="/register">
            Create an account
          </Link>
        </>
      }
      subtitle="Sign in to manage automations, listings, messages, and extension sync."
      title="Welcome back"
    >
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </AuthShell>
  );
}

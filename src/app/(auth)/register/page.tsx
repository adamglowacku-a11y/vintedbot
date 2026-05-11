import Link from "next/link";
import { Suspense } from "react";

import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function RegisterPage() {
  return (
    <AuthShell
      footer={
        <>
          Masz już konto?{" "}
          <Link className="font-medium text-primary hover:text-primary/80" href="/login">
            Zaloguj się
          </Link>
        </>
      }
      subtitle="Utwórz workspace sprzedawcy i połącz rozszerzenie Chrome, gdy będziesz gotowy."
      title="Uruchom workspace automatyzacji"
    >
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
    </AuthShell>
  );
}

import Link from "next/link";
import { Suspense } from "react";

import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      footer={
        <>
          Nie masz konta?{" "}
          <Link className="font-medium text-primary hover:text-primary/80" href="/register">
            Utwórz konto
          </Link>
        </>
      }
      subtitle="Zaloguj się, aby zarządzać automatyzacjami, ofertami, wiadomościami i synchronizacją rozszerzenia."
      title="Witaj ponownie"
    >
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </AuthShell>
  );
}

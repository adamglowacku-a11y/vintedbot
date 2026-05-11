import { revalidatePath } from "next/cache";
import type { User } from "@supabase/supabase-js";
import { CheckCircle2, LockKeyhole, Shield, ShoppingBag, UsersRound, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isAdminEmail } from "@/lib/admin-access";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";

type AdminUserRow = {
  id: string;
  email: string;
  createdAt?: string;
  lastSignInAt?: string;
  accessStatus: "active" | "blocked";
  provider?: string;
};

export async function AdminControlPanel({ user }: { user: User }) {
  if (!isAdminEmail(user.email)) {
    return null;
  }

  const users = await getAdminUsers();
  const hasAdminConfig = hasSupabaseAdminConfig();

  return (
    <Card className="mb-6 border-primary/25 bg-primary/[0.04] p-0">
      <details open>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Shield className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Panel admina</p>
              <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-white">Zarządzanie dostępem Vintly</h2>
            </div>
          </div>
          <Badge variant="success">Widoczne tylko dla {user.email}</Badge>
        </summary>

        <div className="grid gap-4 p-5 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <UsersRound className="size-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-white">Zalogowani użytkownicy</h3>
                  <p className="text-sm text-muted-foreground">Sortowanie: od najstarszego konta do najnowszego.</p>
                </div>
              </div>
              <Badge variant={hasAdminConfig ? "success" : "warning"}>
                {hasAdminConfig ? `${users.length} użytk.` : "Brak service role"}
              </Badge>
            </div>

            {hasAdminConfig ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-white/10 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    <tr>
                      <th className="py-3 pr-4">Email</th>
                      <th className="px-4 py-3">Utworzony</th>
                      <th className="px-4 py-3">Ostatnie logowanie</th>
                      <th className="px-4 py-3">Provider</th>
                      <th className="px-4 py-3">Dostęp</th>
                      <th className="py-3 pl-4">Akcja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {users.map((adminUser) => (
                      <tr key={adminUser.id}>
                        <td className="py-4 pr-4 font-medium text-white">{adminUser.email}</td>
                        <td className="px-4 py-4 text-muted-foreground">{formatDate(adminUser.createdAt)}</td>
                        <td className="px-4 py-4 text-muted-foreground">{formatDate(adminUser.lastSignInAt)}</td>
                        <td className="px-4 py-4 text-muted-foreground">{adminUser.provider ?? "brak"}</td>
                        <td className="px-4 py-4">
                          <Badge variant={adminUser.accessStatus === "blocked" ? "warning" : "success"}>
                            {adminUser.accessStatus === "blocked" ? "Zablokowany" : "Aktywny"}
                          </Badge>
                        </td>
                        <td className="py-4 pl-4">
                          <form action={setUserAccessAction} className="flex gap-2">
                            <input name="userId" type="hidden" value={adminUser.id} />
                            <Button name="accessStatus" size="sm" type="submit" value="active" variant="secondary">
                              <CheckCircle2 className="size-4" />
                              Nadaj
                            </Button>
                            <Button name="accessStatus" size="sm" type="submit" value="blocked" variant="ghost">
                              <XCircle className="size-4" />
                              Odbierz
                            </Button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <AdminSetupNotice />
            )}
          </section>

          <div className="space-y-4">
            <details className="rounded-3xl border border-white/10 bg-white/[0.03] p-4" open>
              <summary className="flex cursor-pointer list-none items-center gap-3 font-semibold text-white">
                <ShoppingBag className="size-5 text-primary" />
                Zakupy i pakiety
              </summary>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>Tu pojawią się płatności, faktury i aktywne pakiety po podłączeniu Stripe albo Supabase tabeli zakupów.</p>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="font-medium text-white">Pakiety planowane</p>
                  <p className="mt-1">Start, Growth, Studio. Domyślna waluta: zł.</p>
                </div>
              </div>
            </details>

            <details className="rounded-3xl border border-white/10 bg-white/[0.03] p-4" open>
              <summary className="flex cursor-pointer list-none items-center gap-3 font-semibold text-white">
                <LockKeyhole className="size-5 text-primary" />
                Funkcje administracyjne
              </summary>
              <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
                <AdminFeature label="Nadawanie dostępu" enabled={hasAdminConfig} />
                <AdminFeature label="Odbieranie dostępu" enabled={hasAdminConfig} />
                <AdminFeature label="Lista użytkowników Google/Supabase" enabled={hasAdminConfig} />
                <AdminFeature label="Zakupy i pakiety" enabled={false} />
                <AdminFeature label="Ręczna zmiana planu" enabled={false} />
              </div>
            </details>
          </div>
        </div>
      </details>
    </Card>
  );
}

async function getAdminUsers(): Promise<AdminUserRow[]> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 100
  });

  if (error) {
    return [];
  }

  return [...data.users]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((item) => ({
      id: item.id,
      email: item.email ?? "brak emaila",
      createdAt: item.created_at,
      lastSignInAt: item.last_sign_in_at,
      accessStatus: item.app_metadata?.access_status === "blocked" ? "blocked" : "active",
      provider: item.app_metadata?.provider
    }));
}

async function setUserAccessAction(formData: FormData) {
  "use server";

  const supabase = createSupabaseAdminClient();
  const userId = String(formData.get("userId") ?? "");
  const accessStatus = formData.get("accessStatus") === "blocked" ? "blocked" : "active";

  if (!supabase || !userId) {
    return;
  }

  const { data } = await supabase.auth.admin.getUserById(userId);
  const currentMetadata = data.user?.app_metadata ?? {};

  await supabase.auth.admin.updateUserById(userId, {
    app_metadata: {
      ...currentMetadata,
      access_status: accessStatus
    }
  });

  revalidatePath("/dashboard");
}

function AdminFeature({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <span>{label}</span>
      <Badge variant={enabled ? "success" : "muted"}>{enabled ? "Gotowe" : "Wkrótce"}</Badge>
    </div>
  );
}

function AdminSetupNotice() {
  return (
    <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
      Aby zobaczyć listę użytkowników i zarządzać dostępem, ustaw w Vercel zmienną server-only:
      <code className="mx-1 rounded bg-black/30 px-1.5 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code>
      z Supabase Project Settings → API. Nie dodawaj jej jako NEXT_PUBLIC.
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return "brak";
  }

  return new Intl.DateTimeFormat("pl", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

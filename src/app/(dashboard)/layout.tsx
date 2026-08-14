import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  let companyName = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, role, status, companies(name)")
      .eq("id", user.id)
      .single();

    if (data) {
      profile = data;
      companyName =
        data.companies && !Array.isArray(data.companies)
          ? data.companies.name
          : null;
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          user={{
            email: user?.email,
            fullName: profile?.full_name ?? undefined,
            companyName: companyName ?? undefined,
          }}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

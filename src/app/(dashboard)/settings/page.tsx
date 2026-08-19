import { createClient } from "@/lib/supabase/server";
import { PageContainer } from "@/components/layout/page-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";
import { CompanyProfileForm } from "@/components/features/settings/company-profile";
import { InviteManager } from "@/components/features/settings/invite-manager";
import { TeamManager } from "@/components/features/settings/team-manager";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) {
    redirect("/onboarding");
  }

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", profile.company_id)
    .single();

  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, email:id, role, status") // simplified email mapping using id if actual email isn't selected, but wait we need auth users.
    // Actually we can't select email directly without an internal join or RPC, so we will just display full_name and role
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: true });

  const isConfigurator = profile.role === "admin" || profile.role === "owner";
  const isOwner = profile.role === "owner";

  return (
    <PageContainer
      title="Settings"
      description="Manage your enterprise configuration, branches, and team access."
    >
      <Tabs defaultValue="company" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="company">Company Profile</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
        </TabsList>
        
        <TabsContent value="company" className="space-y-6">
          <CompanyProfileForm company={company} disabled={!isConfigurator} />
          {isConfigurator && <InviteManager company={company} />}
        </TabsContent>
        
        <TabsContent value="team">
          <TeamManager members={members || []} currentUserId={user.id} isOwner={isOwner} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

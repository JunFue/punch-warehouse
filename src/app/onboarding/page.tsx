import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/features/onboarding/onboarding-flow";

export const metadata = {
  title: "Welcome | Set up your workspace",
};

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Double check if they actually already have a company
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (profile?.company_id) {
    redirect("/"); // Off to dashboard
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Punch</h1>
          <p className="text-muted-foreground">
            Let's get your workspace set up. You can either create a new company account or join an existing one using an invite code.
          </p>
        </div>

        <OnboardingFlow />
      </div>
    </div>
  );
}

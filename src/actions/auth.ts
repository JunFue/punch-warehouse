"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const companyName = formData.get("companyName") as string;
  const inviteCode = formData.get("inviteCode") as string;

  // Sign up the user
  const { data: authData, error: authError } =
    await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Failed to create account" };
  }

  // If user provides an invite code, join existing company
  if (inviteCode) {
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("invite_code", inviteCode.toUpperCase())
      .single();

    if (companyError || !company) {
      return { error: "Invalid invite code" };
    }

    // Create profile as pending member
    await supabase.from("profiles").upsert({
      id: authData.user.id,
      company_id: company.id,
      full_name: fullName,
      role: "member",
      status: "pending",
    });
  } else if (companyName) {
    // Create a new company
    const inviteCodeGenerated = generateInviteCode();
    const { data: newCompany, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: companyName,
        invite_code: inviteCodeGenerated,
      })
      .select()
      .single();

    if (companyError || !newCompany) {
      return { error: "Failed to create company" };
    }

    // Create profile as owner (auto-approved)
    await supabase.from("profiles").upsert({
      id: authData.user.id,
      company_id: newCompany.id,
      full_name: fullName,
      role: "owner",
      status: "approved",
    });
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

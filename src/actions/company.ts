"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function setupCompany(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const businessType = formData.get("business_type") as string;

  if (!name || !address || !businessType) {
    return { error: "All fields are required" };
  }

  // 1. Create company
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({
      name,
      address,
      business_type: businessType,
    })
    .select()
    .single();

  if (companyError || !company) {
    return { error: companyError?.message || "Failed to create company" };
  }

  // 2. Assign user as owner
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      company_id: company.id,
      role: 'owner',
      status: 'approved'
    })
    .eq("id", user.id);

  if (profileError) {
    return { error: "Failed to assign profile to company" };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function joinCompany(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const otp = formData.get("otp") as string;

  if (!otp || otp.length !== 6) {
    return { error: "Invalid invite code" };
  }

  // 1. Find company by OTP and check expiration
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, invite_otp_expires_at")
    .eq("invite_otp", otp)
    .single();

  if (companyError || !company || !company.invite_otp_expires_at) {
    return { error: "Invalid or expired invite code." };
  }

  // Check Expiration
  if (new Date(company.invite_otp_expires_at) < new Date()) {
    return { error: "This invite code has expired." };
  }

  // 2. Assign user to company as member
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      company_id: company.id,
      role: 'member',
      status: 'approved' // Automatically auto-approve for now via OTP
    })
    .eq("id", user.id);

  if (profileError) {
    return { error: "Failed to join company" };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

function generateOtp(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function generateInviteOtp() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Get user profile to check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'owner')) {
    return { error: "Unauthorized to generate invites" };
  }

  const otp = generateOtp();
  // Expires in 15 minutes
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from("companies")
    .update({
      invite_otp: otp,
      invite_otp_expires_at: expiresAt
    })
    .eq("id", profile.company_id!);

  if (error) {
    return { error: "Failed to generate invite code" };
  }

  revalidatePath("/settings");
  return { success: true, otp, expiresAt };
}

export async function updateCompanyDetails(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'owner')) {
    return { error: "Unauthorized" };
  }

  const payload = {
    name: formData.get("name") as string,
    address: formData.get("address") as string,
    business_type: formData.get("business_type") as string,
  };

  const { error } = await supabase
    .from("companies")
    .update(payload)
    .eq("id", profile.company_id!);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
}

export async function transferOwnership(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== 'owner') {
    return { error: "Only the owner can transfer ownership" };
  }

  // Double check target user is in same company
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", targetUserId)
    .single();
    
  if (!targetProfile || targetProfile.company_id !== profile.company_id) {
    return { error: "Target user is not in your company" };
  }

  // 1. Promote target to owner
  const { error: err1 } = await supabase
    .from("profiles")
    .update({ role: 'owner' })
    .eq("id", targetUserId);

  if (err1) return { error: "Failed to promote user" };

  // 2. Demote self to admin
  const { error: err2 } = await supabase
    .from("profiles")
    .update({ role: 'admin' })
    .eq("id", user.id);

  if (err2) return { error: "Failed to update your role" };

  revalidatePath("/settings");
  return { success: true };
}

export async function changeUserRole(targetUserId: string, newRole: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== 'owner') {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole as 'admin' | 'member' })
    .eq("id", targetUserId)
    .eq("company_id", profile.company_id!);

  if (error) return { error: "Failed to update role" };

  revalidatePath("/settings");
  return { success: true };
}

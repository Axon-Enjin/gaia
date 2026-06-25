"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth";
import {
  CreateGrantProgramSchema,
  GrantCriteriaSchema,
} from "@/lib/grants/criteria-schema";

export interface GrantProgramActionState {
  error?: string;
}

const UpdateSchema = z.object({
  program_id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  criteria: GrantCriteriaSchema,
  amount_per_learner: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v.trim() === "") return undefined;
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? n : undefined;
    }),
});

async function requireFunder() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthorized" as const, supabase, user: null };

  const profile = await ensureProfile();
  if (!profile || profile.role !== "funder") {
    return { error: "forbidden" as const, supabase, user: null };
  }

  return { error: null, supabase, user };
}

export async function createGrantProgramAction(
  _prev: GrantProgramActionState,
  formData: FormData,
): Promise<GrantProgramActionState> {
  const auth = await requireFunder();
  if (auth.error || !auth.user) return { error: auth.error ?? "unauthorized" };

  const badges = formData.getAll("required_badges").map(String);
  const parsed = CreateGrantProgramSchema.safeParse({
    name: formData.get("name"),
    criteria: {
      industry: formData.get("industry"),
      min_xp: Number(formData.get("min_xp")),
      required_badges: badges,
      require_credential: formData.get("require_credential") === "on",
    },
    amount_per_learner: (() => {
      const raw = formData.get("amount_per_learner");
      if (!raw || String(raw).trim() === "") return undefined;
      const n = Number(raw);
      return Number.isFinite(n) && n > 0 ? n : undefined;
    })(),
  });

  if (!parsed.success) return { error: "invalid_request" };

  const { data, error } = await auth.supabase
    .from("grant_programs")
    .insert({
      funder_id: auth.user.id,
      name: parsed.data.name,
      criteria: parsed.data.criteria,
      amount_per_learner: parsed.data.amount_per_learner ?? null,
      simulated: true,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "create_failed" };

  revalidatePath("/funder");
  redirect(`/funder/programs/${data.id}`);
}

export async function updateGrantProgramAction(
  _prev: GrantProgramActionState,
  formData: FormData,
): Promise<GrantProgramActionState> {
  const auth = await requireFunder();
  if (auth.error || !auth.user) return { error: auth.error ?? "unauthorized" };

  const badges = formData.getAll("required_badges").map(String);
  const parsed = UpdateSchema.safeParse({
    program_id: formData.get("program_id"),
    name: formData.get("name"),
    criteria: {
      industry: formData.get("industry"),
      min_xp: Number(formData.get("min_xp")),
      required_badges: badges,
      require_credential: formData.get("require_credential") === "on",
    },
    amount_per_learner: formData.get("amount_per_learner")?.toString(),
  });

  if (!parsed.success) return { error: "invalid_request" };

  const { error } = await auth.supabase
    .from("grant_programs")
    .update({
      name: parsed.data.name,
      criteria: parsed.data.criteria,
      amount_per_learner: parsed.data.amount_per_learner ?? null,
    })
    .eq("id", parsed.data.program_id)
    .eq("funder_id", auth.user.id);

  if (error) return { error: "update_failed" };

  revalidatePath("/funder");
  revalidatePath(`/funder/programs/${parsed.data.program_id}`);
  return {};
}

export async function deleteGrantProgramAction(
  programId: string,
): Promise<GrantProgramActionState> {
  const auth = await requireFunder();
  if (auth.error || !auth.user) return { error: auth.error ?? "unauthorized" };

  const { error } = await auth.supabase
    .from("grant_programs")
    .delete()
    .eq("id", programId)
    .eq("funder_id", auth.user.id);

  if (error) return { error: "delete_failed" };

  revalidatePath("/funder");
  redirect("/funder");
}

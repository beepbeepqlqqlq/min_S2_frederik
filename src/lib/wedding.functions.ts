import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const rsvpSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(7).max(30).regex(/^[0-9+()\-\s]+$/),
  attendance: z.boolean(),
  guestCount: z.number().int().min(0).max(1),
  guestName: z.string().trim().max(100).nullable(),
  guestSide: z.enum(["min", "frederik"]),
}).superRefine((value, ctx) => {
  if (value.guestCount === 1 && !value.guestName) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["guestName"], message: "동반인 이름을 입력해주세요." });
  }
});

const guestbookSchema = z.object({
  author: z.string().trim().min(1).max(60),
  content: z.string().trim().min(1).max(500),
});

function publicClient() {
  const url = process.env['SUPABASE_URL']!;
  const key = process.env['SUPABASE_PUBLISHABLE_KEY']!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
}

export const submitRsvp = createServerFn({ method: "POST" })
  .inputValidator((input) => rsvpSchema.parse(input))
  .handler(async ({ data }) => {
    const { error } = await publicClient().from("rsvp_submissions").insert({
      name: data.name,
      phone: data.phone,
      attendance: data.attendance,
      guest_count: data.guestCount,
      guest_name: data.guestCount === 1 ? data.guestName : null,
      guest_side: data.guestSide,
    });
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const listGuestbook = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("guestbook_messages")
    .select("id, author, content, color_index, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return data;
});

export const addGuestbookMessage = createServerFn({ method: "POST" })
  .inputValidator((input) => guestbookSchema.parse(input))
  .handler(async ({ data }) => {
    const colorIndex = Math.floor(Math.random() * 6);
    const { data: row, error } = await publicClient()
      .from("guestbook_messages")
      .insert({ author: data.author, content: data.content, color_index: colorIndex })
      .select("id, author, content, color_index, created_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

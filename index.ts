import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const site = Deno.env.get("SITE_URL")!;
const cors = { "Access-Control-Allow-Origin": site, "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const J = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const b = await req.json();
    if (b.website) return J({ ok: true }); // honeypot
    const email = String(b.email || "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !b.name || !b.mobile || !b.consent)
      return J({ error: "Please complete all required fields." }, 400);

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const redirectTo = site + "/portal.html";
    let uid: string, status = "Pending verification";

    const inv = await sb.auth.admin.inviteUserByEmail(email, { redirectTo, data: { full_name: b.name, mobile: b.mobile } });
    if (!inv.error) {
      uid = inv.data.user!.id;
    } else { // account already exists: send a login link, never reveal this to the visitor
      const { data: pr } = await sb.from("profiles").select("id").eq("email", email).maybeSingle();
      if (!pr) throw inv.error;
      uid = pr.id;
      const { data: u } = await sb.auth.admin.getUserById(uid);
      status = u.user?.email_confirmed_at ? "Submitted" : "Pending verification";
      await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: redirectTo } });
    }

    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await sb.from("projects").select("id", { count: "exact", head: true }).eq("owner", uid).gte("created_at", since);
    if ((count ?? 0) >= 3) return J({ error: "Too many requests. Please try again later." }, 429);

    const { error } = await sb.from("projects").insert({
      owner: uid, title: `${b.project_type || "Project"} · ${b.home_type || "Home"}`, project_type: b.project_type,
      home_type: b.home_type, location: b.location, lot_sqm: b.lot_size || null, budget_range: b.budget,
      notes: String(b.notes || "").slice(0, 2000), status,
    });
    if (error) throw error;
    return J({ ok: true });
  } catch (e) {
    console.error(e);
    return J({ error: "Something went wrong. Please try again." }, 500);
  }
});

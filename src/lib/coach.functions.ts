import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAIText, buildCreatorContext } from "@/lib/ai.server";
import { getUserTier } from "@/lib/generator-helpers.server";

const SYSTEM_PROMPT = `You are Bloom — a sharp, warm UK mum-creator strategist embedded in the Blym app.
You are NOT a generic chatbot. You give concrete, specific, actionable advice based on the creator's REAL data shown below.

RULES:
- British English. Sound like a friend who knows social media inside out.
- Be direct: spot patterns in their posts ("your last 3 reels under 2k views all opened with a question — try POV next").
- When they ask "what should I post", give 1-3 SPECIFIC ideas with hook + format. Never generic ("post about your day").
- Reference their niche, kids, vibe — make it feel personal.
- Suggest using app tools by name when relevant: Idea Generator, Viral Lab, Recycler, Schedule.
- Keep replies tight: 2-5 short paragraphs max. Use bullet lists when listing ideas.
- No emojis spam. One or two MAX, only if it lands.
- Never lie about what's possible — you can't auto-post to IG/TikTok. You can help schedule reminders + draft content.`;

export const listCoachMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("coach_messages")
      .select("id, role, content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) throw new Error("Failed to load chat history");
    return { messages: data ?? [] };
  });

export const sendCoachMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { content: string }) => {
    const content = (d?.content ?? "").trim();
    if (!content) throw new Error("Message can't be empty");
    if (content.length > 2000) throw new Error("Message too long (max 2000 chars)");
    return { content };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Tier gate — Coach is a Pro+ feature, free users see upgrade nudge
    const tier = await getUserTier(supabase, userId);
    if (tier === "free") {
      throw new Error(
        "Bloom Growth Coach is unlocked on Pro (£29.99/mo). Upgrade for unlimited chats with your AI strategist.",
      );
    }

    // Persist user message
    await supabase.from("coach_messages").insert({
      user_id: userId, role: "user", content: data.content,
    });

    // Gather live context
    const today = new Date();
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [profileRes, postsRes, briefsRes, goalsRes, historyRes] = await Promise.all([
      supabase.from("creator_profile").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("posts_logged").select("platform, hook, description, views, likes, saves, shares, posted_at")
        .eq("user_id", userId).gte("posted_at", fourteenDaysAgo.slice(0, 10))
        .order("posted_at", { ascending: false }).limit(20),
      supabase.from("daily_briefs").select("hook, film, filmed, brief_date")
        .eq("user_id", userId).gte("brief_date", sevenDaysAgo)
        .order("brief_date", { ascending: false }).limit(7),
      supabase.from("creator_goals").select("title, target_value, current_value, unit, deadline")
        .eq("user_id", userId).limit(5),
      supabase.from("coach_messages").select("role, content")
        .eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
    ]);

    const ctx = buildCreatorContext(profileRes.data ?? {});
    const recentPosts = (postsRes.data ?? []).map(p =>
      `• ${p.posted_at} ${p.platform}: "${(p.hook || p.description || "").slice(0, 80)}" — ${p.views ?? 0} views, ${p.likes ?? 0} likes, ${p.saves ?? 0} saves`
    ).join("\n") || "No posts logged in the last 14 days.";
    const recentBriefs = (briefsRes.data ?? []).map(b =>
      `• ${b.brief_date}: "${b.hook}" — ${b.filmed ? "✓ filmed" : "✗ skipped"}`
    ).join("\n") || "No briefs this week.";
    const goals = (goalsRes.data ?? []).map(g =>
      `• ${g.title}: ${g.current_value}/${g.target_value} ${g.unit ?? ""}${g.deadline ? ` by ${g.deadline}` : ""}`
    ).join("\n") || "No active goals.";

    const dataBlock = `### Creator profile
${ctx}

### Recent posts (last 14 days)
${recentPosts}

### This week's briefs
${recentBriefs}

### Active goals
${goals}

### Today
${today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}, ${today.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;

    // Reverse history to chronological + limit to last 12 turns to keep prompt tight
    const history = (historyRes.data ?? [])
      .reverse()
      .slice(-12)
      .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

    let reply: string;
    try {
      reply = await callAIText({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: dataBlock },
          ...history,
        ],
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI failed";
      throw new Error(msg);
    }

    if (!reply?.trim()) reply = "Hmm, I went blank. Try asking again?";

    const { data: inserted } = await supabase.from("coach_messages")
      .insert({ user_id: userId, role: "assistant", content: reply })
      .select("id, role, content, created_at").single();

    return { message: inserted };
  });

export const clearCoachHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await supabase.from("coach_messages").delete().eq("user_id", userId);
    return { ok: true };
  });

// Audience-fit scoring — used by Coach + Generator
export const scoreAudienceFit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { text: string }) => {
    const text = (d?.text ?? "").trim();
    if (!text) throw new Error("Paste a hook or caption to score");
    if (text.length > 2000) throw new Error("Too long (max 2000 chars)");
    return { text };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const tier = await getUserTier(supabase, userId);
    if (tier === "free") {
      throw new Error("Audience-fit scoring — unlock with Pro (£29.99/mo).");
    }
    const { data: profile } = await supabase
      .from("creator_profile").select("*").eq("user_id", userId).maybeSingle();
    const { data: bestPosts } = await supabase
      .from("posts_logged").select("hook, views, likes")
      .eq("user_id", userId).order("views", { ascending: false }).limit(5);
    const ctx = buildCreatorContext(profile ?? {});
    const best = (bestPosts ?? []).map(p => `• "${p.hook ?? ""}" (${p.views ?? 0} views)`).join("\n") || "No top posts yet.";

    const reply = await callAIText({
      messages: [
        {
          role: "system",
          content: `You score how well a hook/caption fits a creator's audience. Reply in this EXACT format:
SCORE: <0-100>
WEAKEST: <one short sentence on the weakest line>
REWRITE: <one improved alternative, ready to use>`,
        },
        {
          role: "user",
          content: `Creator profile:\n${ctx}\n\nTheir top hooks (for reference):\n${best}\n\nScore this:\n"""${data.text}"""`,
        },
      ],
    });

    const score = parseInt(reply.match(/SCORE:\s*(\d+)/i)?.[1] ?? "0", 10);
    const weakest = reply.match(/WEAKEST:\s*(.+?)(?=\n|REWRITE:|$)/is)?.[1]?.trim() ?? "";
    const rewrite = reply.match(/REWRITE:\s*([\s\S]+)$/i)?.[1]?.trim() ?? "";
    return { score: Math.max(0, Math.min(100, score)), weakest, rewrite };
  });
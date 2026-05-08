// Server-only helper for calling Lovable AI Gateway.
// Never import this from client code.

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

export async function callAITool<T>(opts: {
  messages: ChatMessage[];
  toolName: string;
  toolDescription: string;
  parameters: Record<string, unknown>;
  model?: string;
}): Promise<T> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model ?? "google/gemini-3-flash-preview",
      messages: opts.messages,
      tools: [
        {
          type: "function",
          function: {
            name: opts.toolName,
            description: opts.toolDescription,
            parameters: opts.parameters,
          },
        },
      ],
      tool_choice: { type: "function", function: { name: opts.toolName } },
    }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Response("Rate limited — try again in a moment", { status: 429 });
    if (res.status === 402) throw new Response("AI credits exhausted — please top up workspace usage", { status: 402 });
    const text = await res.text();
    console.error("AI gateway error", res.status, text);
    throw new Error("AI gateway error");
  }

  const json = await res.json();
  const call = json.choices?.[0]?.message?.tool_calls?.[0];
  if (!call) throw new Error("AI returned no tool call");
  try {
    return JSON.parse(call.function.arguments) as T;
  } catch (e) {
    console.error("Failed to parse AI tool args", call.function.arguments);
    throw new Error("AI returned invalid JSON");
  }
}

export async function callAIText(opts: { messages: ChatMessage[]; model?: string }): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: opts.model ?? "google/gemini-3-flash-preview",
      messages: opts.messages,
    }),
  });
  if (!res.ok) {
    if (res.status === 429) throw new Response("Rate limited — try again in a moment", { status: 429 });
    if (res.status === 402) throw new Response("AI credits exhausted", { status: 402 });
    throw new Error("AI gateway error");
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "";
}

export function buildCreatorContext(p: {
  niches?: string[] | null;
  vibe?: string | null;
  kids_ages?: string | null;
  location?: string | null;
  work_status?: string | null;
  platforms?: string[] | null;
  follower_goal?: number | null;
  posting_frequency?: string | null;
  known_for?: string | null;
}): string {
  const lines = [
    p.niches?.length ? `Niches: ${p.niches.join(", ")}` : null,
    p.vibe ? `Vibe: ${p.vibe}` : null,
    p.kids_ages ? `Kids' ages: ${p.kids_ages}` : null,
    p.work_status ? `Work: ${p.work_status}` : null,
    p.location ? `Location: ${p.location}` : null,
    p.platforms?.length ? `Posts on: ${p.platforms.join(", ")}` : null,
    p.follower_goal ? `Follower goal: ${p.follower_goal}` : null,
    p.posting_frequency ? `Posts: ${p.posting_frequency}` : null,
    p.known_for ? `Known for: ${p.known_for}` : null,
  ].filter(Boolean);
  return lines.join("\n") || "No profile yet — assume a relatable mum creator with young kids.";
}
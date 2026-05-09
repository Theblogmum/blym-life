import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Users, Heart, MessageCircle, Trash2, Send } from "lucide-react";
import { toast } from "sonner";
import { listFeed, createPost, deletePost, toggleLike, addComment, deleteComment } from "@/lib/community.functions";
import { PageHero } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/community")({ component: Page });

const MOODS = ["🌱 just starting", "💪 grinding", "😩 burnt out", "🎉 celebrating", "🤔 stuck", "❓ need advice"];

function Page() {
  const fetchFeed = useServerFn(listFeed);
  const create = useServerFn(createPost);
  const del = useServerFn(deletePost);
  const like = useServerFn(toggleLike);
  const comment = useServerFn(addComment);
  const dcomment = useServerFn(deleteComment);
  const qc = useQueryClient();
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | null>(null);

  const feed = useQuery({ queryKey: ["community-feed"], queryFn: () => fetchFeed() });
  const refresh = () => qc.invalidateQueries({ queryKey: ["community-feed"] });

  const post = useMutation({
    mutationFn: () => create({ data: { content, mood: mood ?? undefined } }),
    onSuccess: () => { setContent(""); setMood(null); toast.success("Shared"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const delPost = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: refresh });
  const togLike = useMutation({ mutationFn: (v: { post_id: string; liked: boolean }) => like({ data: v }), onSuccess: refresh });

  return (
    <div>
      <PageHero icon={Users} eyebrow="Safe space" title="The mum creator group chat." description="A no-DM-sliding, no-judgement space to share wins, vent, ask, and cheer each other on." variant="bloom" />

      <section className="mx-auto max-w-2xl px-5 py-8">
        <Card className="rounded-3xl p-5">
          <Textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1500}
            placeholder="What's on your mind today? (rant, win, question — all welcome)"
            className="rounded-xl bg-secondary/40"
          />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {MOODS.map((m) => (
              <button key={m} type="button" onClick={() => setMood(mood === m ? null : m)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${mood === m ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/70 hover:bg-secondary/70"}`}>
                {m}
              </button>
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <Button onClick={() => post.mutate()} disabled={content.trim().length < 2 || post.isPending} className="rounded-full">
              <Send className="mr-1.5 h-3.5 w-3.5" /> {post.isPending ? "Sharing…" : "Share"}
            </Button>
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-2xl space-y-4 px-5 pb-12">
        {feed.isLoading && <p className="text-center text-sm text-muted-foreground">Loading…</p>}
        {feed.data?.posts.length === 0 && (
          <Card className="rounded-3xl p-8 text-center">
            <p className="text-sm text-muted-foreground">Be the first to share. The room is warm.</p>
          </Card>
        )}
        {feed.data?.posts.map((p) => (
          <Card key={p.id} className="rounded-3xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold">{p.author}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {new Date(p.created_at).toLocaleString()} {p.mood && <>· {p.mood}</>}
                </p>
              </div>
              {p.mine && (
                <button onClick={() => delPost.mutate(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              )}
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{p.content}</p>
            <div className="mt-4 flex items-center gap-3 border-t border-border/40 pt-3 text-xs">
              <button onClick={() => togLike.mutate({ post_id: p.id, liked: p.liked_by_me })}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold ${p.liked_by_me ? "bg-primary/15 text-primary" : "bg-secondary text-foreground/70 hover:bg-secondary/70"}`}>
                <Heart className={`h-3.5 w-3.5 ${p.liked_by_me ? "fill-current" : ""}`} /> {p.like_count}
              </button>
              <span className="flex items-center gap-1.5 text-muted-foreground"><MessageCircle className="h-3.5 w-3.5" /> {p.comments.length}</span>
            </div>
            {p.comments.length > 0 && (
              <ul className="mt-3 space-y-2">
                {p.comments.map((c) => (
                  <li key={c.id} className="rounded-2xl bg-secondary/40 p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold">{c.author}</p>
                      {c.mine && <button onClick={() => dcomment({ data: { id: c.id } }).then(refresh)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>}
                    </div>
                    <p className="mt-1">{c.content}</p>
                  </li>
                ))}
              </ul>
            )}
            <CommentBox onAdd={async (text) => { await comment({ data: { post_id: p.id, content: text } }); refresh(); }} />
          </Card>
        ))}
      </section>
    </div>
  );
}

function CommentBox({ onAdd }: { onAdd: (text: string) => Promise<void> }) {
  const [v, setV] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (v.trim().length === 0) return;
        setBusy(true);
        try { await onAdd(v.trim()); setV(""); } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); } finally { setBusy(false); }
      }}
      className="mt-3 flex gap-2"
    >
      <Input value={v} onChange={(e) => setV(e.target.value)} placeholder="Add a kind comment…" maxLength={800} className="rounded-xl bg-secondary/40" />
      <Button type="submit" size="sm" className="rounded-full" disabled={busy || v.trim().length === 0}><Send className="h-3.5 w-3.5" /></Button>
    </form>
  );
}
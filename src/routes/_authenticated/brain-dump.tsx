import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Brain, Sparkles, Upload, X, Image as ImageIcon, Video as VideoIcon,
  Copy, Hash, Search, Clock, Megaphone, Layers, Film, Trash2, Loader2, Lock,
} from "lucide-react";
import { toast } from "sonner";
import {
  analyseBrainDump,
  getBrainDumpUploadUrl,
  listBrainDumps,
  getBrainDump,
  deleteBrainDump,
} from "@/lib/brain-dump.functions";
import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/page-hero";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/brain-dump")({
  component: BrainDumpPage,
});

type StagedFile = {
  localId: string;
  file: File;
  path?: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  note: string;
};

const EXAMPLE = `I have a camera roll full and I don't know what to do with it. My camera roll contains:

- Beach day with the kids — in the water, on the sand, driving to the beach.
- Park days — swings, slides, feeding the ducks, picking flowers.
- Siblings fighting, then noticing the camera and pretending they were being angels all along, giggling.`;

function BrainDumpPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const tierQ = useQuery({
    queryKey: ["my-tier", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("tier")
        .eq("id", user!.id)
        .maybeSingle();
      return (data?.tier ?? "free") as string;
    },
  });
  const tier = tierQ.data ?? "free";
  const hasAccess = ["studio", "pro", "ultimate", "premium", "lifetime"].includes(tier);

  const signFn = useServerFn(getBrainDumpUploadUrl);
  const analyseFn = useServerFn(analyseBrainDump);
  const listFn = useServerFn(listBrainDumps);
  const getFn = useServerFn(getBrainDump);
  const deleteFn = useServerFn(deleteBrainDump);

  const [text, setText] = useState("");
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const dumpsQ = useQuery({ queryKey: ["brain-dumps"], queryFn: () => listFn() });
  const detailQ = useQuery({
    queryKey: ["brain-dump", activeId],
    queryFn: () => getFn({ data: { id: activeId! } }),
    enabled: !!activeId,
  });

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 20 - staged.length);
    const newItems: StagedFile[] = arr.map((file) => ({
      localId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      uploading: true,
      uploaded: false,
      note: "",
    }));
    setStaged((s) => [...s, ...newItems]);

    for (const item of newItems) {
      try {
        if (item.file.size > 50 * 1024 * 1024) throw new Error("Max 50MB per file");
        const { path, token } = await signFn({
          data: { filename: item.file.name, contentType: item.file.type || "application/octet-stream" },
        });
        const { error } = await supabase.storage
          .from("brain-dump-media")
          .uploadToSignedUrl(path, token, item.file, {
            contentType: item.file.type || "application/octet-stream",
          });
        if (error) throw error;
        setStaged((s) =>
          s.map((x) =>
            x.localId === item.localId
              ? { ...x, path, uploading: false, uploaded: true }
              : x,
          ),
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Upload failed";
        toast.error(`${item.file.name}: ${msg}`);
        setStaged((s) =>
          s.map((x) =>
            x.localId === item.localId
              ? { ...x, uploading: false, uploaded: false, error: msg }
              : x,
          ),
        );
      }
    }
  };

  const removeStaged = (id: string) => setStaged((s) => s.filter((x) => x.localId !== id));

  const analyse = useMutation({
    mutationFn: async () => {
      const ready = staged.filter((s) => s.uploaded && s.path);
      return analyseFn({
        data: {
          rawText: text,
          media: ready.map((s) => ({
            path: s.path!,
            name: s.file.name,
            type: s.file.type || "application/octet-stream",
            note: s.note || undefined,
          })),
        },
      });
    },
    onSuccess: (r) => {
      toast.success(`${r.count} content ideas ready ✨`);
      setText("");
      setStaged([]);
      setActiveId(r.id);
      qc.invalidateQueries({ queryKey: ["brain-dumps"] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to analyse"),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: (_r, id) => {
      if (activeId === id) setActiveId(null);
      qc.invalidateQueries({ queryKey: ["brain-dumps"] });
      toast.success("Deleted");
    },
    onError: (e: Error) => toast.error(e.message || "Failed"),
  });

  const uploadingCount = staged.filter((s) => s.uploading).length;
  const canSubmit =
    text.trim().length >= 10 && uploadingCount === 0 && !analyse.isPending;

  const copy = (s: string, label = "Copied") => {
    navigator.clipboard.writeText(s);
    toast.success(label);
  };

  if (tierQ.isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div>
        <PageHero
          icon={Brain}
          eyebrow="Brain Dump™"
          title="Dump the chaos. Walk away with a full content plan."
          description="Drop your messy ideas + camera roll. I'll categorise it all and hand you back fully-optimised content — hooks, scripts, captions, hashtags, SEO, the lot."
          variant="plum"
        />
        <section className="mx-auto max-w-2xl px-5 py-12">
          <Card glow className="rounded-3xl border-0 p-8 text-center shadow-[var(--shadow-glow)] surface-plum">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-background/60">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-black">Brain Dump™ is a Studio + Pro feature</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-foreground/70">
              Upgrade to Studio (£14.99/mo) or Pro (£29.99/mo) to unlock the Brain Dump™ organiser, plus the full Growth Lab and Creator Business toolkit. Start with a 3-day free trial.
            </p>
            <Button asChild size="lg" className="mt-6 h-12 rounded-2xl px-6 font-bold">
              <Link to="/settings">Upgrade plan</Link>
            </Button>
          </Card>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        icon={Brain}
        eyebrow="Brain Dump™"
        title="Dump the chaos. Walk away with a full content plan."
        description="Drop your messy ideas + camera roll. I'll categorise it all and hand you back fully-optimised content — hooks, scripts, captions, hashtags, SEO, the lot. Studio + Pro only."
        variant="plum"
      />

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[1fr_320px]">
        {/* MAIN */}
        <div className="space-y-6">
          {!activeId && (
            <Card glow className="overflow-hidden rounded-3xl border-0 p-0 shadow-[var(--shadow-glow)]">
              <div className="border-b border-border/40 surface-plum px-6 py-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">
                  Dump everything
                </p>
              </div>
              <div className="space-y-5 p-6">
                <Textarea
                  rows={8}
                  placeholder={EXAMPLE}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="rounded-2xl bg-secondary/40 text-base"
                  maxLength={8000}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setText(EXAMPLE)}
                    className="rounded-full bg-secondary px-3 py-1 font-medium hover:bg-secondary/70"
                  >
                    Use the example
                  </button>
                  <span>{text.length}/8000</span>
                </div>

                {/* Uploads */}
                <div>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary/30 px-4 py-6 text-sm font-medium text-foreground/70 hover:bg-secondary/50">
                    <Upload className="h-4 w-4" />
                    Drop in photos / videos from the camera roll (optional, up to 20)
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => {
                        handleFiles(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>

                  {staged.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {staged.map((s) => (
                        <li
                          key={s.localId}
                          className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-3"
                        >
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary">
                            {s.file.type.startsWith("video/") ? (
                              <VideoIcon className="h-4 w-4" />
                            ) : (
                              <ImageIcon className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{s.file.name}</p>
                            <Input
                              value={s.note}
                              onChange={(e) =>
                                setStaged((arr) =>
                                  arr.map((x) =>
                                    x.localId === s.localId ? { ...x, note: e.target.value } : x,
                                  ),
                                )
                              }
                              placeholder="Optional: what's in this clip?"
                              maxLength={300}
                              className="mt-1 h-8 text-xs"
                            />
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {s.uploading && (
                                <span className="inline-flex items-center gap-1">
                                  <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
                                </span>
                              )}
                              {s.uploaded && <span className="text-green-700">Uploaded ✓</span>}
                              {s.error && <span className="text-destructive">{s.error}</span>}
                            </p>
                          </div>
                          <button
                            onClick={() => removeStaged(s.localId)}
                            className="rounded-lg p-1 text-foreground/50 hover:bg-secondary hover:text-foreground"
                            aria-label="Remove"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Button
                  size="lg"
                  className="h-12 w-full rounded-2xl text-base font-bold shadow-[var(--shadow-glow)] sm:w-auto"
                  disabled={!canSubmit}
                  onClick={() => analyse.mutate()}
                >
                  {analyse.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Organising the chaos…
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Turn this into a content plan
                    </>
                  )}
                </Button>
                {uploadingCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Hang on — {uploadingCount} file{uploadingCount > 1 ? "s" : ""} still uploading…
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* RESULTS */}
          {activeId && detailQ.data && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/50">
                    Brain dump from {new Date(detailQ.data.dump.created_at).toLocaleDateString()}
                  </p>
                  <h2 className="font-display text-2xl font-black">
                    {detailQ.data.ideas.length} content ideas, fully planned
                  </h2>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveId(null)}>
                  + New brain dump
                </Button>
              </div>

              {Array.isArray(detailQ.data.dump.media) && detailQ.data.dump.media.length > 0 && (
                <Card className="rounded-2xl p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/60">
                    Your media ({detailQ.data.dump.media.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                    {detailQ.data.dump.media.map((m: any) => (
                      <div key={m.path} className="overflow-hidden rounded-xl bg-secondary">
                        {m.url && m.type?.startsWith("image/") ? (
                          <img src={m.url} alt={m.name} className="aspect-square w-full object-cover" />
                        ) : m.url && m.type?.startsWith("video/") ? (
                          <video src={m.url} className="aspect-square w-full object-cover" muted />
                        ) : (
                          <div className="grid aspect-square w-full place-items-center">
                            <ImageIcon className="h-5 w-5 text-foreground/40" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <div className="grid gap-4">
                {detailQ.data.ideas.map((idea: any, idx: number) => {
                  const surface = ["surface-peach", "surface-mint", "surface-sky", "surface-plum", "surface-butter"][idx % 5];
                  return (
                    <Card key={idea.id} className={cn("rounded-3xl border-0 p-6 shadow-[var(--shadow-soft)]", surface)}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">
                              Idea {idx + 1}
                            </span>
                            {idea.category && <Badge variant="secondary" className="text-[10px]">{idea.category}</Badge>}
                            <Badge className="gap-1 text-[10px]">
                              {idea.format === "batched" ? <Layers className="h-3 w-3" /> : <Film className="h-3 w-3" />}
                              {idea.format === "batched" ? "Batched video" : "Standalone clip"}
                            </Badge>
                            {idea.best_platform && (
                              <Badge variant="outline" className="text-[10px]">{idea.best_platform}</Badge>
                            )}
                          </div>
                          <h3 className="mt-1 font-display text-xl font-black leading-tight">{idea.title}</h3>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <Field label="Hook (first 3s)" value={idea.hook} onCopy={() => copy(idea.hook, "Hook copied")} />
                        <Field label="Caption" value={idea.caption} onCopy={() => copy(idea.caption, "Caption copied")} />
                        <Field
                          label="Full script"
                          value={idea.script}
                          onCopy={() => copy(idea.script, "Script copied")}
                          full
                        />
                        {idea.voiceover && (
                          <Field label="Voiceover line" value={idea.voiceover} onCopy={() => copy(idea.voiceover)} />
                        )}
                        {idea.text_overlay && (
                          <Field label="Text overlay" value={idea.text_overlay} onCopy={() => copy(idea.text_overlay)} />
                        )}
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <ChipBlock icon={Hash} label="Hashtags" items={idea.hashtags?.map((h: string) => `#${h}`)} onCopy={() => copy((idea.hashtags || []).map((h: string) => `#${h}`).join(" "), "Hashtags copied")} />
                        <ChipBlock icon={Search} label="SEO keywords" items={idea.seo_keywords} onCopy={() => copy((idea.seo_keywords || []).join(", "), "Keywords copied")} />
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {idea.best_time && (
                          <div className="rounded-2xl bg-background/60 p-3 text-sm">
                            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground/60">
                              <Clock className="h-3 w-3" /> Best time
                            </p>
                            <p className="mt-1">{idea.best_time}</p>
                          </div>
                        )}
                        {idea.posting_strategy && (
                          <div className="rounded-2xl bg-background/60 p-3 text-sm">
                            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground/60">
                              <Megaphone className="h-3 w-3" /> Posting strategy
                            </p>
                            <p className="mt-1">{idea.posting_strategy}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {activeId && detailQ.isLoading && (
            <div className="grid place-items-center py-20 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>

        {/* SIDEBAR — history */}
        <aside className="space-y-3">
          <p className="px-2 text-[11px] font-bold uppercase tracking-widest text-foreground/50">
            Past brain dumps
          </p>
          {dumpsQ.data?.dumps.length === 0 && (
            <p className="px-2 text-sm text-muted-foreground">No dumps yet — dump away ✨</p>
          )}
          {dumpsQ.data?.dumps.map((d: any) => {
            const isActive = d.id === activeId;
            const mediaCount = Array.isArray(d.media) ? d.media.length : 0;
            return (
              <Card
                key={d.id}
                className={cn(
                  "cursor-pointer rounded-2xl p-3 transition-colors",
                  isActive && "ring-2 ring-primary",
                )}
                onClick={() => setActiveId(d.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm">{d.raw_text || "(no text)"}</p>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      {new Date(d.created_at).toLocaleString()}
                      {mediaCount > 0 && ` · ${mediaCount} file${mediaCount > 1 ? "s" : ""}`}
                      {d.status === "processing" && " · processing…"}
                      {d.status === "failed" && " · failed"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this brain dump?")) del.mutate(d.id);
                    }}
                    className="rounded-lg p-1 text-foreground/40 hover:bg-secondary hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}

          <Card className="rounded-2xl p-4 surface-butter">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground/70">
              <Lock className="h-3 w-3" /> Studio + Pro
            </p>
            <p className="mt-1 text-xs text-foreground/70">
              Brain Dump is included in Studio and Pro plans.
            </p>
            <Link to="/settings" className="mt-2 inline-block text-xs font-semibold underline">
              Manage plan →
            </Link>
          </Card>
        </aside>
      </section>
    </div>
  );
}

function Field({
  label, value, onCopy, full,
}: {
  label: string; value: string; onCopy: () => void; full?: boolean;
}) {
  if (!value) return null;
  return (
    <div className={cn("rounded-2xl bg-background/60 p-3", full && "md:col-span-2")}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">{label}</p>
        <button
          onClick={onCopy}
          className="rounded-md p-1 text-foreground/50 hover:bg-secondary hover:text-foreground"
          aria-label={`Copy ${label}`}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{value}</p>
    </div>
  );
}

function ChipBlock({
  icon: Icon, label, items, onCopy,
}: {
  icon: typeof Hash; label: string; items?: string[]; onCopy: () => void;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-2xl bg-background/60 p-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground/60">
          <Icon className="h-3 w-3" /> {label}
        </p>
        <button
          onClick={onCopy}
          className="rounded-md p-1 text-foreground/50 hover:bg-secondary hover:text-foreground"
          aria-label={`Copy ${label}`}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((it, i) => (
          <span key={i} className="rounded-full bg-secondary/70 px-2 py-0.5 text-xs">
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}
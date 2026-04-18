import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "wouter";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  KanbanSquare,
  GripVertical,
  User,
  Send,
  ShieldCheck,
  X,
  Briefcase,
  Loader2,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCompanyProfile } from "@/hooks/use-company-profile";
import { useListJobs } from "@workspace/api-client-react";

const PIPELINE_STAGES = [
  { id: "applied", label: "Applied", color: "bg-blue-500" },
  { id: "shortlisted", label: "Shortlisted", color: "bg-amber-500" },
  { id: "screened", label: "Screened", color: "bg-purple-500" },
  { id: "interviewed", label: "Interviewed", color: "bg-cyan-500" },
  { id: "offered", label: "Offered", color: "bg-emerald-500" },
  { id: "hired", label: "Hired", color: "bg-green-600" },
] as const;

type StageId = (typeof PIPELINE_STAGES)[number]["id"];

interface MatchCard {
  id: number;
  candidateId: number;
  candidateName: string;
  candidateTitle: string;
  overallScore: number;
  matchedSkills: string[];
  applied: boolean;
  status: string;
  stage: StageId;
}

function getStageFromMatch(match: { status: string; applied: boolean }): StageId {
  const s = match.status;
  if (s === "screened" || s === "interviewed" || s === "offered" || s === "hired") return s;
  if (s === "shortlisted") return "shortlisted";
  if (match.applied) return "applied";
  return "applied";
}

function getStatusFromStage(stage: StageId): string {
  if (stage === "applied") return "shortlisted";
  return stage;
}

function scoreColor(score: number) {
  if (score > 75) return "text-green-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-500";
}

function CandidateCard({ card, isDragging }: { card: MatchCard; isDragging?: boolean }) {
  return (
    <div className={`bg-card border border-border rounded-lg p-3 shadow-sm ${isDragging ? "opacity-75 shadow-lg ring-2 ring-primary" : "hover:shadow-md"} transition-shadow`}>
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-muted-foreground/50 mt-0.5 shrink-0 cursor-grab" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/candidates/${card.candidateId}`}
              className="font-medium text-sm text-foreground hover:text-primary truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {card.candidateName}
            </Link>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{card.candidateTitle}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`font-mono text-xs font-bold ${scoreColor(card.overallScore)}`}>
              {Math.round(card.overallScore)}%
            </span>
            {card.applied && (
              <span className="inline-flex items-center gap-0.5 bg-blue-500/10 text-blue-600 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
                <Send className="w-2.5 h-2.5" /> Applied
              </span>
            )}
          </div>
          {card.matchedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {card.matchedSkills.slice(0, 3).map((s) => (
                <Badge key={s} variant="outline" className="text-[9px] py-0 h-4 bg-background">
                  {s}
                </Badge>
              ))}
              {card.matchedSkills.length > 3 && (
                <Badge variant="outline" className="text-[9px] py-0 h-4 bg-background">
                  +{card.matchedSkills.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SortableCard({ card }: { card: MatchCard }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card-${card.id}`,
    data: { card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CandidateCard card={card} isDragging={isDragging} />
    </div>
  );
}

function StageColumn({
  stage,
  cards,
  color,
}: {
  stage: StageId;
  cards: MatchCard[];
  color: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `stage-${stage}` });

  return (
    <div className="flex flex-col min-w-[260px] w-[260px] shrink-0">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          {PIPELINE_STAGES.find((s) => s.id === stage)?.label}
        </h3>
        <Badge variant="secondary" className="ml-auto font-mono text-xs">
          {cards.length}
        </Badge>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-lg border-2 border-dashed p-2 space-y-2 min-h-[200px] transition-colors ${
          isOver ? "border-primary bg-primary/5" : "border-border/50 bg-secondary/20"
        }`}
      >
        <SortableContext
          items={cards.map((c) => `card-${c.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <SortableCard key={card.id} card={card} />
          ))}
        </SortableContext>
        {cards.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground/50">
            Drop candidates here
          </div>
        )}
      </div>
    </div>
  );
}

export default function Pipeline() {
  const { toast } = useToast();
  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
  const { data: profile } = useCompanyProfile();
  const companyProfileId = profile?.id;

  const { data: jobs } = useListJobs(
    companyProfileId ? { companyProfileId } : {},
    { query: { enabled: !!companyProfileId } }
  );

  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const [allCards, setAllCards] = useState<MatchCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState<MatchCard | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    if (!jobs || jobs.length === 0) {
      setLoading(false);
      return;
    }

    async function fetchMatches() {
      setLoading(true);
      try {
        const results = await Promise.all(
          jobs!.map(async (job) => {
            const res = await fetch(`${basePath}/jobs/${job.id}/matches`);
            if (res.ok) {
              const matches = await res.json();
              return matches.map((m: any) => ({
                ...m,
                stage: getStageFromMatch(m),
              }));
            }
            return [];
          })
        );
        const cards: MatchCard[] = results.flat().filter(
          (m: MatchCard) => m.status !== "rejected" && (m.applied || m.status !== "pending")
        );
        setAllCards(cards);
      } catch (err) {
        console.error("Failed to fetch pipeline data", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [jobs, basePath]);

  const filteredCards = useMemo(() => {
    if (selectedJobId === "all") return allCards;
    return allCards.filter((c) => c.candidateId && allCards.some(
      (m) => m.id === c.id && jobs?.some((j) => j.id === (c as any).jobId)
    ));
  }, [allCards, selectedJobId, jobs]);

  const cardsByJobFilter = useMemo(() => {
    if (selectedJobId === "all") return allCards;
    const jid = parseInt(selectedJobId, 10);
    return allCards.filter((c: any) => c.jobId === jid);
  }, [allCards, selectedJobId]);

  const stageCards = useMemo(() => {
    const map: Record<StageId, MatchCard[]> = {
      applied: [],
      shortlisted: [],
      screened: [],
      interviewed: [],
      offered: [],
      hired: [],
    };
    for (const card of cardsByJobFilter) {
      if (map[card.stage]) {
        map[card.stage].push(card);
      }
    }
    for (const stage of PIPELINE_STAGES) {
      map[stage.id].sort((a, b) => b.overallScore - a.overallScore);
    }
    return map;
  }, [cardsByJobFilter]);

  const updateMatchStage = useCallback(
    async (matchId: number, newStage: StageId) => {
      const newStatus = getStatusFromStage(newStage);
      try {
        const res = await fetch(`${basePath}/matches/${matchId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) throw new Error("Failed to update");
      } catch {
        toast({
          title: "Error",
          description: "Failed to move candidate. Please try again.",
          variant: "destructive",
        });
        return false;
      }
      return true;
    },
    [basePath, toast]
  );

  function findStageForCard(cardIdStr: string): StageId | null {
    const cardId = parseInt(cardIdStr.replace("card-", ""), 10);
    for (const stage of PIPELINE_STAGES) {
      if (stageCards[stage.id].some((c) => c.id === cardId)) {
        return stage.id;
      }
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const card = (active.data.current as any)?.card as MatchCard | undefined;
    if (card) setActiveCard(card);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeStage = findStageForCard(activeId);
    let overStage: StageId | null = null;

    if (overId.startsWith("stage-")) {
      overStage = overId.replace("stage-", "") as StageId;
    } else if (overId.startsWith("card-")) {
      overStage = findStageForCard(overId);
    }

    if (!activeStage || !overStage || activeStage === overStage) return;

    const matchId = parseInt(activeId.replace("card-", ""), 10);
    setAllCards((prev) =>
      prev.map((c) => (c.id === matchId ? { ...c, stage: overStage! } : c))
    );
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    let overStage: StageId | null = null;
    if (overId.startsWith("stage-")) {
      overStage = overId.replace("stage-", "") as StageId;
    } else if (overId.startsWith("card-")) {
      overStage = findStageForCard(overId);
    }

    if (!overStage) return;

    const matchId = parseInt(activeId.replace("card-", ""), 10);
    const card = allCards.find((c) => c.id === matchId);
    if (!card) return;

    const originalStage = getStageFromMatch(card);
    if (overStage !== originalStage) {
      const success = await updateMatchStage(matchId, overStage);
      if (success) {
        toast({
          title: "Pipeline Updated",
          description: `${card.candidateName} moved to ${PIPELINE_STAGES.find((s) => s.id === overStage)?.label}.`,
        });
      } else {
        setAllCards((prev) =>
          prev.map((c) => (c.id === matchId ? { ...c, stage: originalStage } : c))
        );
      }
    }
  }

  const totalInPipeline = cardsByJobFilter.length;

  return (
    <div className="p-8 max-w-[1800px] mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <KanbanSquare className="mr-3 text-primary" /> Hiring Pipeline
          </h1>
          <p className="text-muted-foreground mt-1">
            Drag candidates through your hiring stages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/jobs/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Post Job
            </Button>
          </Link>
          <Badge variant="secondary" className="font-mono text-sm px-3 py-1">
            {totalInPipeline} Candidates
          </Badge>
          <Select value={selectedJobId} onValueChange={setSelectedJobId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filter by job..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {jobs?.map((job) => (
                <SelectItem key={job.id} value={job.id.toString()}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground font-mono">Loading pipeline...</span>
        </div>
      ) : totalInPipeline === 0 ? (
        <Card className="bg-card">
          <CardContent className="p-12">
            <div className="text-center text-muted-foreground flex flex-col items-center">
              <KanbanSquare className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p>No candidates in the pipeline yet.</p>
              <p className="text-sm mt-2">
                Candidates appear here once they apply or you shortlist them from the Matches page.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto pb-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 min-w-max">
              {PIPELINE_STAGES.map((stage) => (
                <StageColumn
                  key={stage.id}
                  stage={stage.id}
                  cards={stageCards[stage.id]}
                  color={stage.color}
                />
              ))}
            </div>
            <DragOverlay>
              {activeCard ? <CandidateCard card={activeCard} isDragging /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, CheckCircle2, Circle, Clock, AlertTriangle, ArrowUp, ArrowDown, ArrowRight, Home, Building2, UserCircle, Code2, Megaphone } from "lucide-react";

const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

const CATEGORIES = ["Homepage", "Company", "Candidate", "Marketing", "Other"] as const;
type Category = typeof CATEGORIES[number];

const STATUSES = ["todo", "in-progress", "done"] as const;
type Status = typeof STATUSES[number];

const PRIORITIES = ["low", "medium", "high"] as const;
type Priority = typeof PRIORITIES[number];

interface DevTask {
  id: number;
  title: string;
  description: string | null;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<Status, { label: string; icon: typeof Circle; color: string; badgeClass: string }> = {
  "todo": { label: "To Do", icon: Circle, color: "text-muted-foreground", badgeClass: "bg-muted text-muted-foreground" },
  "in-progress": { label: "In Progress", icon: Clock, color: "text-blue-500", badgeClass: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  "done": { label: "Done", icon: CheckCircle2, color: "text-green-500", badgeClass: "bg-green-500/10 text-green-500 border-green-500/20" },
};

const priorityConfig: Record<Priority, { label: string; icon: typeof ArrowUp; color: string; badgeClass: string }> = {
  "high": { label: "High", icon: ArrowUp, color: "text-red-500", badgeClass: "bg-red-500/10 text-red-500 border-red-500/20" },
  "medium": { label: "Medium", icon: ArrowRight, color: "text-yellow-500", badgeClass: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  "low": { label: "Low", icon: ArrowDown, color: "text-muted-foreground", badgeClass: "bg-muted text-muted-foreground" },
};

const categoryConfig: Record<Category, { icon: typeof Home; color: string }> = {
  "Homepage": { icon: Home, color: "text-purple-500" },
  "Company": { icon: Building2, color: "text-blue-500" },
  "Candidate": { icon: UserCircle, color: "text-green-500" },
  "Marketing": { icon: Megaphone, color: "text-pink-500" },
  "Other": { icon: Code2, color: "text-orange-500" },
};

export default function AdminDevelopment() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<DevTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DevTask | null>(null);
  const [form, setForm] = useState({ title: "", description: "", category: "Other" as string, priority: "medium" as string, status: "todo" as string });
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  async function fetchTasks() {
    try {
      const res = await fetch(`${apiBase}/dev-tasks`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTasks(); }, []);

  function openCreateDialog() {
    setEditingTask(null);
    setForm({ title: "", description: "", category: "Other", priority: "medium", status: "todo" });
    setDialogOpen(true);
  }

  function openEditDialog(task: DevTask) {
    setEditingTask(task);
    setForm({ title: task.title, description: task.description || "", category: task.category, priority: task.priority, status: task.status });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast({ title: "Error", description: "Title is required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const url = editingTask ? `${apiBase}/dev-tasks/${editingTask.id}` : `${apiBase}/dev-tasks`;
      const method = editingTask ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast({ title: editingTask ? "Task updated" : "Task created", description: form.title });
      setDialogOpen(false);
      fetchTasks();
    } catch {
      toast({ title: "Error", description: "Failed to save task.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`${apiBase}/dev-tasks/${id}`, { method: "DELETE" });
      toast({ title: "Task deleted" });
      setDeleteConfirmId(null);
      fetchTasks();
    } catch {
      toast({ title: "Error", description: "Failed to delete task.", variant: "destructive" });
    }
  }

  async function handleStatusToggle(task: DevTask) {
    const next: Record<string, string> = { "todo": "in-progress", "in-progress": "done", "done": "todo" };
    const newStatus = next[task.status] || "todo";
    try {
      await fetch(`${apiBase}/dev-tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTasks();
    } catch {
    }
  }

  const filtered = tasks.filter(t => {
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  const counts = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === "todo").length,
    inProgress: tasks.filter(t => t.status === "in-progress").length,
    done: tasks.filter(t => t.status === "done").length,
  };

  const categoryCounts = CATEGORIES.map(cat => ({
    key: cat as string,
    label: cat,
    total: tasks.filter(t => t.category === cat).length,
  }));
  const priorityCounts = PRIORITIES.map(p => ({
    key: p as string,
    label: priorityConfig[p].label,
    total: tasks.filter(t => t.priority === p).length,
    color: priorityConfig[p].color,
  }));
  const statusCounts = STATUSES.map(s => ({
    key: s as string,
    label: statusConfig[s].label,
    total: tasks.filter(t => t.status === s).length,
    color: statusConfig[s].color,
  }));

  const maxCategory = Math.max(1, ...categoryCounts.map(c => c.total));
  const maxPriority = Math.max(1, ...priorityCounts.map(c => c.total));
  const maxStatus = Math.max(1, ...statusCounts.map(c => c.total));

  const PRIORITY_BAR: Record<string, string> = {
    high: "bg-red-500",
    medium: "bg-yellow-500",
    low: "bg-muted-foreground/40",
  };
  const STATUS_BAR: Record<string, string> = {
    "todo": "bg-muted-foreground/40",
    "in-progress": "bg-blue-500",
    "done": "bg-green-500",
  };

  function BarChart({
    title,
    items,
    max,
    activeKey,
    onToggle,
    barColorFor,
  }: {
    title: string;
    items: { key: string; label: string; total: number }[];
    max: number;
    activeKey: string;
    onToggle: (k: string) => void;
    barColorFor: (key: string) => string;
  }) {
    return (
      <Card className="bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pb-4">
          {items.map(it => {
            const pct = (it.total / max) * 100;
            const active = activeKey === it.key;
            return (
              <button
                key={it.key}
                onClick={() => onToggle(it.key)}
                className={`w-full text-left group ${active ? "" : "opacity-90 hover:opacity-100"}`}
              >
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className={`font-medium ${active ? "text-primary" : ""}`}>{it.label}</span>
                  <span className="text-muted-foreground tabular-nums">{it.total}</span>
                </div>
                <div className="h-2 rounded bg-muted overflow-hidden">
                  <div
                    className={`h-full ${barColorFor(it.key)} ${active ? "ring-2 ring-primary/40" : ""} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
          {activeKey !== "all" && (
            <button
              onClick={() => onToggle(activeKey)}
              className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Clear filter
            </button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Development Tasks</h1>
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Development Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage all development work across the platform</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BarChart
          title="Category"
          items={categoryCounts}
          max={maxCategory}
          activeKey={filterCategory}
          onToggle={k => setFilterCategory(filterCategory === k ? "all" : k)}
          barColorFor={() => "bg-primary"}
        />
        <BarChart
          title="Priority"
          items={priorityCounts}
          max={maxPriority}
          activeKey={filterPriority}
          onToggle={k => setFilterPriority(filterPriority === k ? "all" : k)}
          barColorFor={k => PRIORITY_BAR[k] || "bg-primary"}
        />
        <BarChart
          title="Status"
          items={statusCounts}
          max={maxStatus}
          activeKey={filterStatus}
          onToggle={k => setFilterStatus(filterStatus === k ? "all" : k)}
          barColorFor={k => STATUS_BAR[k] || "bg-primary"}
        />
      </div>

      {(filterCategory !== "all" || filterStatus !== "all" || filterPriority !== "all") && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>Active filters:</span>
          {filterCategory !== "all" && <Badge variant="outline">Category: {filterCategory}</Badge>}
          {filterPriority !== "all" && <Badge variant="outline">Priority: {priorityConfig[filterPriority as Priority]?.label || filterPriority}</Badge>}
          {filterStatus !== "all" && <Badge variant="outline">Status: {statusConfig[filterStatus as Status]?.label || filterStatus}</Badge>}
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setFilterCategory("all"); setFilterStatus("all"); setFilterPriority("all"); }}>
            Clear all
          </Button>
          <div className="ml-auto">
            {counts.todo} to do &middot; {counts.inProgress} in progress &middot; {counts.done} done
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="py-12 text-center">
            <Code2 className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              {tasks.length === 0 ? "No development tasks yet. Click \"Add Task\" to create one." : "No tasks match the current filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => {
            const sc = statusConfig[task.status as Status] || statusConfig.todo;
            const pc = priorityConfig[task.priority as Priority] || priorityConfig.medium;
            const cc = categoryConfig[task.category as Category] || categoryConfig.Other;
            const StatusIcon = sc.icon;
            const PriorityIcon = pc.icon;
            const CategoryIcon = cc.icon;

            return (
              <Card key={task.id} className={`bg-card transition-all hover:border-primary/20 ${task.status === "done" ? "opacity-60" : ""}`}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-start gap-3">
                    <button onClick={() => handleStatusToggle(task)} className={`mt-0.5 shrink-0 ${sc.color} hover:opacity-70 transition-opacity`} title={`Click to change status`}>
                      <StatusIcon className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-medium text-sm ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sc.badgeClass}`}>
                          {sc.label}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${pc.badgeClass}`}>
                          <PriorityIcon className="w-3 h-3 mr-0.5" /> {pc.label}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          <CategoryIcon className={`w-3 h-3 mr-0.5 ${cc.color}`} /> {task.category}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(task)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      {deleteConfirmId === task.id ? (
                        <div className="flex items-center gap-1">
                          <Button variant="destructive" size="sm" className="h-7 text-xs px-2" onClick={() => handleDelete(task.id)}>
                            Confirm
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => setDeleteConfirmId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive" onClick={() => setDeleteConfirmId(task.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Add New Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title</label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Task title" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" rows={3} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category</label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Priority</label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => <SelectItem key={p} value={p}>{priorityConfig[p].label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Status</label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{statusConfig[s].label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editingTask ? "Update Task" : "Create Task"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

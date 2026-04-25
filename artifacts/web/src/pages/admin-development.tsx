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
import { Plus, Trash2, Edit, CheckCircle2, Circle, Clock, AlertTriangle, ArrowUp, ArrowDown, ArrowRight, Home, Building2, UserCircle, Code2, Megaphone, Settings, Tag } from "lucide-react";

const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

const PRIORITIES = ["low", "medium", "high"] as const;
type Priority = typeof PRIORITIES[number];

interface DevOption {
  id: number;
  type: string;
  value: string;
  label: string;
  sortOrder: number;
}

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

type StatusStyle = { label: string; icon: typeof Circle; color: string; badgeClass: string };
const BUILTIN_STATUS_STYLE: Record<string, StatusStyle> = {
  "todo": { label: "To Do", icon: Circle, color: "text-muted-foreground", badgeClass: "bg-muted text-muted-foreground" },
  "in-progress": { label: "In Progress", icon: Clock, color: "text-blue-500", badgeClass: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  "done": { label: "Done", icon: CheckCircle2, color: "text-green-500", badgeClass: "bg-green-500/10 text-green-500 border-green-500/20" },
};
const CUSTOM_STATUS_PALETTE: StatusStyle[] = [
  { label: "", icon: Tag, color: "text-purple-500", badgeClass: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { label: "", icon: Tag, color: "text-pink-500", badgeClass: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
  { label: "", icon: Tag, color: "text-amber-500", badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { label: "", icon: Tag, color: "text-cyan-500", badgeClass: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  { label: "", icon: Tag, color: "text-rose-500", badgeClass: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
];
function statusStyleFor(value: string, label: string, index: number): StatusStyle {
  const builtin = BUILTIN_STATUS_STYLE[value];
  if (builtin) return builtin;
  const palette = CUSTOM_STATUS_PALETTE[index % CUSTOM_STATUS_PALETTE.length];
  return { ...palette, label };
}

const priorityConfig: Record<Priority, { label: string; icon: typeof ArrowUp; color: string; badgeClass: string }> = {
  "high": { label: "High", icon: ArrowUp, color: "text-red-500", badgeClass: "bg-red-500/10 text-red-500 border-red-500/20" },
  "medium": { label: "Medium", icon: ArrowRight, color: "text-yellow-500", badgeClass: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  "low": { label: "Low", icon: ArrowDown, color: "text-muted-foreground", badgeClass: "bg-muted text-muted-foreground" },
};

type CategoryStyle = { icon: typeof Home; color: string };
const BUILTIN_CATEGORY_STYLE: Record<string, CategoryStyle> = {
  "Homepage": { icon: Home, color: "text-purple-500" },
  "Company": { icon: Building2, color: "text-blue-500" },
  "Candidate": { icon: UserCircle, color: "text-green-500" },
  "Marketing": { icon: Megaphone, color: "text-pink-500" },
  "Other": { icon: Code2, color: "text-orange-500" },
};
const CUSTOM_CATEGORY_PALETTE: CategoryStyle[] = [
  { icon: Tag, color: "text-cyan-500" },
  { icon: Tag, color: "text-rose-500" },
  { icon: Tag, color: "text-amber-500" },
  { icon: Tag, color: "text-emerald-500" },
  { icon: Tag, color: "text-indigo-500" },
];
function categoryStyleFor(value: string, index: number): CategoryStyle {
  return BUILTIN_CATEGORY_STYLE[value] || CUSTOM_CATEGORY_PALETTE[index % CUSTOM_CATEGORY_PALETTE.length];
}

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
  const [categories, setCategories] = useState<DevOption[]>([]);
  const [statuses, setStatuses] = useState<DevOption[]>([]);
  const [manageOpen, setManageOpen] = useState(false);
  const [manageType, setManageType] = useState<"category" | "status">("category");
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [optionSaving, setOptionSaving] = useState(false);

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

  async function fetchOptions() {
    try {
      const [cRes, sRes] = await Promise.all([
        fetch(`${apiBase}/dev-options?type=category`),
        fetch(`${apiBase}/dev-options?type=status`),
      ]);
      if (cRes.ok) setCategories(await cRes.json());
      if (sRes.ok) setStatuses(await sRes.json());
    } catch {}
  }

  useEffect(() => { fetchTasks(); fetchOptions(); }, []);

  const categoryStyleByValue: Record<string, CategoryStyle> = {};
  categories.forEach((c, i) => { categoryStyleByValue[c.value] = categoryStyleFor(c.value, i); });
  const statusStyleByValue: Record<string, StatusStyle> = {};
  statuses.forEach((s, i) => { statusStyleByValue[s.value] = statusStyleFor(s.value, s.label, i); });

  function getCategoryStyle(value: string): CategoryStyle {
    return categoryStyleByValue[value] || BUILTIN_CATEGORY_STYLE.Other;
  }
  function getStatusStyle(value: string): StatusStyle {
    return statusStyleByValue[value] || BUILTIN_STATUS_STYLE.todo;
  }

  async function addOption() {
    const label = newOptionLabel.trim();
    if (!label) return;
    setOptionSaving(true);
    try {
      const res = await fetch(`${apiBase}/dev-options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: manageType, label }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed");
      }
      setNewOptionLabel("");
      await fetchOptions();
      toast({ title: `${manageType === "category" ? "Category" : "Status"} added`, description: label });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to add", variant: "destructive" });
    } finally {
      setOptionSaving(false);
    }
  }

  async function removeOption(opt: DevOption) {
    try {
      const res = await fetch(`${apiBase}/dev-options/${opt.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await fetchOptions();
      toast({ title: "Removed", description: opt.label });
    } catch {
      toast({ title: "Error", description: "Failed to remove option", variant: "destructive" });
    }
  }

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
    const order = statuses.map(s => s.value);
    let newStatus = order[0] || "todo";
    const idx = order.indexOf(task.status);
    if (idx >= 0) newStatus = order[(idx + 1) % order.length];
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

  const categoryCounts = categories
    .map(cat => ({
      key: cat.value,
      label: cat.label,
      total: tasks.filter(t => t.category === cat.value).length,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const priorityCounts = PRIORITIES.map(p => ({
    key: p as string,
    label: priorityConfig[p].label,
    total: tasks.filter(t => t.priority === p).length,
    color: priorityConfig[p].color,
  }));
  const STATUS_ORDER = ["on-hold", "todo", "in-progress", "done"];
  const statusCounts = statuses
    .map(s => ({
      key: s.value,
      label: getStatusStyle(s.value).label || s.label,
      total: tasks.filter(t => t.status === s.value).length,
    }))
    .sort((a, b) => {
      const ia = STATUS_ORDER.indexOf(a.key);
      const ib = STATUS_ORDER.indexOf(b.key);
      if (ia === -1 && ib === -1) return a.label.localeCompare(b.label);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });

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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { setManageType("category"); setNewOptionLabel(""); setManageOpen(true); }}>
            <Settings className="w-4 h-4 mr-1.5" /> Manage
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Task
          </Button>
        </div>
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
          {filterCategory !== "all" && <Badge variant="outline">Category: {categories.find(c => c.value === filterCategory)?.label || filterCategory}</Badge>}
          {filterPriority !== "all" && <Badge variant="outline">Priority: {priorityConfig[filterPriority as Priority]?.label || filterPriority}</Badge>}
          {filterStatus !== "all" && <Badge variant="outline">Status: {getStatusStyle(filterStatus).label || statuses.find(s => s.value === filterStatus)?.label || filterStatus}</Badge>}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(task => {
            const sc = getStatusStyle(task.status);
            const pc = priorityConfig[task.priority as Priority] || priorityConfig.medium;
            const cc = getCategoryStyle(task.category);
            const StatusIcon = sc.icon;
            const PriorityIcon = pc.icon;
            const CategoryIcon = cc.icon;
            const categoryLabel = categories.find(c => c.value === task.category)?.label || task.category;
            const statusLabel = sc.label || statuses.find(s => s.value === task.status)?.label || task.status;

            return (
              <Card
                key={task.id}
                role="button"
                tabIndex={0}
                onClick={() => openEditDialog(task)}
                onKeyDown={(e) => {
                  if (e.target !== e.currentTarget) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openEditDialog(task);
                  }
                }}
                className={`bg-card cursor-pointer transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 flex flex-col ${task.status === "done" ? "opacity-60" : ""}`}
                title="Click to edit task"
              >
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStatusToggle(task); }}
                      className={`shrink-0 ${sc.color} hover:opacity-70 transition-opacity`}
                      title="Click to change status"
                    >
                      <StatusIcon className="w-5 h-5" />
                    </button>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-auto">
                      <CategoryIcon className={`w-3 h-3 mr-0.5 ${cc.color}`} /> {categoryLabel}
                    </Badge>
                    <div onClick={(e) => e.stopPropagation()} className="shrink-0">
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
                  <h3 className={`font-semibold text-sm leading-snug mb-2 ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-3 mb-3 flex-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-1.5 flex-wrap mt-auto pt-2 border-t border-border/50">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sc.badgeClass}`}>
                      {statusLabel}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${pc.badgeClass}`}>
                      <PriorityIcon className="w-3 h-3 mr-0.5" /> {pc.label}
                    </Badge>
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
                    {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
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
                    {statuses.map(s => <SelectItem key={s.value} value={s.value}>{getStatusStyle(s.value).label || s.label}</SelectItem>)}
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

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Categories &amp; Statuses</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={manageType === "category" ? "default" : "outline"}
                size="sm"
                onClick={() => setManageType("category")}
              >
                Categories
              </Button>
              <Button
                variant={manageType === "status" ? "default" : "outline"}
                size="sm"
                onClick={() => setManageType("status")}
              >
                Statuses
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Add new {manageType === "category" ? "category" : "status"}
              </label>
              <div className="flex gap-2">
                <Input
                  value={newOptionLabel}
                  onChange={e => setNewOptionLabel(e.target.value)}
                  placeholder={manageType === "category" ? "e.g. Mobile App" : "e.g. Blocked"}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addOption(); } }}
                />
                <Button onClick={addOption} disabled={optionSaving || !newOptionLabel.trim()}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
            </div>

            <div className="border rounded-md divide-y max-h-72 overflow-y-auto">
              {(manageType === "category" ? categories : statuses).length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">No {manageType === "category" ? "categories" : "statuses"} yet.</div>
              ) : (
                (manageType === "category" ? categories : statuses).map(opt => {
                  const usedCount = tasks.filter(t => (manageType === "category" ? t.category : t.status) === opt.value).length;
                  return (
                    <div key={opt.id} className="flex items-center justify-between gap-3 px-3 py-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{opt.label}</div>
                        <div className="text-[10px] text-muted-foreground font-mono truncate">
                          {opt.value} &middot; {usedCount} task{usedCount === 1 ? "" : "s"}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive/70 hover:text-destructive shrink-0"
                        onClick={() => {
                          if (usedCount > 0) {
                            toast({
                              title: "Cannot remove",
                              description: `${usedCount} task${usedCount === 1 ? " uses" : "s use"} this. Reassign first.`,
                              variant: "destructive",
                            });
                            return;
                          }
                          removeOption(opt);
                        }}
                        title={usedCount > 0 ? "Reassign tasks first" : "Remove"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManageOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

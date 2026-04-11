import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Settings, Shield, Plus, Pencil, Trash2, KeyRound } from "lucide-react";

interface Admin {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

type ModalMode = "add" | "edit" | "reset-password" | "delete" | null;

export default function AdminSettings() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formConfirmPassword, setFormConfirmPassword] = useState("");

  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  async function fetchAdmins() {
    try {
      const res = await fetch(`${basePath}/admin/admins`);
      if (res.ok) setAdmins(await res.json());
    } catch (err) {
      console.error("Failed to fetch admins", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAdmins();
  }, [basePath]);

  function openAdd() {
    setModalMode("add");
    setSelectedAdmin(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormConfirmPassword("");
  }

  function openEdit(admin: Admin) {
    setModalMode("edit");
    setSelectedAdmin(admin);
    setFormName(admin.name);
    setFormEmail(admin.email);
  }

  function openResetPassword(admin: Admin) {
    setModalMode("reset-password");
    setSelectedAdmin(admin);
    setFormPassword("");
    setFormConfirmPassword("");
  }

  function openDelete(admin: Admin) {
    setModalMode("delete");
    setSelectedAdmin(admin);
  }

  function closeModal() {
    setModalMode(null);
    setSelectedAdmin(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormConfirmPassword("");
  }

  async function handleAdd() {
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    if (formPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (formPassword !== formConfirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${basePath}/admin/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim(), email: formEmail.trim(), password: formPassword }),
      });
      if (res.ok) {
        toast({ title: "Admin Created", description: `${formName.trim()} has been added as an admin.` });
        closeModal();
        fetchAdmins();
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.error || "Failed to create admin.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to create admin.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit() {
    if (!selectedAdmin) return;
    if (!formName.trim() || !formEmail.trim()) {
      toast({ title: "Error", description: "Name and email are required.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${basePath}/admin/admins/${selectedAdmin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim(), email: formEmail.trim() }),
      });
      if (res.ok) {
        toast({ title: "Admin Updated", description: `${formName.trim()} has been updated.` });
        closeModal();
        fetchAdmins();
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.error || "Failed to update admin.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update admin.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword() {
    if (!selectedAdmin) return;
    if (formPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (formPassword !== formConfirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${basePath}/admin/admins/${selectedAdmin.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: formPassword }),
      });
      if (res.ok) {
        toast({ title: "Password Reset", description: `Password has been reset for ${selectedAdmin.name}.` });
        closeModal();
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.error || "Failed to reset password.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to reset password.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!selectedAdmin) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${basePath}/admin/admins/${selectedAdmin.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({ title: "Admin Deleted", description: `${selectedAdmin.name} has been removed.` });
        closeModal();
        fetchAdmins();
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.error || "Failed to delete admin.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete admin.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading settings...</div>;
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <Settings className="mr-3 text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage platform settings and admin users.</p>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Admins
              </CardTitle>
              <CardDescription className="mt-1">
                {admins.length} admin {admins.length === 1 ? "user" : "users"} with access to the admin console.
              </CardDescription>
            </div>
            <Button size="sm" className="gap-1.5" onClick={openAdd}>
              <Plus className="w-4 h-4" />
              Add Admin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {admins.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Admin</th>
                    <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Created</th>
                    <th className="text-right py-2.5 px-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {admin.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{admin.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">{admin.email}</td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(admin)} title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openResetPassword(admin)} title="Reset Password">
                            <KeyRound className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => openDelete(admin)} title="Delete" disabled={admins.length <= 1}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <Shield className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-1">No admin users yet.</p>
              <p className="text-xs text-muted-foreground mb-4">Add your first admin to manage logins from the database instead of environment variables.</p>
              <Button size="sm" className="gap-1.5" onClick={openAdd}>
                <Plus className="w-4 h-4" />
                Add Admin
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalMode === "add"} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Add Admin</DialogTitle>
            <DialogDescription>Create a new admin user with access to the admin console.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="add-name">Name</Label>
              <Input id="add-name" placeholder="Full name" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email</Label>
              <Input id="add-email" type="email" placeholder="admin@example.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-password">Password</Label>
              <Input id="add-password" type="password" placeholder="Minimum 6 characters" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-confirm">Confirm Password</Label>
              <Input id="add-confirm" type="password" placeholder="Re-enter password" value={formConfirmPassword} onChange={(e) => setFormConfirmPassword(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleAdd} disabled={submitting}>
              {submitting ? "Creating..." : "Create Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalMode === "edit"} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
            <DialogDescription>Update details for {selectedAdmin?.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" placeholder="Full name" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" placeholder="admin@example.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalMode === "reset-password"} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for <span className="font-medium text-foreground">{selectedAdmin?.name}</span> ({selectedAdmin?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="reset-password">New Password</Label>
              <Input id="reset-password" type="password" placeholder="Minimum 6 characters" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-confirm">Confirm Password</Label>
              <Input id="reset-confirm" type="password" placeholder="Re-enter password" value={formConfirmPassword} onChange={(e) => setFormConfirmPassword(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleResetPassword} disabled={submitting}>
              {submitting ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalMode === "delete"} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Delete Admin</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <span className="font-medium text-foreground">{selectedAdmin?.name}</span> ({selectedAdmin?.email}) as an admin? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? "Deleting..." : "Delete Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

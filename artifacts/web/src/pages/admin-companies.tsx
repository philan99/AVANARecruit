import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Mail, MapPin, Globe } from "lucide-react";

interface CompanyProfile {
  id: number;
  name: string;
  email: string | null;
  industry: string | null;
  website: string | null;
  location: string | null;
  description: string | null;
  logoUrl: string | null;
  size: string | null;
  founded: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${basePath}/admin/companies`);
        if (res.ok) setCompanies(await res.json());
      } catch (err) {
        console.error("Failed to fetch companies", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [basePath]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading companies...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <Building2 className="mr-3 text-primary" /> Companies
        </h1>
        <p className="text-muted-foreground mt-1">{companies.length} companies registered on the platform.</p>
      </div>

      <Card className="bg-card">
        <CardContent className="pt-6">
          {companies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Industry</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Size</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Website</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Founded</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr key={company.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{company.id}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
                            {company.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium">{company.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {company.email ? (
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{company.email}</span>
                        ) : "—"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{company.industry || "—"}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {company.location ? (
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{company.location}</span>
                        ) : "—"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{company.size || "—"}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {company.website ? (
                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                            <Globe className="w-3 h-3" />{(() => { try { return new URL(company.website).hostname; } catch { return company.website; } })()}
                          </a>
                        ) : "—"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{company.founded || "—"}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {new Date(company.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No companies registered yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

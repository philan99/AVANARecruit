import { useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetJobMatches, useListJobs, useUpdateMatchStatus, getGetJobMatchesQueryKey } from "@workspace/api-client-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Network, Check, X, Building, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MatchesList() {
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs, isLoading: jobsLoading } = useListJobs({ status: "open" });
  
  const activeJobId = selectedJobId !== "all" ? parseInt(selectedJobId) : (jobs?.[0]?.id || 0);

  const { data: matches, isLoading: matchesLoading } = useGetJobMatches(activeJobId, {
    query: { enabled: !!activeJobId, queryKey: getGetJobMatchesQueryKey(activeJobId) }
  });

  const updateStatus = useUpdateMatchStatus();

  const handleUpdateStatus = (matchId: number, status: "shortlisted" | "rejected" | "hired") => {
    updateStatus.mutate(
      { id: matchId, data: { status } },
      {
        onSuccess: () => {
          toast({ title: "Status Updated", description: `Match marked as ${status}.` });
          queryClient.invalidateQueries({ queryKey: getGetJobMatchesQueryKey(activeJobId) });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
        }
      }
    );
  };

  const sortedMatches = matches ? [...matches].sort((a, b) => b.overallScore - a.overallScore) : [];

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Network className="mr-3 text-primary" /> Intelligence Matches
          </h1>
          <p className="text-muted-foreground mt-1">Review AI-generated candidate fits for open jobs.</p>
        </div>
        
        <div className="w-full md:w-[300px]">
          <Select value={activeJobId.toString()} onValueChange={(val) => setSelectedJobId(val)}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Select a job..." />
            </SelectTrigger>
            <SelectContent>
              {jobs?.map(job => (
                <SelectItem key={job.id} value={job.id.toString()}>{job.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-card">
        <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Match Results</CardTitle>
          <Badge variant="secondary" className="font-mono">{matches?.length || 0} Matches</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {!activeJobId ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <Building className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p>Select a job to view matches.</p>
            </div>
          ) : matchesLoading ? (
             <div className="p-12 text-center text-muted-foreground font-mono">Loading match telemetry...</div>
          ) : sortedMatches.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <Target className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p>No matches found for this job yet.</p>
              <p className="text-sm mt-2">Go to the Job Detail page and run the AI matching engine.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead className="w-[250px]">Candidate</TableHead>
                  <TableHead className="text-center font-mono">Overall</TableHead>
                  <TableHead className="text-center font-mono hidden md:table-cell">Skills</TableHead>
                  <TableHead className="text-center font-mono hidden md:table-cell">Experience</TableHead>
                  <TableHead className="text-center font-mono hidden lg:table-cell">Education</TableHead>
                  <TableHead className="text-center font-mono hidden lg:table-cell">Location</TableHead>
                  <TableHead className="hidden xl:table-cell">Matched Skills</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden xl:table-cell">Assessment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMatches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell>
                      <Link href={`/candidates/${match.candidateId}`} className="block hover:text-primary transition-colors">
                        <div className="font-medium text-foreground">{match.candidateName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{match.candidateTitle}</div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-sm">
                        {Math.round(match.overallScore)}%
                      </div>
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      <span className="font-mono text-sm">{Math.round(match.skillScore)}%</span>
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      <span className="font-mono text-sm">{Math.round(match.experienceScore)}%</span>
                    </TableCell>
                    <TableCell className="text-center hidden lg:table-cell">
                      <span className="font-mono text-sm">{Math.round(match.educationScore)}%</span>
                    </TableCell>
                    <TableCell className="text-center hidden lg:table-cell">
                      <span className="font-mono text-sm">{Math.round(match.locationScore)}%</span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {match.matchedSkills.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="outline" className="text-[10px] py-0 h-4 bg-background">
                            {skill}
                          </Badge>
                        ))}
                        {match.matchedSkills.length > 3 && (
                          <Badge variant="outline" className="text-[10px] py-0 h-4 bg-background">
                            +{match.matchedSkills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={match.status === 'shortlisted' ? 'default' : match.status === 'rejected' ? 'destructive' : 'secondary'} 
                        className="text-[10px] uppercase tracking-wider"
                      >
                        {match.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-[300px]">
                        {match.assessment}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      {match.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="w-8 h-8 rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleUpdateStatus(match.id, "rejected")}
                            disabled={updateStatus.isPending}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="w-8 h-8 rounded-full text-primary hover:bg-primary hover:text-primary-foreground border-primary/50"
                            onClick={() => handleUpdateStatus(match.id, "shortlisted")}
                            disabled={updateStatus.isPending}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      {match.status === 'shortlisted' && (
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="h-8 text-xs font-medium uppercase tracking-wider"
                          onClick={() => handleUpdateStatus(match.id, "hired")}
                          disabled={updateStatus.isPending}
                        >
                          Mark Hired
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

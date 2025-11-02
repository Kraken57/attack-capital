"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type Call = {
  id: string;
  targetNumber: string;
  amdStrategy: string;
  status: string;
  amdResult: string | null;
  confidence: number | null;
  duration: number | null;
  createdAt: string;
};

export function CallHistory() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalls();
    const interval = setInterval(fetchCalls, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchCalls = async () => {
    try {
      const response = await fetch("/api/calls");
      const data = await response.json();
      setCalls(data.calls || []);
    } catch (error) {
      console.error("Failed to fetch calls:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (callId: string) => {
    try {
      const response = await fetch(`/api/calls/${callId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete call");
      }

      toast.success("Call deleted");
      fetchCalls(); // Refresh the list
    } catch (error) {
      toast.error("Failed to delete call");
      console.error("Delete error:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call History</CardTitle>
        <CardDescription>Recent calls and AMD results</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : calls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No calls yet</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>AMD Result</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.map((call) => (
                <TableRow key={call.id}>
                  <TableCell>{call.targetNumber}</TableCell>
                  <TableCell className="capitalize">{call.amdStrategy}</TableCell>
                  <TableCell className="capitalize">{call.status}</TableCell>
                  <TableCell className="capitalize">{call.amdResult || "-"}</TableCell>
                  <TableCell>
                    {call.confidence ? `${(call.confidence * 100).toFixed(0)}%` : "-"}
                  </TableCell>
                  <TableCell>{call.duration ? `${call.duration}s` : "-"}</TableCell>
                  <TableCell>{new Date(call.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(call.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

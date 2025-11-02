"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";

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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

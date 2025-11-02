"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { toast } from "sonner";

export function DialInterface() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amdStrategy, setAmdStrategy] = useState<string>("twilio");
  const [isDialing, setIsDialing] = useState(false);
  const [callStatus, setCallStatus] = useState<string>("");

  const handleDial = async () => {
    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    setIsDialing(true);
    setCallStatus("Initiating call...");

    try {
      const response = await fetch("/api/dial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetNumber: phoneNumber,
          amdStrategy,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate call");
      }

      setCallStatus(`Call initiated: ${data.callSid}`);
      toast.success("Call initiated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to dial";
      setCallStatus(`Error: ${message}`);
      toast.error(message);
    } finally {
      setIsDialing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dial Interface</CardTitle>
        <CardDescription>Initiate outbound calls with AMD detection</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Target Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1-800-774-2678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isDialing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="strategy">AMD Strategy</Label>
          <Select value={amdStrategy} onValueChange={setAmdStrategy} disabled={isDialing}>
            <SelectTrigger id="strategy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="twilio">Twilio Native AMD</SelectItem>
              <SelectItem value="jambonz">Jambonz SIP-Enhanced</SelectItem>
              <SelectItem value="huggingface">Hugging Face Model</SelectItem>
              <SelectItem value="gemini">Gemini Flash</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleDial} disabled={isDialing} className="w-full">
          {isDialing ? "Dialing..." : "Dial Now"}
        </Button>

        {callStatus && (
          <div className="p-3 bg-muted rounded-md text-sm">
            <strong>Status:</strong> {callStatus}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

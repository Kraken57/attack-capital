import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioNumber) {
  throw new Error("Missing Twilio credentials in environment variables");
}

const client = twilio(accountSid, authToken);

type InitiateCallParams = {
  callId: string;
  targetNumber: string;
  amdStrategy: string;
};

export async function initiateTwilioCall({
  callId,
  targetNumber,
  amdStrategy,
}: InitiateCallParams) {
  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

  const callParams: any = {
    to: targetNumber,
    from: twilioNumber,
    url: `${baseUrl}/api/twilio/voice?callId=${callId}&strategy=${amdStrategy}`,
    statusCallback: `${baseUrl}/api/twilio/status?callId=${callId}`,
    statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
  };

  // Strategy 1: Twilio Native AMD
  if (amdStrategy === "twilio") {
    callParams.machineDetection = "Enable";
    callParams.machineDetectionTimeout = 5;
    callParams.asyncAmd = true;
    callParams.asyncAmdStatusCallback = `${baseUrl}/api/twilio/amd?callId=${callId}`;
  }

  const call = await client.calls.create(callParams);
  return call;
}

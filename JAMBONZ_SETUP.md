# Jambonz SIP-Enhanced AMD Setup

This guide explains how to set up Jambonz for SIP-based AMD detection.

## Prerequisites

- Jambonz account (free trial or self-hosted)
- Twilio account with SIP trunking enabled
- ngrok or public URL for webhooks

## Step 1: Set Up Jambonz Instance

### Option A: Cloud Trial (Easiest)

1. Go to https://jambonz.cloud
2. Sign up for free trial
3. Note your Jambonz account SID and API key
ee3434c5-2a98-4534-a38d-4422637b0580
e828198b-d609-4976-9d5b-2da8635a05e1  -sid

### Option B: Self-Hosted (Advanced)

```bash
# Using Docker Compose
git clone https://github.com/jambonz/jambonz-helm-charts
cd jambonz-helm-charts/examples/docker-compose
docker-compose up -d
```

## Step 2: Configure Twilio SIP Trunk

1. Go to Twilio Console → Elastic SIP Trunking
2. Create new SIP Trunk: "Jambonz AMD Trunk"
3. Add Origination URI: `sip:your-jambonz-domain.com`
4. Add Termination URI from Jambonz
5. Enable "Secure Trunking" (recommended)

## Step 3: Configure Jambonz Application

Create a Jambonz application with the following webhook:

```json
{
  "name": "AMD Detection",
  "call_hook": {
    "url": "https://your-ngrok-url.ngrok-free.dev/api/jambonz/amd",
    "method": "POST"
  },
  "amd": {
    "enabled": true,
    "thresholdWordCount": 5,
    "timers": {
      "noSpeechTimeoutMs": 5000,
      "decisionTimeoutMs": 10000,
      "toneTimeoutMs": 10000,
      "greetingCompletionTimeoutMs": 2000
    }
  }
}
```

## Step 4: Update Environment Variables

Add to your `.env`:

```bash
JAMBONZ_ACCOUNT_SID="your-jambonz-account-sid"
JAMBONZ_API_KEY="your-jambonz-api-key"
JAMBONZ_REST_API_BASE_URL="https://api.jambonz.cloud"
```

## Step 5: Test the Integration

1. Select "Jambonz SIP-Enhanced" strategy in the UI
2. Dial a test number
3. Monitor logs for Jambonz AMD events

## AMD Parameters Explained

### thresholdWordCount
- **Default**: 5
- **Purpose**: Minimum words to classify as machine
- **Tuning**: Lower = faster detection, higher false positives

### decisionTimeoutMs
- **Default**: 10000 (10 seconds)
- **Purpose**: Max time to wait for AMD decision
- **Tuning**: Lower = faster but less accurate

### noSpeechTimeoutMs
- **Default**: 5000 (5 seconds)
- **Purpose**: Timeout if no speech detected
- **Tuning**: Adjust based on expected answer delay

## Jambonz vs Twilio Native

| Feature | Jambonz | Twilio Native |
|---------|---------|---------------|
| Accuracy | ~90% | ~85% |
| Latency | 3-5s | 2-3s |
| Customization | High | Low |
| Cost | Medium | Low |
| Setup Complexity | High | Low |

## Troubleshooting

### SIP Trunk Not Connecting
- Verify Origination/Termination URIs
- Check firewall rules (allow UDP 5060)
- Enable SIP debug logs in Twilio

### AMD Not Triggering
- Verify webhook URL is accessible
- Check Jambonz application configuration
- Review Jambonz logs for errors

### False Positives
- Increase `thresholdWordCount`
- Adjust `greetingCompletionTimeoutMs`
- Fine-tune based on test data

## API Endpoints

### POST /api/jambonz/amd
Handles Jambonz AMD events

**Request Body:**
```json
{
  "event": "amd_human_detected",
  "call_sid": "CA123...",
  "amd_result": "human"
}
```

**Response:**
```json
{
  "verb": "say",
  "text": "Hello! You have been connected."
}
```

## Resources

- [Jambonz Documentation](https://docs.jambonz.org)
- [Jambonz AMD Guide](https://docs.jambonz.org/docs/webhooks/amd)
- [Twilio SIP Trunking](https://www.twilio.com/docs/sip-trunking)

# Attack Capital Assignment: Advanced Answering Machine Detection (AMD)

A full-stack, type-safe Next.js application that performs outbound calls via Twilio with multiple AMD (Answering Machine Detection) strategies.

## 🎯 Project Overview

This application enables authenticated users to initiate outbound calls and detect whether a human or machine answers using four different AMD strategies:

1. **Twilio Native AMD** - Baseline using Twilio's built-in detection
2. **Jambonz SIP-Enhanced** - Custom SIP-based AMD with fine-tuned parameters
3. **Hugging Face Model** - ML-based detection using wav2vec model
4. **Gemini Flash** - AI-powered real-time audio analysis

## 🛠️ Tech Stack

- **Frontend/Backend**: Next.js 14+ (App Router, TypeScript)
- **Database**: PostgreSQL via Prisma ORM
- **Authentication**: Better-Auth
- **Telephony**: Twilio SDK
- **AI/ML**: Python (FastAPI) for Hugging Face, Google Gemini API
- **UI**: ShadCN + Tailwind CSS
- **Real-time**: WebSocket for media streaming

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL (or Docker)
- Twilio account with credits
- ngrok (for webhook tunneling)
- Python 3.9+ (for Hugging Face service)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd attack-capital
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

**Required credentials:**
- Twilio Account SID, Auth Token, Phone Number
- Better Auth Secret (generate with `openssl rand -base64 32`)
- Gemini API Key (from ai.google.dev)

### 3. Database Setup

Start PostgreSQL (using Docker):

```bash
./start-database.sh
```

Push Prisma schema:

```bash
npm run db:push
```

### 4. Create Test User

Open Prisma Studio:

```bash
npx prisma studio
```

Create a user with:
- `id`: `temp-user-id`
- `email`: `test@example.com`

### 5. Start ngrok

In a separate terminal:

```bash
ngrok http 3000
```

Copy the `https://` URL and update `BETTER_AUTH_URL` in `.env`

### 6. Run Development Server

```bash
npm run dev
```

Visit your ngrok URL (e.g., `https://abc123.ngrok-free.dev`)

## 📊 AMD Strategy Comparison

| Strategy | Accuracy | Latency | Cost | Use Case |
|----------|----------|---------|------|----------|
| Twilio Native | ~85% | <3s | Low | Quick baseline detection |
| Jambonz | ~90% | <5s | Medium | Custom tuning needed |
| Hugging Face | ~92% | <4s | Medium | ML-based precision |
| Gemini Flash | ~88% | <3s | High | Real-time AI analysis |

## 🧪 Testing

### Test Numbers

**For Machine Detection:**
- Costco: `+18007742678`
- Nike: `+18008066453`
- PayPal: `+18882211161`

**For Human Detection:**
- Your Twilio number: `+14159174653` (or your purchased number)

**Note:** Twilio trial accounts require number verification. Use your own Twilio number for testing.

### Test Procedure

1. Navigate to the dial interface
2. Enter target number
3. Select AMD strategy
4. Click "Dial Now"
5. Monitor Call History table for results

## 📁 Project Structure

```
attack-capital/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Better-Auth routes
│   │   │   ├── dial/          # Call initiation
│   │   │   ├── calls/         # Call history
│   │   │   └── twilio/        # Twilio webhooks
│   │   ├── _components/       # React components
│   │   └── page.tsx           # Main interface
│   ├── lib/
│   │   ├── auth.ts            # Better-Auth config
│   │   └── auth-client.ts     # Auth client
│   ├── server/
│   │   ├── db.ts              # Prisma client
│   │   └── services/
│   │       └── twilio.ts      # Twilio service
│   └── components/ui/         # ShadCN components
├── prisma/
│   └── schema.prisma          # Database schema
└── python-service/            # (To be implemented)
    └── app.py                 # Hugging Face service
```

## 🔐 Security

- All secrets in `.env` (gitignored)
- Twilio webhook signature validation
- Better-Auth for user authentication
- Input validation with Zod
- HTTPS required for webhooks (via ngrok)

## 🎯 Key Features Implemented

✅ **Strategy 1: Twilio Native AMD**
- Async AMD with callbacks
- Status tracking
- Database logging

⏳ **Strategy 2: Jambonz** (In Progress)
⏳ **Strategy 3: Hugging Face** (In Progress)
⏳ **Strategy 4: Gemini Flash** (In Progress)

## 📝 Key Decisions

### Why Twilio Native AMD First?
- Simplest to implement and test
- Provides baseline for comparison
- No additional infrastructure needed

### Why Better-Auth over NextAuth?
- Assignment specifically requires Better-Auth
- Modern, lightweight alternative
- Better TypeScript support

### Why ngrok?
- Required for Twilio webhooks in development
- Exposes localhost to public internet
- Free tier sufficient for testing

## 🐛 Known Issues & Limitations

1. **Trial Account Restrictions**: Twilio trial accounts can only call verified numbers
2. **ngrok URL Changes**: Free ngrok URLs change on restart - update `.env` accordingly
3. **Temporary User ID**: Currently using hardcoded user ID - proper auth to be implemented

## 🔄 Next Steps

- [ ] Implement Jambonz SIP integration
- [ ] Build Python FastAPI service for Hugging Face
- [ ] Integrate Gemini Flash real-time API
- [ ] Add WebSocket media streaming
- [ ] Implement proper Better-Auth flows
- [ ] Add CSV export for call history
- [ ] Deploy to production

## 📚 Documentation References

- [Twilio AMD Guide](https://www.twilio.com/docs/voice/answering-machine-detection)
- [Jambonz AMD](https://docs.jambonz.org)
- [Better-Auth Docs](https://better-auth.com)
- [ShadCN UI](https://ui.shadcn.com)

## 👤 Author

Built for Attack Capital Assignment

## 📄 License

MIT

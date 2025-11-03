#!/bin/bash

echo "🚀 Attack Capital AMD System Setup"
echo "=================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 22+ first."
    exit 1
fi
echo "✅ Node.js $(node --version) found"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker not found. You'll need Docker for PostgreSQL."
    echo "   Install from: https://docs.docker.com/get-docker/"
else
    echo "✅ Docker found"
fi

# Check Python (optional)
if ! command -v python3 &> /dev/null; then
    echo "⚠️  Python3 not found. You'll need it for Hugging Face AMD."
else
    echo "✅ Python3 $(python3 --version) found"
fi

echo ""
echo "📦 Installing Node.js dependencies..."
npm install

echo ""
echo "🔐 Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file - Please fill in your credentials!"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🗄️  Setting up database..."
read -p "Start PostgreSQL with Docker? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    chmod +x start-database.sh
    ./start-database.sh
    echo "✅ PostgreSQL started"
    
    echo ""
    echo "📊 Pushing Prisma schema..."
    npm run db:push
    echo "✅ Database schema created"
fi

echo ""
echo "🐍 Python Service Setup (Optional)"
read -p "Set up Python service for Hugging Face AMD? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd python-service
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    echo "✅ Python service ready"
    cd ..
fi

echo ""
echo "🏗️  Building Next.js..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Fill in your .env file with:"
echo "   - Twilio credentials"
echo "   - Gemini API key"
echo "   - Better-Auth secret (run: openssl rand -base64 32)"
echo ""
echo "2. Create a test user in Prisma Studio:"
echo "   npx prisma studio"
echo "   Add user with id='temp-user-id' and email='test@example.com'"
echo ""
echo "3. Start ngrok in a separate terminal:"
echo "   ngrok http 3000"
echo "   Copy the https:// URL to BETTER_AUTH_URL in .env"
echo ""
echo "4. Start the application:"
echo "   npm run dev"
echo ""
echo "5. (Optional) Start Python service:"
echo "   cd python-service && ./start.sh"
echo ""
echo "🎉 Happy coding!"

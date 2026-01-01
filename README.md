# AI Startup Ecosystem Graph

A lightweight web application that visualizes relationships between AI startups and their cofounders as an interactive graph network.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- Docker (optional, for containerized deployment)
- OpenAI API key (optional, for AI features)

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your OpenAI API key (optional for development, required for AI features)

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Docker

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Or build Docker image manually:**
   ```bash
   docker build -t ai-startup-graph .
   docker run -p 3000:3000 --env-file .env.local ai-startup-graph
   ```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### End-to-End Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## 📝 Code Quality

### Linting

```bash
npm run lint
```

### Formatting

```bash
# Format code
npm run format

# Check formatting
npm run format:check
```

## 🏗️ Project Structure

```
/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── graph/         # GET /api/graph
│   │   └── ai/            # POST /api/ai/summary
│   ├── page.tsx           # Main page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── GraphCanvas/       # Graph visualization
│   ├── SearchBar/         # Search functionality
│   ├── FilterPanel/       # Filter controls
│   ├── DetailPanel/       # Node details panel
│   └── nodes/             # Custom node components
├── lib/                   # Utilities and types
│   ├── types.ts          # TypeScript type definitions
│   ├── data.ts           # Data loading and parsing
│   ├── graph-utils.ts    # Graph computation helpers
│   ├── ai-client.ts      # LLM integration
│   └── layout.ts         # Layout algorithms
├── data/                  # Seed data
│   └── seed.json
├── __tests__/            # Unit tests
├── tests/                # E2E tests (Playwright)
└── public/               # Static assets
```

## 🔧 Configuration

### Environment Variables

- `OPENAI_API_KEY` (required for AI features): Your OpenAI API key
- `OPENAI_MODEL` (optional): Model to use (default: `gpt-3.5-turbo`)
- `OPENAI_MAX_TOKENS` (optional): Max tokens for responses (default: `200`)

## 📦 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Graph Visualization**: React Flow
- **AI Integration**: OpenAI SDK
- **Testing**: Jest, React Testing Library, Playwright
- **Containerization**: Docker
- **Deployment**: Railway.com

## 🎯 Features

- ✅ Interactive graph visualization with React Flow
- ✅ Search functionality with real-time filtering
- ✅ Filter by domain tags and company stages
- ✅ Detail panel with node information
- ✅ Connected nodes navigation
- ✅ AI-powered summary generation
- ✅ Responsive design
- ✅ Production-ready deployment

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Railway.com.

### Quick Deploy to Railway

1. Push code to GitHub
2. Create new Railway project
3. Connect GitHub repository
4. Set environment variables
5. Deploy!

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

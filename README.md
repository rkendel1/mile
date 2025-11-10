# Mile - The Last Mile

🚀 **Convert API Specifications into Fully Developed, Embeddable Experiences**

Mile is a conversational web platform that bridges the gap between API specs and production-ready UI components. It's the "last mile" solution that transforms raw APIs into beautiful, functional experiences.

## 🌟 Features

### Conversational AI-Driven Interface
- **OpenAI Integration**: Powered by GPT-4 for intelligent, context-aware conversations
- **Natural Language Planning**: Describe what you want to build in plain English
- **Context-Aware Assistance**: AI understands your current workflow stage and adapts responses
- **Interactive Guidance**: Get help at every step of the journey

### Context-Aware Components (NEW!)
- **8 Dynamic Context Types**: Components adapt to tenant, user, environment, and more
- **Multi-Tenancy Support**: White-label components with per-tenant branding
- **Role-Based Rendering**: Show/hide features based on user permissions
- **Device Adaptation**: Automatically optimize for mobile, tablet, or desktop
- **A/B Testing Ready**: Built-in support for feature flags and experiments

See [CONTEXT_GUIDE.md](./CONTEXT_GUIDE.md) for detailed documentation.

### Two-Pane Workspace
- **Left Panel**: Persistent chat interface with full conversation context
- **Right Panel**: Tabbed workspace with five specialized tools:
  1. **📋 Spec Tab**: Import and analyze API specifications (OpenAPI, Swagger, GraphQL)
  2. **🎯 Goal Tab**: Define outcomes and generate execution plans
  3. **🧪 Test Tab**: Execute live API calls and validate responses
  4. **🧩 Component Tab**: Generate and preview functional UI components
  5. **✏️ Edit Tab**: Iterate infinitely with version control and export options

### Powerful Capabilities
- **API Spec Parsing**: Automatically parse and index endpoints, models, and auth methods
- **Smart Planning**: AI generates execution plans based on your goals
- **Live Testing**: Execute real API calls and view formatted responses
- **Component Generation**: Create React components with pre-wired bindings
- **Continuous Context**: Switch between tabs without losing state
- **Multiple Export Formats**: Code snippets, NPM packages, or embed codes

## 🏗️ Architecture

```
mile/
├── src/                    # Backend (Node.js + TypeScript)
│   ├── index.ts           # Express server
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   └── types/             # TypeScript definitions
├── frontend/              # Frontend (React + TypeScript)
│   └── src/
│       ├── components/    # UI components
│       ├── services/      # API client
│       ├── styles/        # CSS styling
│       └── types/         # Type definitions
└── package.json           # Project dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rkendel1/mile.git
   cd mile
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Configure OpenAI (Optional but Recommended)**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY for AI-powered conversations
   ```
   
   Without OpenAI, the system uses rule-based fallback responses.

### Running the Application

**Development Mode (Recommended)**

Run both backend and frontend concurrently:
```bash
npm run dev
```

This will start:
- Backend API server on `http://localhost:3001`
- Frontend dev server on `http://localhost:3000`

**Or run separately:**

Backend:
```bash
npm run dev:backend
```

Frontend:
```bash
npm run dev:frontend
```

### Building for Production

```bash
npm run build
```

This builds both backend and frontend for production deployment.

## 📖 Usage Guide

### 1. Import Your API Spec
- Navigate to the **Spec** tab
- Upload an OpenAPI/Swagger JSON or YAML file
- Mile automatically parses and indexes your API

### 2. Define Your Goal
- Switch to the **Goal** tab
- Describe what you want to build in the chat
- Example: *"Create a dashboard showing user metrics"*
- Mile generates an execution plan

### 3. Test Your Endpoints
- Go to the **Test** tab
- Ask Mile to run tests in the chat
- View live API responses and validation results

### 4. Generate Your Component
- Move to the **Component** tab
- Request component generation in the chat
- Preview the live component or view the code

### 5. Iterate and Export
- Use the **Edit** tab for continuous refinement
- Jump between any tab to modify your work
- Export as code, package, or embed when ready

## 🎯 Example Use Cases

- **SaaS Integration**: Transform partner APIs into embeddable widgets
- **Internal Tools**: Quickly build admin dashboards from backend APIs
- **API Documentation**: Create interactive API explorers
- **Rapid Prototyping**: Convert specs to functional UIs in minutes
- **Developer Onboarding**: Help teams understand and use APIs faster

## 🛠️ Technology Stack

**Backend**
- Node.js + Express
- TypeScript
- swagger-parser for API spec parsing
- CORS enabled for cross-origin requests

**Frontend**
- React 18 with TypeScript
- Custom CSS with CSS variables
- Responsive design
- Accessibility-first approach

## 🧪 Development

### Linting
```bash
npm run lint
```

### Testing
```bash
npm test
```

### Project Structure
- `src/` - Backend TypeScript code
- `frontend/src/` - React frontend code
- `dist/` - Compiled backend code (gitignored)
- `frontend/build/` - Built frontend assets (gitignored)

## 🔮 Roadmap

- [ ] LLM integration for enhanced AI conversations
- [ ] Support for GraphQL schema parsing
- [ ] Vue and Angular component generation
- [ ] Real-time collaboration features
- [ ] Component marketplace
- [ ] Advanced theming and customization
- [ ] WebSocket support for live updates
- [ ] API mocking capabilities

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💡 Philosophy

Mile embodies the belief that APIs should come with complete, working experiences—not just documentation. We're building the "last mile" that SaaS companies should have delivered all along: fully functioning, embeddable flows that developers can drop into their applications immediately.

---

**Built with ❤️ to bridge the gap between APIs and experiences**
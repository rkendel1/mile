# Mile - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Start the Application

**Option A: Run both servers together (Recommended)**
```bash
npm run dev
```

This starts:
- Backend API server on `http://localhost:3001`
- Frontend dev server on `http://localhost:3000`

**Option B: Run separately**

Terminal 1 (Backend):
```bash
npm run dev:backend
```

Terminal 2 (Frontend):
```bash
npm run dev:frontend
```

### 3. Open Your Browser

Navigate to `http://localhost:3000` and start building!

---

## 📖 How to Use Mile

### Step 1: Import Your API Spec

1. Click on the **📋 Spec** tab
2. Select your API type (OpenAPI 3.x, Swagger 2.0, or GraphQL)
3. Click **Choose File** and upload your specification
4. Mile will automatically parse and index all endpoints

### Step 2: Define Your Goal

1. Switch to the **🎯 Goal** tab
2. Describe what you want to build in the chat:
   - "Create a dashboard showing user metrics"
   - "Build a form to create new orders"
   - "Show a table of all products with filters"
3. Mile generates an execution plan with endpoints and UI structure

### Step 3: Test Your Endpoints

1. Go to the **🧪 Test** tab
2. Ask Mile to run tests in the chat
3. View live API responses and validation results
4. Ensure all endpoints return expected data

### Step 4: Generate Your Component

1. Move to the **🧩 Component** tab
2. Request component generation: "Generate the component"
3. Preview the live component or view the code
4. Ask for modifications: "Make it a table", "Add filters", etc.

### Step 5: Export Your Work

1. Use the **✏️ Edit** tab for final refinements
2. Export as:
   - Code snippet (copy/paste)
   - NPM package (download)
   - Embed code (iframe)

---

## 💡 Example Conversations

**Upload a spec:**
```
User: I have an OpenAPI spec for my e-commerce API
Mile: Great! Please use the Spec tab to upload your OpenAPI file...
```

**Define a goal:**
```
User: I want to create a dashboard showing sales metrics and top products
Mile: Got it. To create a dashboard, I'll use /sales/metrics and /products/top endpoints...
```

**Customize component:**
```
User: Make this a sortable table with pagination
Mile: Converting to a table layout with sorting and pagination controls...
```

---

## 🛠️ Development

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

---

## 📦 Project Structure

```
mile/
├── src/                    # Backend source code
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   └── types/             # TypeScript types
├── frontend/              # React frontend
│   └── src/
│       ├── components/    # React components
│       ├── services/      # API client
│       └── styles/        # CSS files
└── dist/                  # Compiled backend (generated)
```

---

## 🎯 Next Steps

1. Try uploading a sample OpenAPI spec
2. Experiment with different goal descriptions
3. Customize generated components
4. Export and integrate into your application

**Need help?** Check out the main README.md for detailed documentation.

---

**Happy building! 🚀**

# AI Development Rules for Mile

This document outlines the technical stack and provides clear rules for the AI on what libraries and conventions to use when developing the Mile application.

## 🚀 Tech Stack

The application is a full-stack TypeScript project with a Node.js backend and a React frontend.

- **Backend**: Node.js with the Express.js framework for creating RESTful APIs.
- **Frontend**: React (using Create React App) for building the user interface.
- **Language**: TypeScript is used across the entire stack for type safety and improved developer experience.
- **API Specification**: `swagger-parser` is used on the backend to parse OpenAPI and Swagger specs.
- **AI Integration**: The `openai` library is used for connecting to GPT models to power conversational features.
- **Styling**: The frontend uses plain CSS with CSS Variables for a custom, consistent design system. No component libraries like Material-UI or Bootstrap are used.
- **Development Environment**: `concurrently` runs the frontend and backend servers simultaneously, with `nodemon` providing hot-reloading for the backend.
- **Testing**: The backend uses `jest` and `ts-jest`, while the frontend uses `@testing-library/react`.

## 📜 Library and Convention Rules

To maintain code quality and consistency, the following rules must be followed.

### 1. Styling
- **Use Custom CSS**: All styling must be done using the existing custom CSS framework located in `frontend/src/styles/`.
- **CSS Variables**: Leverage the global CSS variables defined in `frontend/src/styles/index.css` for colors, fonts, and spacing to maintain a consistent theme.
- **No New Styling Libraries**: Do not introduce new styling libraries (e.g., Tailwind CSS, Styled-Components, Emotion) without explicit instruction.

### 2. State Management
- **React Hooks**: For all component-level and simple application state, use React's built-in hooks (`useState`, `useEffect`, `useContext`).
- **No State Management Libraries**: Do not add external state management libraries like Redux, MobX, or Zustand unless specifically requested.

### 3. API Communication
- **Use `fetch` API**: All client-side API calls to the backend must use the native `fetch` API, as implemented in `frontend/src/services/api.ts`.
- **No Axios**: Do not add or use `axios` or other HTTP client libraries.

### 4. Components
- **Build Custom Components**: All UI components should be custom-built to match the application's existing design.
- **Component Structure**: Place all new React components in the `frontend/src/components/` directory, organized into subdirectories as needed (e.g., `tabs`).
- **No External Component Libraries**: Do not install or use third-party component libraries like Material-UI, Ant Design, or Chakra UI.

### 5. Icons
- **Use Emojis**: For iconography, continue using emojis as is currently done throughout the application (e.g., 🚀, 📋, 🎯). This keeps the app lightweight and visually consistent.
- **No Icon Libraries**: Do not add icon libraries such as Font Awesome or Lucide Icons.

### 6. Backend Development
- **Express Router**: All new API endpoints must be created using Express Router and organized within the `src/routes/` directory.
- **In-Memory Storage**: For this stage of development, continue using in-memory objects for data storage (e.g., for specs, components, chat history). Do not implement a database unless requested.

### 7. Typing
- **Centralized Types**: Define all shared backend types in `src/types/index.ts` and all frontend-specific types in `frontend/src/types/index.ts`.
- **Strict Typing**: Write strongly-typed code. Avoid using `any` whenever possible.
# Gem Suite: System Design & JavaScript Concepts

This document outlines the architectural patterns and technical concepts implemented within the Gem Suite repository.

## 🏛️ System Design & Architecture

### 1. Monorepo Architecture
The project is structured as a monorepo using **npm workspaces**. This allows for multiple packages to coexist in a single repository while sharing dependencies and internal libraries.
- **`/apps`**: Contains the primary applications (Web, Server, Desktop).
- **`/packages`**: Contains shared libraries like `@gem/shared` (types/constants) and `@gem/db` (database abstractions).

### 2. Micro-Frontend (App-Group Shell)
Gem Suite uses a **Shell-and-App** pattern. The `Shell` acts as a host environment providing:
- **Application Orchestration**: Managing the active application and navigation.
- **Shared Infrastructure**: Global theme, error boundaries, and context-aware headers.
- **Isolation**: Each "Gem" (app) is encapsulated within its own directory (`/appGroup`) and isolated via React Error Boundaries to prevent a single app crash from affecting the entire suite.

### 3. Local-First / On-Premise Persistence
A core design principle of Gem Suite is **Data Residency**.
- **sql.js (WASM)**: High-performance SQLite database running locally on the server/desktop environment.
- **Hybrid Storage**: Combines local database persistence (for artifacts, logs, and keys) with browser `localStorage/sessionStorage` for ephemeral UI state and AI content caching.

### 4. Agent Orchestration Layer
For complex AI tasks (like trip planning or resume generation), the server implements an **Orchestration Workflow**:
- **Workflows**: Defined sequences of agent calls where the output of one agent (e.g., "Route Expert") informs the input of the next (e.g., "Cost Analyst").
- **Stateless Inference**: The server coordinates these calls to LLM providers but keeps the logic modular and testable.

### 5. Resilience & Fault Tolerance
- **Error Boundaries**: Component-level isolation that captures runtime errors and provides fallback UIs.
- **Health Checks**: Real-time monitoring of database connectivity, uptime, and system resources.

---

## ⚡ JavaScript & TypeScript Concepts

### 1. Advanced Asynchronous Patterns
Extensive use of `Promise.all` for parallel data fetching and `AbortController` for handling request timeouts in services like `unlockService`.

### 2. TypeScript Type Safety
- **Generics**: Used in storage utilities and database query methods to ensure type consistency across the stack.
- **Discriminated Unions**: Used for UI states (e.g., `loading | error | idle`) and DataType definitions.
- **Module Augmentation**: Integrating with external loaders and WASM binaries.

### 3. High-Performance UI Logic
- **Custom Hooks**: Encapsulating complex logic (like the text editor's ghost suggestions) into reusable `useTextEditor` or `useShell` hooks.
- **Ghost Overlay Technique**: Manipulating the DOM to overlay transparent text on top of textareas to create "AI Shadow Writing" effects.
- **Virtual DOM Optimization**: Careful use of `useEffect` dependencies and `React.memo` to prevent redundant re-renders in large forms.

### 4. Computational Utilities
- **Hashing**: Simple string hashing functions for generating deterministic cache keys for AI responses.
- **Binary Data Handling**: Loading and processing WASM binaries using `fs` and converting them to `ArrayBuffer` for the SQL engine.

### 5. Architectural Patterns in JS
- **Service Pattern**: Segregating business logic into dedicated service objects (`userService`, `apiManagerService`) to keep components clean.
- **Controller-Model-Service**: A clean backend separation ensuring that database interactions (`Models`) are separated from request handling (`Controllers`).
- **Decorators (Experimental)**: Use of method decorators for cross-cutting concerns like caching (`@Cacheable`).

### 6. React Design Patterns
- **Provider Pattern**: Using `Context API` to provide global access to shell actions and theme variables.
- **Compound Components**: Building complex UI elements like `SaveControls` that manage their own internal lifecycle while communicating with the parent app.

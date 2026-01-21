# Aryavarta Gem Suite - Technical Architecture Documentation

## Overview

Aryavarta Gem Suite is a production-grade desktop AI ecosystem built on a **Distributed Desktop Architecture** pattern. It leverages Gemini 3 AI capabilities through a sophisticated multi-layered framework designed for extensibility, performance, and local-first data management.

## Core Architecture

### High-Level System Design

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Electron      │    │   Express.js     │    │   Gemini 3      │
│   Desktop       │◄──►│   Local Server   │◄──►│   AI Backend    │
│   Container     │    │   (Port 0)       │    │   (API)         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       
         ▼                       ▼                       
┌─────────────────┐    ┌──────────────────┐              
│   React SPA     │    │   SQLite WASM    │              
│   (Vite Build)  │    │   Database       │              
└─────────────────┘    └──────────────────┘              
```

### Technology Stack

#### Frontend Layer
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.0.8
- **Routing**: React Router DOM 7.11.0
- **Styling**: CSS-in-JS with glassmorphism theme system
- **Maps**: Leaflet with React-Leaflet integration
- **PDF Generation**: html2pdf.js for document exports

#### Backend Layer
- **Runtime**: Node.js with Express.js 4.18.2
- **Language**: TypeScript (ESNext/NodeNext)
- **Database**: SQLite with sql.js WASM implementation
- **AI Integration**: Gemini 3 Flash Preview API
- **Build**: ESBuild for production bundling

#### Desktop Layer
- **Container**: Electron 28.0.0
- **Process Management**: Child process forking for server isolation
- **Security**: Context isolation with preload scripts
- **Distribution**: Electron Builder with NSIS installer

#### Development Infrastructure
- **Monorepo**: NPM Workspaces with TypeScript project references
- **Package Manager**: NPM with workspace support
- **Process Orchestration**: Concurrently for multi-process development
- **Build System**: Custom scripts with dependency management

## Architectural Patterns

### 1. Extensible Framework Pattern

The system implements a plugin-based architecture where new "Gem" applications can be registered without modifying core infrastructure:

```typescript
// App Registration System
const AppGroup = (): ShellApp[] => [
  {
    id: 'resumemaker',
    name: 'Gem Vivarad',
    description: 'AI-powered resume builder',
    icon: <CVIcon />,
    component: ResumeMakerApp,
  },
  // Additional gems...
];
```

### 2. Agent Orchestration Pattern

AI functionality is organized through specialized agents with workflow coordination:

```typescript
// Agent System
class AgentOrchestrator {
  async executeWorkflow(workflow: Workflow): Promise<WorkflowResult>
  async callAgent(agentId: string, input: any): Promise<any>
}
```

**Agent Categories**:
- **Resume Agents**: ATS scoring, formatting, grammar checking
- **Text Agents**: Grammar, style, tone analysis
- **Trip Agents**: Route optimization, cost calculation, weather integration
- **Invitation Agents**: Design generation, localization, quality assurance

### 3. Model Context Protocol (MCP) Integration

Implements MCP for tool and resource management:

```typescript
class MCPServer {
  private tools: Map<string, MCPTool>
  private resources: Map<string, MCPResource>
  
  getContext(appName: string): MCPContext
  executeTool(toolName: string, params: Record<string, any>): Promise<any>
}
```

### 4. Local-First Data Architecture

**Database Design**:
- **SQLite WASM**: Client-side database with production persistence
- **Schema**: Users, activation, logging, resume data, saved artifacts, usage metrics
- **Location**: `%APPDATA%/GemSuite/gem-suite.sqlite` (Windows)
- **Backup**: Automatic disk synchronization after each transaction

## AI Integration Architecture

### Gemini 3 Integration

**API Configuration**:
- **Model**: `gemini-3-flash-preview`
- **Endpoint**: Google Generative Language API
- **Max Tokens**: 7,200
- **Temperature**: 0.3 (balanced creativity/consistency)
- **Timeout**: 45 seconds with exponential backoff

**Error Handling**:
- **Rate Limiting**: 429 handling with retry-after headers
- **Authentication**: 401/403 immediate failure (no retry)
- **Server Errors**: 3-attempt retry with exponential backoff
- **Timeout Management**: AbortController for request cancellation

**Prompt Engineering**:
- **Structured Reasoning**: Schema-validated JSON responses
- **Multi-modal Support**: Text and image generation capabilities
- **Context Management**: Long-context utilization for complex workflows

### AI Workflow Examples

**Resume Generation Pipeline**:
1. **Input Sanitization**: PII anonymization for privacy
2. **ATS Analysis**: Keyword optimization and scoring
3. **Content Generation**: Structured JSON output
4. **Template Application**: Multiple export formats (Standard, LaTeX, Premium)
5. **Quality Assurance**: Grammar and formatting validation

**Trip Planning Pipeline**:
1. **Route Optimization**: Multi-city path calculation
2. **Cost Estimation**: Transportation, accommodation, food budgeting
3. **Attraction Discovery**: Location-based recommendations
4. **Weather Integration**: Seasonal planning considerations
5. **PDF Generation**: Professional itinerary export

## Production Architecture

### Build System

**Development Mode**:
```bash
npm run dev  # Concurrent: Server (3001) + Web (3000) + Desktop
```

**Production Build**:
```bash
npm run build  # TypeScript compilation + Vite build
npm run dist   # Electron packaging + installer creation
```

**Build Pipeline**:
1. **Package Compilation**: Shared libraries and database layer
2. **Server Bundling**: ESBuild with CommonJS output, externalized dependencies
3. **Frontend Build**: Vite optimization with asset bundling
4. **Desktop Packaging**: Electron Builder with ASAR + extraResources
5. **Installer Creation**: NSIS with desktop shortcuts and auto-updater

### Deployment Strategy

**File Structure (Production)**:
```
GemSuite/
├── resources/
│   ├── app.asar                 # Electron + React (compressed)
│   ├── server/                  # Express server (uncompressed)
│   │   ├── server.js           # Bundled application code
│   │   ├── node_modules/       # Runtime dependencies
│   │   └── sql-wasm.wasm       # SQLite WebAssembly
│   └── assets/                 # Static HTML files
└── GemSuite.exe                # Main executable
```

**Runtime Process Flow**:
1. **Electron Launch**: Main process initialization
2. **Loader Display**: Immediate UI feedback (`loader.html`)
3. **Server Fork**: Child process with isolated runtime
4. **Health Check**: HTTP ping to ensure server readiness
5. **App Navigation**: Load React SPA from local server
6. **Error Handling**: Fallback to offline mode with user notification

### Security Architecture

**Process Isolation**:
- **Main Process**: Electron system integration only
- **Renderer Process**: React app with context isolation
- **Server Process**: Forked child with limited system access
- **Preload Script**: Secure IPC bridge with minimal API surface

**Data Protection**:
- **Local Storage**: Encrypted SQLite database
- **API Keys**: Secure storage with keytar integration
- **PII Handling**: Anonymization service for AI processing
- **Network**: HTTPS-only external communication

**Content Security**:
- **CSP Headers**: Strict content security policy
- **External Links**: Shell.openExternal for security
- **File Access**: Sandboxed file operations
- **Input Validation**: Schema validation for all user inputs

## Performance Optimizations

### Frontend Performance
- **Code Splitting**: Dynamic imports for app components
- **Asset Optimization**: Vite tree-shaking and minification
- **Lazy Loading**: Component-level lazy loading
- **Caching**: Service worker for offline capability

### Backend Performance
- **Connection Pooling**: SQLite connection management
- **Request Batching**: Bulk operations for database writes
- **Memory Management**: Garbage collection optimization
- **Stream Processing**: Large file handling with streams

### AI Performance
- **Token Management**: Intelligent prompt optimization
- **Response Caching**: Local caching for repeated queries
- **Parallel Processing**: Concurrent agent execution
- **Context Reuse**: Efficient context window utilization

## Monitoring and Observability

### Logging System
- **Structured Logging**: JSON-formatted log entries
- **Log Levels**: INFO, WARN, ERROR with appropriate routing
- **File Rotation**: Automatic log file management
- **Error Tracking**: Crash reporting with stack traces

### Health Monitoring
```typescript
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  database: { status: 'connected' | 'disconnected' }
  memory: { used: number; total: number }
  artifacts: { count: number; lastActivity?: string }
  errors: { count: number; lastError?: string }
}
```

### Usage Analytics
- **API Hit Tracking**: Request counting per application
- **Feature Usage**: User interaction analytics
- **Performance Metrics**: Response time monitoring
- **Error Rates**: Failure rate tracking by component

## Extensibility Framework

### Adding New Gem Applications

1. **Component Creation**: Implement React component with standard interface
2. **Agent Registration**: Define AI agents for application logic
3. **Route Configuration**: Add API endpoints for backend integration
4. **Icon Integration**: Create SVG icon component
5. **App Registration**: Add to AppGroup registry

### Custom Agent Development
```typescript
interface Agent {
  id: string
  name: string
  description: string
  execute(input: any, context: MCPContext): Promise<any>
}
```

### MCP Tool Integration
```typescript
interface MCPTool {
  name: string
  description: string
  execute(params: Record<string, any>): Promise<any>
}
```

## Development Guidelines

### Code Organization
- **Monorepo Structure**: Clear separation of concerns
- **TypeScript Strict Mode**: Full type safety enforcement
- **ESM Modules**: Modern module system throughout
- **Shared Contracts**: Type definitions in `@gem/shared`

### Testing Strategy
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint validation
- **E2E Tests**: Full workflow testing with Electron
- **Performance Tests**: Load testing for AI workflows

### Quality Assurance
- **Code Reviews**: Mandatory peer review process
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier for consistent code style
- **Type Checking**: Strict TypeScript compilation

## Future Architecture Considerations

### Scalability Enhancements
- **Multi-threading**: Worker threads for CPU-intensive tasks
- **Distributed Processing**: Optional cloud processing for large workloads
- **Plugin System**: Third-party plugin architecture
- **API Gateway**: Centralized API management layer

### Technology Evolution
- **AI Model Updates**: Support for newer Gemini versions
- **Framework Upgrades**: React 19+ and Electron updates
- **Database Migration**: Potential PostgreSQL integration for advanced features
- **Cloud Integration**: Optional cloud synchronization capabilities

This architecture provides a robust foundation for the Gem Suite ecosystem while maintaining flexibility for future enhancements and extensions.
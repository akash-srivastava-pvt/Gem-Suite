# Gem Suite - Project Structure Documentation

## Root Directory Structure

```
Gem-Suite/
├── 📁 apps/                          # Application layer (3 main apps)
│   ├── 📁 desktop/                   # Electron desktop container
│   ├── 📁 server/                    # Express.js backend server
│   └── 📁 web/                       # React frontend application
├── 📁 packages/                      # Shared libraries and utilities
│   ├── 📁 db/                        # SQLite database abstraction
│   └── 📁 shared/                    # Common types and interfaces
├── 📁 scripts/                       # Build and development automation
├── 📁 public/                        # Static assets
├── 📄 package.json                   # Root workspace configuration
├── 📄 tsconfig.base.json            # TypeScript base configuration
├── 📄 README.md                     # Project overview and setup
├── 📄 PRODUCTION.md                 # Production deployment guide
├── 📄 tech.md                       # Technical architecture (this doc)
├── 📄 str.md                        # Project structure (this doc)
└── 📄 .env                          # Environment variables
```

## Detailed Structure Analysis

### 🖥️ Desktop Application (`apps/desktop/`)

**Purpose**: Electron container providing native desktop experience

```
apps/desktop/
├── 📁 assets/                        # Static resources for Electron
│   ├── 🖼️ icon.png                  # Application icon
│   ├── 📄 loader.html               # Loading screen during startup
│   └── 📄 offline.html              # Offline fallback page
├── 📁 release/                       # Built application artifacts
│   ├── 📁 .icon-ico/               # Windows icon conversion
│   ├── 📁 win-unpacked/            # Unpacked Windows build
│   ├── 📄 GemSuite Setup 1.0.0.exe # Windows installer
│   └── 📄 builder-*.yml            # Build configuration files
├── 📁 server/                        # Bundled server for production
│   ├── 📄 package.json             # Server runtime dependencies
│   ├── 📄 server.js                # Compiled Express server
│   └── 📄 sql-wasm.wasm            # SQLite WebAssembly binary
├── 📁 src/                          # Electron main process source
│   ├── 📄 main.ts                  # Main Electron process entry
│   ├── 📄 preload.cts              # Secure IPC bridge (CommonJS)
│   ├── 📄 loader.html              # Development loader template
│   └── 📄 offline.html             # Development offline template
├── 📁 web/                          # Built React application
│   ├── 📁 assets/                  # Compiled frontend assets
│   └── 📄 index.html               # React SPA entry point
├── 📄 package.json                 # Electron build configuration
└── 📄 tsconfig.json                # TypeScript configuration
```

**Key Files**:
- `main.ts`: Orchestrates server startup, window management, and error handling
- `preload.cts`: Provides secure API bridge between Electron and React
- `package.json`: Defines Electron Builder configuration for packaging

### 🌐 Server Application (`apps/server/`)

**Purpose**: Express.js backend providing AI integration and data persistence

```
apps/server/
├── 📁 src/                          # Server source code
│   ├── 📁 agents/                   # AI agent implementations
│   │   ├── 📁 invitation/           # Invitation generation agents
│   │   │   ├── 📄 designAgent.ts    # Visual design generation
│   │   │   ├── 📄 localizationAgent.ts # Multi-language support
│   │   │   └── 📄 qualityAgent.ts   # Content quality assurance
│   │   ├── 📁 resume/               # Resume building agents
│   │   │   ├── 📄 atsScoringAgent.ts # ATS optimization scoring
│   │   │   ├── 📄 formattingAgent.ts # Document formatting
│   │   │   ├── 📄 grammarAgent.ts   # Grammar and style checking
│   │   │   └── 📄 resumeAgent.ts    # Main resume generation logic
│   │   ├── 📁 text/                 # Text editing agents
│   │   │   ├── 📄 grammarAgent.ts   # Grammar correction
│   │   │   ├── 📄 styleAgent.ts     # Writing style analysis
│   │   │   ├── 📄 textEditorAgent.ts # Main text processing
│   │   │   └── 📄 toneAgent.ts      # Tone adjustment
│   │   ├── 📁 trip/                 # Trip planning agents
│   │   │   ├── 📄 costAgent.ts      # Budget calculation
│   │   │   ├── 📄 localizationAgent.ts # Location-specific data
│   │   │   ├── 📄 routeAgent.ts     # Route optimization
│   │   │   └── 📄 weatherAgent.ts   # Weather integration
│   │   └── 📄 index.ts              # Agent registry and exports
│   ├── 📁 controllers/              # HTTP request handlers
│   │   ├── 📄 activateController.ts # API key activation
│   │   ├── 📄 eventInvitationController.ts # Event invitations
│   │   ├── 📄 greetingInvitationController.ts # Greeting cards
│   │   ├── 📄 resumeController.ts   # Resume operations
│   │   ├── 📄 textEditorController.ts # Text editing operations
│   │   ├── 📄 tripControler.ts      # Trip planning operations
│   │   ├── 📄 userController.ts     # User management
│   │   └── 📄 weddingInvitationController.ts # Wedding invitations
│   ├── 📁 mcp/                      # Model Context Protocol implementation
│   │   ├── 📁 resources/            # MCP resource definitions
│   │   ├── 📁 tools/                # MCP tool implementations
│   │   │   ├── 📄 ats.tool.ts       # ATS analysis tool
│   │   │   ├── 📄 design.tool.ts    # Design generation tool
│   │   │   ├── 📄 geocoding.tool.ts # Location geocoding tool
│   │   │   └── 📄 style.tool.ts     # Style analysis tool
│   │   ├── 📄 mcpServer.ts          # MCP server implementation
│   │   └── 📄 types.ts              # MCP type definitions
│   ├── 📁 models/                   # Data models and database interfaces
│   │   ├── 📄 loggerModel.ts        # Logging data model
│   │   └── 📄 userModel.ts          # User data model
│   ├── 📁 orchestration/            # Agent workflow coordination
│   │   ├── 📄 agentOrchestrator.ts  # Workflow execution engine
│   │   ├── 📄 agentRegistry.ts      # Agent registration system
│   │   ├── 📄 messageBus.ts         # Inter-agent communication
│   │   ├── 📄 types.ts              # Orchestration type definitions
│   │   └── 📄 workflows.ts          # Predefined workflow templates
│   ├── 📁 proxies/                  # External API integrations
│   │   ├── 📄 gemini2.ts            # Gemini 2 API client
│   │   ├── 📄 gemini2img.ts         # Gemini 2 image generation
│   │   ├── 📄 gemini3.ts            # Gemini 3 API client
│   │   └── 📄 gemini3img.ts         # Gemini 3 image generation
│   ├── 📁 routes/                   # Express.js route definitions
│   │   ├── 📄 activateRoutes.ts     # Activation endpoints
│   │   ├── 📄 invitationRoutes.ts   # Invitation endpoints
│   │   ├── 📄 persistenceRoutes.ts  # Data persistence endpoints
│   │   ├── 📄 resumeRoutes.ts       # Resume endpoints
│   │   ├── 📄 textEditorRoutes.ts   # Text editor endpoints
│   │   ├── 📄 tripRoutes.ts         # Trip planning endpoints
│   │   ├── 📄 user.routes.ts        # User management endpoints
│   │   └── 📄 index.ts              # Route aggregation
│   ├── 📁 services/                 # Business logic services
│   │   ├── 📄 AnonymisationService.ts # PII anonymization
│   │   ├── 📄 AuditLogService.ts    # Activity logging
│   │   ├── 📄 GeminiTransformService.ts # AI response processing
│   │   ├── 📄 HealthService.ts      # System health monitoring
│   │   ├── 📄 ResumeService.ts      # Resume processing logic
│   │   └── 📄 SaveService.ts        # Data persistence service
│   ├── 📁 utility/                  # Helper functions and utilities
│   │   ├── 📄 cache.ts              # Caching mechanisms
│   │   ├── 📄 diff.util.ts          # Data difference calculations
│   │   ├── 📄 errors.ts             # Error handling utilities
│   │   ├── 📄 helper.ts             # General helper functions
│   │   ├── 📄 jsonParser.ts         # JSON parsing utilities
│   │   ├── 📄 legalGuard.ts         # Content compliance checking
│   │   ├── 📄 logger.ts             # Logging infrastructure
│   │   ├── 📄 middleware.ts         # Express middleware
│   │   ├── 📄 patchValidator.ts     # Data validation
│   │   ├── 📄 security.ts           # Security utilities
│   │   ├── 📄 tokenCounter.ts       # AI token management
│   │   ├── 📄 toonTransformer.ts    # Data transformation
│   │   ├── 📄 transformer.ts        # Generic transformations
│   │   └── 📄 validation.ts         # Input validation
│   ├── 📄 runtime.ts                # Server runtime configuration
│   └── 📄 server.ts                 # Express server entry point
├── 📄 esbuild.config.js            # Production bundling configuration
├── 📄 package.json                 # Server dependencies and scripts
└── 📄 tsconfig.json                # TypeScript configuration
```

**Key Directories**:
- `agents/`: Modular AI agents for specific tasks (resume, trip, text, invitation)
- `mcp/`: Model Context Protocol implementation for tool/resource management
- `orchestration/`: Workflow coordination and agent communication
- `proxies/`: External API clients (Gemini AI integration)
- `services/`: Core business logic and data processing

### 🎨 Web Application (`apps/web/`)

**Purpose**: React frontend providing user interface for all Gem applications

```
apps/web/
├── 📁 src/                          # React application source
│   ├── 📁 appGroup/                 # Gem application implementations
│   │   ├── 📁 components/           # Shared UI components
│   │   │   └── 📄 LoadingAnimation.tsx # Loading state component
│   │   ├── 📁 icons/                # Application icons
│   │   │   ├── 📄 cv.tsx            # Resume maker icon
│   │   │   ├── 📄 invite.tsx        # Invitation maker icon
│   │   │   ├── 📄 profile.tsx       # Profile management icon
│   │   │   ├── 📄 trip.tsx          # Trip planner icon
│   │   │   └── 📄 write.tsx         # Text editor icon
│   │   ├── 📁 InvitationApp/        # Gem Amantrada (Invitation Maker)
│   │   │   ├── 📁 components/       # Invitation-specific components
│   │   │   │   ├── 📄 DynamicForm.tsx # Form generation component
│   │   │   │   ├── 📄 LoadingAnimation.tsx # Loading state
│   │   │   │   ├── 📄 PreviewStep.tsx # Invitation preview
│   │   │   │   ├── 📄 Stepper.tsx   # Multi-step wizard
│   │   │   │   └── 📄 ThemeSelector.tsx # Theme selection
│   │   │   ├── 📁 config/           # Configuration files
│   │   │   │   └── 📄 invitationFormConfig.ts # Form definitions
│   │   │   ├── 📁 hooks/            # React hooks
│   │   │   │   └── 📄 useInvitationWizard.ts # Wizard state management
│   │   │   ├── 📁 services/         # API integration
│   │   │   │   └── 📄 invitationService.tsx # Backend communication
│   │   │   └── 📄 index.tsx         # Main invitation app component
│   │   ├── 📁 ProfileApp/           # Gem Profile (User Management)
│   │   │   ├── 📄 index.tsx         # Profile management interface
│   │   │   └── 📄 UserAgreementPage.tsx # Terms and conditions
│   │   ├── 📁 ResumeMakerApp/       # Gem Vivarad (Resume Builder)
│   │   │   ├── 📁 templates/        # Resume templates
│   │   │   │   ├── 📄 PremiumModern.tsx # Premium template
│   │   │   │   ├── 📄 StandardDocument.tsx # Standard template
│   │   │   │   └── 📄 StandardLaTeX.tsx # LaTeX template
│   │   │   ├── 📄 index.tsx         # Main resume app component
│   │   │   └── 📄 ResumeMaker.css   # Resume-specific styles
│   │   ├── 📁 TextEditorApp/        # Gem Likhit (Text Editor)
│   │   │   ├── 📁 components/       # Text editor components
│   │   │   │   ├── 📄 CommandHint.tsx # Command suggestions
│   │   │   │   ├── 📄 GhostOverlay.tsx # AI suggestions overlay
│   │   │   │   ├── 📄 SelectionMenu.tsx # Text selection actions
│   │   │   │   └── 📄 TextEditorMain.tsx # Main editor component
│   │   │   ├── 📁 hooks/            # Editor-specific hooks
│   │   │   │   ├── 📄 useAtCommand.ts # @ command handling
│   │   │   │   ├── 📄 useInlineAutocomplete.ts # Autocomplete logic
│   │   │   │   ├── 📄 useSelection.ts # Text selection management
│   │   │   │   ├── 📄 useTextEditor.ts # Main editor logic
│   │   │   │   └── 📄 useThrottle.ts # Performance optimization
│   │   │   ├── 📁 services/         # Editor API integration
│   │   │   │   └── 📄 textEditorService.ts # Backend communication
│   │   │   ├── 📁 styles/           # Editor-specific design system
│   │   │   │   └── 📄 editor.css    # Premium typography and theme variables
│   │   │   └── 📄 index.tsx         # Main text editor component
│   │   ├── 📁 TripPlannerApp/       # Gem Musafir (Trip Planner)
│   │   │   ├── 📁 components/       # Trip planning components
│   │   │   │   ├── 📄 CityAttractions.tsx # Attraction listings
│   │   │   │   ├── 📄 TripItineraryPreview.tsx # Itinerary display
│   │   │   │   ├── 📄 TripJsonPreview.tsx # JSON data preview
│   │   │   │   ├── 📄 TripMap.tsx    # Interactive map component
│   │   │   │   ├── 📄 TripPlanForm.tsx # Trip input form
│   │   │   │   ├── 📄 TripPlannerApp.tsx # Main planner component
│   │   │   │   └── 📄 TripPlannerIndex.tsx # App entry point
│   │   │   ├── 📁 data/             # Static data
│   │   │   │   └── 📄 cities.ts     # City database
│   │   │   ├── 📁 services/         # Trip API integration
│   │   │   │   └── 📄 tripService.ts # Backend communication
│   │   │   ├── 📁 utils/            # Trip utilities
│   │   │   │   ├── 📄 buildTripPayload.ts # Data preparation
│   │   │   │   ├── 📄 geocode.ts    # Location services
│   │   │   │   └── 📄 tripSanitizer.ts # Data validation
│   │   │   └── 📄 index.tsx         # Main trip planner component
│   │   └── 📄 index.tsx             # App group registry
│   ├── 📁 auth/                     # Authentication components
│   │   ├── 📄 ActivationGuard.tsx   # API key validation
│   │   └── 📄 index.tsx             # Auth exports
│   ├── 📁 components/               # Shared UI components
│   │   ├── 📄 ErrorModal.tsx        # Error display component
│   │   ├── 📄 ResizableLayout.tsx   # Layout management
│   │   ├── 📄 SaveControls.tsx      # Save/load controls
│   │   └── 📄 SavedItemsList.tsx    # Saved items display
│   ├── 📁 context/                  # React context providers
│   │   ├── 📄 ErrorContext.tsx      # Global error handling
│   │   └── 📄 ShellContext.tsx      # Shell state management
│   ├── 📁 services/                 # Frontend API services
│   │   ├── 📄 activateService.ts    # Activation API client
│   │   ├── 📄 persistenceService.ts # Data persistence client
│   │   └── 📄 userService.ts        # User management client
│   ├── 📁 Shell/                    # Application shell components
│   │   ├── 📄 AppHeader.tsx         # Application header
│   │   ├── 📄 AppTile.tsx           # App selection tiles
│   │   ├── 📄 HomeView.tsx          # Home screen
│   │   ├── 📄 index.tsx             # Shell main component
│   │   ├── 📄 ShellBody.tsx         # Shell content area
│   │   └── 📄 ShellHeader.tsx       # Shell header
│   ├── 📁 types/                    # TypeScript type definitions
│   │   └── 📄 electron.d.ts         # Electron API types
│   ├── 📁 utils/                    # Utility functions
│   │   └── 📄 storage.ts            # Local storage utilities
│   ├── 📄 App.tsx                   # Root React component
│   ├── 📄 global.css                # Global styles
│   ├── 📄 Home.tsx                  # Home page component
│   ├── 📄 main.tsx                  # React application entry
│   └── 📄 theme.ts                  # Design system theme
├── 📄 declarations.d.ts             # Global type declarations
├── 📄 index.css                     # Base CSS styles
├── 📄 index.html                    # HTML template
├── 📄 package.json                  # Frontend dependencies
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 tsconfig.tsbuildinfo          # TypeScript build cache
└── 📄 vite.config.ts                # Vite build configuration
```

**Key Features**:
- **Modular Apps**: Each Gem application is self-contained with its own components, services, and utilities
- **Shared Infrastructure**: Common components, themes, and utilities shared across all apps
- **Shell System**: Extensible shell for app navigation and management
- **Type Safety**: Full TypeScript integration with strict type checking

### 📚 Shared Packages (`packages/`)

#### Database Package (`packages/db/`)

**Purpose**: SQLite database abstraction and management

```
packages/db/
├── 📁 src/
│   ├── 📄 db.ts                     # Database model implementation
│   └── 📄 index.ts                  # Package exports
├── 📄 package.json                  # Database package configuration
├── 📄 tsconfig.json                 # TypeScript configuration
└── 📄 tsconfig.tsbuildinfo          # Build cache
```

**Key Features**:
- **WASM Integration**: SQLite WebAssembly for client-side database
- **Schema Management**: Automatic table creation and migration
- **Production Paths**: Dynamic path resolution for development/production
- **Transaction Safety**: Automatic disk synchronization

#### Shared Types Package (`packages/shared/`)

**Purpose**: Common type definitions and interfaces

```
packages/shared/
├── 📁 src/
│   ├── 📄 index.ts                  # Package exports
│   └── 📄 types.ts                  # Type definitions
├── 📄 package.json                  # Shared package configuration
├── 📄 tsconfig.json                 # TypeScript configuration
└── 📄 tsconfig.tsbuildinfo          # Build cache
```

**Key Types**:
- **API Interfaces**: Request/response type definitions
- **Application Models**: User, settings, and data structures
- **AI Integration**: Gemini API types and workflow definitions
- **Shell System**: App registration and navigation types

### 🔧 Build Scripts (`scripts/`)

**Purpose**: Development and build automation

```
scripts/
├── 📄 build-all.js                  # Complete build pipeline
├── 📄 build.js                      # Core build script
├── 📄 clean.js                      # Cleanup utilities
├── 📄 copy-wasm.js                  # WASM file management
├── 📄 dev.js                        # Development server orchestration
└── 📄 dist.js                       # Production distribution
```

**Build Pipeline**:
1. **Dependency Resolution**: Install and link workspace packages
2. **Type Compilation**: TypeScript compilation with project references
3. **Bundle Creation**: ESBuild for server, Vite for frontend
4. **Asset Management**: WASM files, static assets, and resources
5. **Package Creation**: Electron Builder for desktop distribution

### 📄 Configuration Files

#### Root Configuration
- **`package.json`**: Workspace configuration and script definitions
- **`tsconfig.base.json`**: Base TypeScript configuration with project references
- **`.env`**: Environment variables (API keys, development settings)
- **`.gitignore`**: Version control exclusions
- **`.npmrc`**: NPM configuration and registry settings

#### Application-Specific Configuration
- **Desktop**: Electron Builder configuration for packaging and distribution
- **Server**: ESBuild configuration for production bundling
- **Web**: Vite configuration for development and build optimization
- **Packages**: Individual TypeScript configurations for each package

## Architecture Benefits

### 🏗️ Monorepo Advantages
- **Unified Dependencies**: Shared tooling and consistent versions
- **Type Safety**: Cross-package type checking and validation
- **Build Optimization**: Incremental builds with project references
- **Code Sharing**: Reusable components and utilities

### 🔌 Extensibility Design
- **Plugin Architecture**: Easy addition of new Gem applications
- **Agent System**: Modular AI functionality with workflow coordination
- **MCP Integration**: Standardized tool and resource management
- **Shell Framework**: Consistent navigation and app management

### 🚀 Performance Optimization
- **Local-First**: SQLite database for offline capability
- **Process Isolation**: Separate processes for stability and security
- **Lazy Loading**: Component-level code splitting
- **Caching Strategy**: Multi-level caching for AI responses and data

### 🔒 Security Architecture
- **Process Sandboxing**: Isolated Electron renderer processes
- **API Key Management**: Secure storage with encryption
- **Content Security**: Strict CSP and input validation
- **PII Protection**: Anonymization for AI processing

This structure provides a scalable foundation for the Gem Suite ecosystem while maintaining clear separation of concerns and enabling future extensibility.
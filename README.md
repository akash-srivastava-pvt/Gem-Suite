gem-suite/
├── apps/
│   ├── desktop/          # Electron Container
│   │   ├── assets/       # icon.ico
│   │   ├── src/          # main.ts, preload.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── server/           # Express Controller
│   │   ├── src/          # index.ts, controllers/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/              # React View
│       ├── src/          # App.tsx, services/
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
├── packages/
│   ├── db/               # SQL.js Model logic
│   └── shared/           # Interfaces/Types
├── scripts/              # build.js, dev.js, clean.js
├── .env                  # Local environment variables
├── package.json          # Root Workspaces
└── tsconfig.base.json    # Global TS rules
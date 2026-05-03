# AIFF Diligence Questions Responses

## 1. Funding
- **Capital raised to date:** $5 million in seed financing from angel investors and early-stage funds.
- **Current round:** Actively raising a $10 million Series A to accelerate product development and go‑to‑market.
- **Lead VC:** NextGen Ventures has committed to lead the round, with participation from Horizon Capital and several strategic angel partners.

## 2. AI Models & Technology

### Current Models in Use
- **Google**: Primarily Gemini 3 Pro for large‑scale natural language understanding and Nano Banana Pro for lightweight on‑device inference in the desktop client.
- **Other providers**: We also leverage OpenAI's GPT‑4o for rapid prototyping and occasionally use Meta's LLaMA family for internal experimentation.

### What’s Working Well
- Gemini 3 Pro delivers strong semantic understanding across a range of technical domains, powering our conversational agents and code‑generation workflows.
- Nano Banana Pro integrates smoothly into our Electron‑based desktop app, providing responsive offline assistance without sacrificing user privacy.
- Having multiple providers lets us compare latency and quality, giving us flexibility to route traffic based on cost and performance.

### What’s Not Working
- Large‑scale API costs are becoming a bottleneck as usage scales, particularly for complex code‑generation requests.
- Occasional hallucinations in niche or proprietary code contexts force us to implement extensive guardrails and validation layers.
- Real‑time, low‑latency requirements for the desktop client still suffer when relying solely on cloud models.

### Wishlist / Desired Developments
- A fine‑tunable variant of Gemini that can be customized on our own codebases without compromising data security.
- An efficient, small‑footprint model with the reasoning capabilities of Gemini for on‑device use that matches Nano Banana but with higher accuracy.
- Native support for code‑centric multimodal inputs (e.g. diffs, project structure) and built‑in tooling for semantic search.
- Deeper integration hooks/APIs so we can embed models directly into our CI/CD pipelines and cache layers.

### Exciting AI Integrations and Use Cases
- An AI assistant that spans all Gem‑Suite products (desktop, web and server) able to answer user questions, generate snippets, and automate tasks.
- Context‑aware code completion and refactoring recommendations powered by Google models, reducing development time for our customers.
- Personalized onboarding and learning paths that adapt based on user behaviour and proficiency, leveraging fine‑grained understanding of user data.
- Conversational search across internal documentation and project history, with the ability to execute simple commands directly from chat.

*Note: Replace bracketed sections with specific information as appropriate.*
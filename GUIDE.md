# Gem Suite — Deployment & User Guide

This guide explains one-time production setup tasks and step-by-step usage for the four modular apps in Gem Suite (the “Gems”). It is written for developers, operations teams, and non-technical judges or stakeholders testing the project at a hackathon.

Please follow the sections in order: first complete the production one-time activities before deploying, then use the quick user workflows to test each Gem.

----------------------------------------------------
# 1) Production One-Time Activities
----------------------------------------------------

These steps are required before your first production deployment. Complete them once per production environment.

## 1.1 Legal & Commercial Agreement

Before using Gem Suite in a production or enterprise setting, ensure the correct legal agreements are in place.

- Why: Protects both your organization and Gem Suite intellectual property, clarifies responsibilities for data, and enables enterprise support.

Checklist (Legal & Commercial)

- [ ] Sign an Enterprise Agreement with the vendor
- [ ] Execute an NDA if sensitive information will be shared
- [ ] Sign a Data Processing Addendum (DPA) if personal data is handled
- [ ] Confirm privacy commitments and local-first data handling assurances in writing (see Security & Privacy Notes)
- [ ] Confirm retention and deletion policies for user data

Notes for Hackathon Judges: If you are testing locally or in a non-corporate environment, a formal agreement may not be required. Still confirm with your organization whether you need a DPA before uploading real personal data.

## 1.2 API Activation Guide

Gem Suite uses AI APIs for content generation. Follow these steps to activate API access (example uses generic cloud/AI provider steps — replace with your provider’s console where appropriate).

Steps to enable AI APIs

1. Create a cloud project or account for Gem Suite (e.g., “gem-suite-prod”).
2. Enable required APIs in that project:
   - AI / Language API (e.g., Gemini, LLM, or provider equivalent)
   - Any other relevant APIs (speech, image, storage) depending on feature use
3. Create credentials:
   - Generate an API key or service account key for server-to-server calls
   - Optionally create a separate key for client-side demo/testing with strict limits
4. Store the secret safely (see Security Best Practices below).
5. Set environment variables in your production host or secret manager (see .env template below).
6. Configure rate limits and quotas:
   - Increase quota if you anticipate heavy use
   - Add alerting on usage thresholds

Security best practices

- Use a secrets manager (e.g., cloud provider Secret Manager, HashiCorp Vault) — do NOT commit keys to source control.
- Enforce key rotation on a regular schedule (e.g., every 90 days) and when an operator leaves
- Restrict API key access to minimal necessary IPs or service identities
- Use service accounts with least privilege for server-side use

Sample `.env` template (store locally or in a secrets manager):

```env
# Gem Suite environment variables
NODE_ENV=production
PORT=3000

# AI provider credentials
AI_API_KEY=replace_with_api_key
AI_API_ENDPOINT=https://api.example.com/v1

# Optional: analytics, telemetry
TELEMETRY_ENABLED=true
SENTRY_DSN=
```

Notes for Hackathon Judges: Use a test or trial API key with low quotas to avoid accidental high charges.

## 1.3 Infrastructure Setup (Optional but Recommended)

These items are optional but recommended for a smooth production experience.

- Desktop build signing (Windows / macOS)
  - Windows: Sign installers with an EV code signing cert to reduce SmartScreen warnings.
  - macOS: Notarize and sign the app bundle to avoid Gatekeeper warnings.
- Auto-update server setup
  - Host the update manifest and artifacts (for example, use a static blob storage URL or a small auto-update server under your control).
  - Ensure signed update artifacts to prevent tampering.
- Logging and telemetry opt-in
  - Provide an explicit opt-in for telemetry in the desktop app and document what is collected.
  - Centralize logs (optional) and mask PII before shipping.
- Offline-first storage validation
  - Verify local storage behavior: read/write operations, conflict resolution, and safe export/import.
  - Test data synchronization edge cases if any cloud sync is enabled.

----------------------------------------------------
# 2) How to Use the 4 Gems (Step-by-Step User Guide)
----------------------------------------------------

Gem Suite is a set of four focused productivity apps (Gems). Each Gem is small and modular so users can pick only what they need. The high-level workflow for testers:

- Install or open the Gem Suite desktop or web app
- Choose a Gem from the launcher
- Provide the minimum input requested and request AI generation
- Review and edit locally (Gem Suite is local-first)
- Export or share the final result

ASCII flow (high-level):

```
User -> Open Gem Suite -> Select Gem -> Provide Input -> AI Generate -> Review/Edit -> Save / Export
```

## 2.1 Resume Gem

What it does

- Helps users create professional resumes by guiding input and generating structured output based on templates and AI suggestions.

Step-by-step usage flow

1. Input profile details
   - Enter name, contact, summary, work history, education, skills.
2. Choose template
   - Pick from available visual and layout templates.
3. Generate resume
   - Click generate to produce a formatted resume draft using AI.
4. Edit locally
   - Make edits in the local editor (text and layout).
5. Export PDF/Docx
   - Export to PDF or DOCX and download or share.

Checklist for testers

- [ ] Enter a sample profile
- [ ] Try at least two templates
- [ ] Generate and edit content
- [ ] Export PDF and confirm formatting

## 2.2 Invitation Gem

What it does

- Creates event invitations with design themes and AI-assisted copy (short description, RSVP wording, directions).

Steps

1. Select event type
   - Examples: birthday, wedding, corporate, meetup.
2. Enter event details
   - Title, date/time, location, RSVP, special notes.
3. Choose design theme
   - Pick from available theme presets.
4. Generate invitation
   - AI creates copy and adapts wording for tone and formality.
5. Download/share
   - Export image or PDF, or copy a shareable link if hosting is enabled.

Checklist for testers

- [ ] Create at least one sample invitation per event type
- [ ] Validate copy and tone controls
- [ ] Export and review asset quality

## 2.3 Trip Planner Gem

What it does

- Produces travel itineraries and trip plans using user input and AI recommendations (transport, lodging suggestions, day-by-day plans).

Steps

1. Enter source, destination, trip type
   - Trip type examples: leisure, business, backpacking.
2. Select preferences (budget, transport, dates)
   - Provide travel dates and any constraints.
3. Generate itinerary
   - AI suggests day-by-day activities, travel legs, and durations.
4. Edit and save trip
   - Adjust times, add/remove activities, save locally.
5. Export/share plan
   - Export as PDF, share as link, or download JSON for integration.

Checklist for testers

- [ ] Generate an itinerary for a short (2–3 day) trip
- [ ] Test budget vs. luxury preference toggles
- [ ] Export plan and confirm readability

## 2.4 Text Editor Gem

What it does

- A local-first text editor with AI actions for rewriting, translating, summarizing, and grammar fixes.

Steps

1. Create/open document
   - Start a new doc or open a saved file.
2. Use AI actions (rewrite, translate, summarize, fix grammar)
   - Select text and apply the desired AI action.
3. Accept/Reject AI suggestions
   - Suggested rewrites appear inline — accept or reject changes.
4. Save locally
   - Save to local storage or export to a file.
5. Export document
   - Export as TXT, Markdown, or DOCX.

Checklist for testers

- [ ] Try editing and applying at least two AI actions
- [ ] Test saving and re-opening files
- [ ] Export to multiple formats

----------------------------------------------------
# Troubleshooting
----------------------------------------------------

Common issues and quick fixes

- API quota exceeded
  - Symptom: AI calls fail with 429 / "quota exceeded" errors
  - Fixes:
    1. Check API dashboard for usage and quotas
    2. Use a different key with sufficient quota or request a quota raise
    3. For testing, reduce parallel requests or use a smaller model

- Offline mode issues
  - Symptom: App reports no local data or fails to save edits
  - Fixes:
    1. Confirm disk write permissions (desktop) and storage path
    2. Check browser storage limits (web) and clear stale caches
    3. Export any recoverable data and re-import after clearing state

- Auto-update problems
  - Symptom: Updates fail or installer rejected by OS
  - Fixes:
    1. Confirm update manifest URL and signed artifacts
    2. Re-sign or notarize the build for platform-specific requirements

If you hit an issue not covered here, collect logs and a short reproduction and share them with the project maintainers for support.

----------------------------------------------------
# Security & Privacy Notes
----------------------------------------------------

- Local-first design: Gem Suite keeps user data on the local device by default. Cloud calls (AI generation) are transient — input may be sent to the configured AI provider only when the user requests an action that needs it.
- Minimize PII: Avoid uploading sensitive personal information during hackathon testing. Use synthetic or anonymized data when possible.
- Secrets: Never commit API keys to source control. Use environment variables or a secrets manager.
- Data retention: Respect user choice to delete local data and provide clear export / delete mechanisms.
- Access controls: If deploying shared servers, restrict access with authenticated service accounts and minimal network exposure.

----------------------------------------------------
# Appendix — Quick Testing Checklist (Hackathon Judges)
----------------------------------------------------

- [ ] Confirm legal acceptance where required (or use anonymized data)
- [ ] Create a provider API key and configure `.env`
- [ ] Start the app (desktop or web) and open each Gem
- [ ] Complete at least one full create -> edit -> export flow per Gem
- [ ] Test offline save/reopen for a Gem
- [ ] Try a failing scenario (API quota exceeded) to confirm graceful error handling

Thank you for testing Gem Suite — please report feedback, bugs, and ideas to the maintainers.

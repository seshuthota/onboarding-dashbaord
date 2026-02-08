# Onboarding Dashboard Plan (Frontend Only, AngularJS)

## Scope (Adjusted)
Build only the onboarding dashboard UI in AngularJS (1.x) for external customers to self-configure API integration settings.

This phase excludes:
- End-to-end transmission/runtime processing
- Delivery/retry pipelines
- Backend integration execution

## V1 Features
1. Customer login shell (mocked or pre-authenticated session).
2. Onboarding wizard to configure integration.
3. API format setup: `JSON` or `XML`.
4. Auth setup: `NoAuth`, `Basic`, `Bearer`, `OAuth2`, `API Key` (extensible).
5. Request configuration: URL, method, headers, query params, payload sample.
6. Validation UI (client-side): required fields, URL format, JSON/XML syntax.
7. Review + confirm page.
8. Save draft and load draft (initially via localStorage or mock API).

## AngularJS App Structure
1. `app.module.js` (root module).
2. `app.routes.js` using `ui-router`:
   - `/dashboard`
   - `/onboarding/start`
   - `/onboarding/format`
   - `/onboarding/auth`
   - `/onboarding/request`
   - `/onboarding/mapping`
   - `/onboarding/review`
   - `/onboarding/success`
3. Feature modules:
   - `onboarding.core` (models/services)
   - `onboarding.wizard` (step container)
   - `onboarding.auth` (auth-type components)
   - `onboarding.format` (json/xml editors + validators)
4. Shared components:
   - Stepper
   - Form field renderer
   - Validation summary
   - Confirmation modal

## Frontend Data Model
Use one `OnboardingConfig` object:
1. `customer`: name, environment
2. `api`: baseUrl, endpoint, method, timeout, headers, queryParams
3. `format`: type (`json|xml`), schema/samplePayload
4. `auth`: type + type-specific fields
5. `mapping`: sourceField -> targetField mappings
6. `meta`: draftId, version, updatedAt

## Dynamic Auth Form Strategy
Config-driven rendering:
1. Auth type dropdown.
2. Render type-specific fields based on selection:
   - `Basic`: username, password
   - `Bearer`: token
   - `OAuth2`: tokenUrl, clientId, clientSecret, scopes
   - `API Key`: key name, key value, placement (`header`/`query`)
3. Per-type validation rules and inline error states.

## Validation Plan (Frontend)
1. Required field validation on blur and on next-step.
2. URL and HTTP method validation.
3. JSON lint validation.
4. XML parse validation.
5. Step completion guard: block forward navigation until current step is valid.
6. Final review highlights missing/invalid fields before submit.

## State Management
1. `OnboardingStateService` for in-memory state across wizard steps.
2. Persist drafts:
   - Phase A: `localStorage`
   - Phase B: backend endpoint (`/drafts`) when available
3. Unsaved-changes warning on route transitions.

## UX Flow
1. Dashboard landing with `Create Integration`.
2. Wizard with 6 steps and progress indicator.
3. Sticky action bar: `Back`, `Save Draft`, `Next`.
4. Review screen with editable sections.
5. Success page with summary and `Download Config JSON`.

## Delivery Plan
1. Week 1: Scaffold app, routing, stepper, shared layout.
2. Week 2: Format/auth/request steps with validations.
3. Week 3: Mapping + review + draft save/load.
4. Week 4: Polish, accessibility, QA fixes.

## Definition of Done
1. User can complete onboarding flow end-to-end in UI.
2. All auth types render and validate correctly.
3. JSON/XML inputs validate client-side.
4. Draft save/load works.
5. Review and submit produce final config payload object.

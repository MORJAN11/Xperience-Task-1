# Event RSVP Manager — Design Document

---

## Step 01 — Setup

**AI Partner used:** Claude (Anthropic)  
**Method:** Iterative prompt-and-refine — each step was discussed with the AI, output was reviewed and edited before copying into this file. Raw AI back-and-forth stays out of this document.

---

## Step 02 — Raw Feature Brief

> Captured verbatim from the task brief before any analysis.

- A user can create an event with a title, description, date/time, location, and optional max-capacity.
- The creator becomes the **host** of that event.
- The host can invite people by email.
- Each invitee receives a unique link and can respond: **Yes / No / Maybe**.
- The host sees a live attendance dashboard with counts and a list of attendees.
- If the event has a max-capacity and it is reached, new "Yes" RSVPs go to a **waitlist**.
- A waitlisted attendee automatically moves to confirmed if a confirmed attendee changes their RSVP to No.
- The host can cancel the event or close it to further responses at any time.
- An invitee can change their RSVP at any point **before** the event starts.
- After the event start time, all RSVPs are locked.

---

## Step 03 — Problem Statement

Event hosts need a simple, web-based system to collect, track, and manage RSVPs from invitees. The system must handle optional capacity limits, promote waitlisted attendees automatically when a confirmed spot is freed, and lock all RSVPs once the event starts — without requiring user accounts.

---

## Step 04 — Goals and Non-Goals

### Goals
- Host can create an event (title, description, date/time, location, optional max-capacity)
- Host can invite people by email; each invitee gets a unique response link
- Invitees can respond Yes, No, or Maybe via their unique link
- Host sees a live attendance dashboard with counts per status
- System enforces capacity: excess Yes responses become Waitlisted
- A waitlisted invitee is automatically promoted when a confirmed attendee switches to No
- Host can cancel or close the event at any time
- Invitees can change their response before the event starts
- RSVPs are locked after the event start time

### Non-Goals
- User authentication or login
- Email delivery of invitations (links are generated; delivery is out of scope)
- Integration with calendar systems (Google Calendar, Outlook, etc.)
- Video conferencing or streaming
- Multiple simultaneous events per host
- Event editing after creation

---

## Step 05 — Context and Constraints

### Context
- Spring Boot 4 backend, PostgreSQL database
- React 19 + TypeScript frontend, Vite build tool
- Single-sprint implementation, no existing users or data
- No user authentication — identity is established via email + unique token

### Constraints
- Event start time is the hard lock point for RSVPs; the system checks this on every response attempt
- Max capacity is optional; if set, it is immutable after event creation
- One RSVP per email address per event (enforced by unique constraint)
- Waitlist promotion must be atomic — two simultaneous promotions for the same spot must not both succeed

---

## Step 06 — Facts, Assumptions, and Open Questions

### Facts
- The event creator is the host
- RSVPs are tied to email addresses, not user accounts
- Each invitee receives exactly one unique token used to identify them
- Capacity limit, if set, applies only to YES responses (not Maybe)
- The system auto-transitions event status to LOCKED at startDateTime

### Assumptions
- Email addresses entered by the host are valid and reachable
- Event start time is supplied in the local timezone of the browser and stored as-is
- Hosts and invitees access the system from modern browsers
- Concurrent bulk RSVPs (e.g., 100 simultaneous Yes responses) are not expected at this scale

### Open Questions
- Should invitees be able to see other attendees' names or response statuses?
- Should the host be able to manually override an invitee's RSVP?
- How long should unique RSVP links remain valid after the event ends?
- What happens to data if the host cancels the event — is it soft-deleted or hard-deleted?

---

## Step 07 — Actors and Workflows

### Actors
- **Host** — Creates the event, invites people, monitors the dashboard, manages event lifecycle
- **Invitee** — Receives a unique link, responds Yes/No/Maybe, can update response before event starts
- **System** — Enforces capacity, promotes waitlisted invitees, locks RSVPs after start time

### Host Workflow
1. Create event (title, description, date/time, location, optional max-capacity, host email)
2. Add invitees by email — system generates a unique RSVP link per invitee
3. Share RSVP links with invitees (copy from the invite page)
4. Monitor live dashboard: see confirmed / maybe / declined / waitlisted counts and attendee list
5. Optionally cancel the event or close it to further responses at any time

### Invitee Workflow
1. Receive unique RSVP link from host
2. Open link — see invitation response page showing current status
3. Select Yes, No, or Maybe
4. If event is at capacity and response is Yes → automatically placed on Waitlist
5. Can change response at any time before event start time
6. After event start time → response page shows status as locked, no changes accepted

---

## Step 08 — Invariants

These must hold at all times regardless of concurrent access or partial failures.

- **Capacity Invariant**: The count of YES RSVPs for an event never exceeds maxCapacity (when set)
- **Waitlist Promotion**: When a YES RSVP changes to NO and a spot opens, exactly one waitlisted invitee (the earliest by creation time) is promoted to YES atomically
- **Lock After Start**: No RSVP create or update is accepted after the event's startDateTime
- **Email Uniqueness**: Exactly one RSVP record exists per (email, event) pair
- **Host Ownership**: Only the host (matched by hostEmail) can cancel, close, or view the management dashboard for an event
- **State Consistency**: A CANCELLED or CLOSED event does not accept new RSVP responses

---

## Step 09 — First-Pass Architecture

**Backend (Spring Boot):**
```
EventController / RSVPController   ← HTTP layer
         ↓
EventService / RSVPService         ← Business logic, invariants enforced here
         ↓
EventRepository / InviteeRepository / RSVPRepository   ← Spring Data JPA
         ↓
PostgreSQL — schema: hero
  Tables: events, invitees, rsvps
```

**Key Backend Components:**
- `EventController` — `POST /api/events`, `GET /api/events/{id}`, `POST /api/events/{id}/invite`, `GET /api/events/{id}/invitees`, `POST /api/events/{id}/cancel`, `POST /api/events/{id}/close`, `GET /api/events/{id}/dashboard`
- `RSVPController` — `GET /api/rsvp/{token}`, `POST /api/rsvp/{token}`, `PUT /api/rsvp/{token}`
- `EventService` — event creation, invite management, dashboard aggregation, cancel/close
- `RSVPService` — response recording, capacity check, waitlist promotion (all in one transaction)

**Frontend (React + TypeScript):**
- `CreateEvent` — form to create a new event
- `InviteAttendees` — add invitee emails, display generated RSVP links with copy buttons
- `HostDashboard` — live counts, attendee list, RSVP links, cancel/close actions; polls every 5 seconds
- `RSVPResponse` — invitee-facing page loaded via `?token=…` URL param

---

## Step 10 — Data Ownership and State Model

### Entities

**Event**
| Field | Type | Notes |
|---|---|---|
| id | bigint PK | auto-generated |
| title | varchar | required |
| description | text | optional |
| location | varchar | required |
| startDateTime | timestamp | required; triggers lock |
| maxCapacity | integer | optional; immutable after creation |
| hostEmail | varchar | identifies the host |
| status | enum | see state machine below |
| createdAt / updatedAt | timestamp | audit fields |

**Invitee**
| Field | Type | Notes |
|---|---|---|
| id | bigint PK | auto-generated |
| eventId | FK → events | |
| email | varchar | unique per event |
| uniqueToken | varchar | UUID; used in RSVP link |

**RSVP**
| Field | Type | Notes |
|---|---|---|
| id | bigint PK | auto-generated |
| inviteeId | FK → invitees | |
| eventId | FK → events | |
| status | enum | YES / NO / MAYBE / WAITLISTED |
| respondedAt | timestamp | last response time |
| createdAt / updatedAt | timestamp | audit fields |

### State Machines

**Event status:**
```
OPEN_FOR_RSVPS
   → LOCKED     (automatic, when now ≥ startDateTime)
   → CANCELLED  (host action)
   → CLOSED     (host action)
```

**RSVP status:**
```
(none) → MAYBE / YES / NO   (first response)
YES    → NO / MAYBE          (invitee changes mind; may trigger waitlist promotion)
NO     → YES / MAYBE         (invitee changes mind; subject to capacity check)
WAITLISTED → YES             (system promotes when a confirmed spot opens)
```

---

## Step 11 — Trust Boundaries and Security

| Boundary | Rule |
|---|---|
| Host identity | No login; host is identified by the email they typed at creation. Any request with the correct hostEmail + eventId is treated as the host. |
| Invitee identity | No login; identified by uniqueToken in URL. Tokens are UUIDs — guessing one is computationally infeasible. |
| Data visibility | Invitee response page shows only that invitee's own status. Dashboard is only accessible with the correct hostEmail. |
| Email validation | Basic format check only; no email verification step. |
| Token lifetime | Tokens do not expire in the current design (open question). |
| Sensitive data | Invitee emails are not exposed to other invitees through any API response. |

---

## Step 12 — Concurrency and Correctness

**Scenario 1: Two invitees RSVP "Yes" simultaneously when exactly one spot remains**
- Both requests enter `RSVPService.respondToRSVP` in parallel
- Both read `confirmedCount = maxCapacity - 1` (one spot free) before either writes
- Without protection: both would write YES → capacity exceeded
- **Solution**: the `countConfirmedByEventId` query and RSVP insert run inside a `@Transactional` method; PostgreSQL's default READ COMMITTED isolation plus the unique constraint on (invitee_id, event_id) ensures only one write succeeds as YES; the other sees capacity full and is written as WAITLISTED

**Scenario 2: Two confirmed attendees change to No simultaneously, two waitlisted people waiting**
- Both trigger `promoteFromWaitlist` inside their transaction
- **Solution**: `findFirstWaitlistedByEventId` runs inside the same transaction; row-level locking via JPA prevents double-promotion of the same waitlisted record

---

## Step 13 — Scalability and Multi-Tenancy

- **Not multi-tenant**: each event is independent; no shared state between events
- **Expected scale**: tens of events, hundreds of RSVPs — no sharding or caching required
- **Database indexes**: `event_id` on both `invitees` and `rsvps` tables for fast dashboard queries; `unique_token` on `invitees` for O(1) token lookup
- **Dashboard polling**: frontend polls every 5 seconds via HTTP; acceptable at this scale; WebSockets would be considered if the event count or attendee count grew by 10×

---

## Step 14 — Risks and Failure Modes

| Risk | Impact | Mitigation |
|---|---|---|
| Host forgets host email | Cannot access dashboard or manage event | No recovery path in current design — open question for future auth |
| Invitee shares their RSVP link | Another person can respond on their behalf | Acceptable for no-auth MVP; token is the only identity |
| Race condition on capacity check | More confirmed than capacity | `@Transactional` + DB unique constraints (see Step 12) |
| Event start time in wrong timezone | RSVP lock triggers at wrong time | Browser supplies local time; no server-side timezone conversion — assumption documented in Step 06 |
| No email delivery | Invitees never receive their link | Out of scope; host must manually share links |
| Data loss | All event data lost | PostgreSQL durability; production backup assumed |

---

## Step 15 — Alternatives and Tradeoffs

**Alt 1: User Accounts vs. Email + Token**
- Pro (accounts): persistent host identity, more secure, recoverable
- Con (accounts): login/auth adds a full sprint of complexity; friction for a simple use case
- **Decision**: Email + token for MVP. Revisit if host-identity problems appear in practice.

**Alt 2: WebSocket vs. HTTP Polling for Dashboard**
- Pro (WebSocket): true real-time, no unnecessary requests
- Con (WebSocket): requires additional infrastructure; overkill for tens of attendees
- **Decision**: HTTP polling every 5 seconds. Sufficient for expected scale.

**Alt 3: Automatic vs. Manual Waitlist Promotion**
- Pro (automatic): invitees don't wait for host action
- Con (automatic): must handle the case where multiple spots free at once correctly
- **Decision**: Automatic promotion, implemented atomically per freed spot (one promotion per cancellation).

**Alt 4: Immutable Max Capacity vs. Editable**
- Pro (editable): host can increase capacity after inviting
- Con (editable): requires re-checking all waitlisted invitees on each edit; complex
- **Decision**: Immutable after creation to keep capacity logic simple.

---

## Step 16 — Rollout and Migration Notes

- **No existing data**: fresh PostgreSQL schema; Hibernate `ddl-auto: update` creates all tables on first boot
- **No rollout phases**: single-sprint, deploy backend and frontend together
- **Schema migration path**: if user accounts are added later, `events.host_email` becomes a FK to a `users` table; `invitees.unique_token` remains as-is
- **No backwards-compatibility concerns**: no prior version of this system exists

---

## Step 17 — Pre-Review Weakness Check

Checking the completed design against the Definition of Success:

| Criterion | Met? | Notes |
|---|---|---|
| Clear problem statement | Yes | Step 03 |
| Bounded scope with explicit non-goals | Yes | Step 04 |
| Facts separated from assumptions | Yes | Step 06 |
| Explicit workflows for all actors | Yes | Step 07 — Host, Invitee, System |
| Named invariants | Yes | Step 08 — 6 named invariants |
| Real architecture boundaries | Yes | Step 09 — layers named, endpoints listed |
| Explicit state ownership | Yes | Step 10 — state machines for Event and RSVP |
| Trust boundary treatment | Yes | Step 11 |
| Concurrency scenario addressed | Yes | Step 12 — two simultaneous Yes scenario |
| Scalability treatment | Yes | Step 13 |
| Visible risks and tradeoffs | Yes | Steps 14 and 15 |
| Unresolved open questions | Yes | Step 06 — 4 open questions listed |

**Remaining weaknesses:**
- Host identity has no recovery path (by design for MVP — documented as open question)
- No email delivery mechanism (explicitly out of scope)
- Timezone handling is assumption-based, not enforced server-side

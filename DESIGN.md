# Event RSVP Manager - Design Document

> **Status**: First Draft  
> **Last Updated**: June 3, 2026  
> **Author**: Xperience Task 01 Team  

---

## 1. Problem Statement

Event hosts need a simple, web-based system to collect, track, and manage RSVPs from invitees. The system must handle capacity limits, automatic waitlist promotion, and lock RSVPs after the event starts.

---

## 2. Goals and Non-Goals

### Goals
- Hosts can create events and invite people by email
- Invitees can respond: Yes, No, Maybe via unique link
- Hosts see real-time attendance dashboard
- Capacity management with automatic waitlist
- Invitees can change RSVP before event starts
- RSVPs are locked after event start time

### Non-Goals
- User authentication/authorization (no login required)
- Event reminders or notifications
- Integration with calendar systems
- Video conferencing or streaming
- Multiple events per host (scope: single event management)

---

## 3. Context and Constraints

### Context
- Spring Boot backend with PostgreSQL
- React/TypeScript frontend with Vite
- Single-sprint implementation
- No user authentication (public events)

### Constraints
- Event start time determines RSVP lock
- Max capacity is optional but immutable once set
- Invitee email uniqueness within an event
- Waitlist movement must be atomic

---

## 4. Facts, Assumptions, and Open Questions

### Facts
- Event creator is the host
- RSVPs are tied to email addresses
- Each invitee gets a unique response link
- Capacity limit is per event, not global

### Assumptions
- Email addresses are valid and unique within an event
- Event start time is in UTC/ISO format
- Hosts and invitees use the same browser
- No concurrent bulk RSVP operations

### Open Questions
- Should invitees see other attendees' responses?
- Should hosts be able to edit attendee responses?
- How long are unique RSVP links valid?
- What happens if host deletes the event?

---

## 5. Actors and Workflows

### Actors
- **Host**: Creates event, invites people, views dashboard, manages event
- **Invitee**: Receives invite link, responds with Yes/No/Maybe, can change response
- **System**: Manages state transitions, capacity tracking, waitlist promotion

### Workflows

**Host Workflow:**
1. Create event (title, description, date/time, location, max capacity)
2. Invite people by email
3. View real-time dashboard showing responses and counts
4. Cancel event or close it to further responses

**Invitee Workflow:**
1. Receive email with unique response link
2. Click link to open response page
3. Select Yes/No/Maybe
4. If event is at capacity: invited as "Waitlisted"
5. Can change response anytime before event starts
6. After event start: RSVP locked

---

## 6. Invariants

- **Capacity Invariant**: Confirmed count ≤ max capacity (or 0 if no limit)
- **Waitlist Promotion**: When confirmed attendee changes to No, first waitlisted moves to confirmed
- **Lock After Start**: No RSVP changes allowed after event start time
- **Email Uniqueness**: One RSVP per email per event
- **Host Ownership**: Only event creator can modify/cancel event
- **State Consistency**: Event status gates what actions are allowed

---

## 7. Architecture

### First-Pass Architecture

**Backend (Spring Boot):**
```
Controller Layer
  ↓
Service Layer (business logic)
  ↓
Repository Layer (data access)
  ↓
PostgreSQL (Event, Invitee, RSVP tables)
```

**Key Components:**
- `EventController` - Create/view/cancel/close events
- `EventService` - Event logic, capacity checking
- `RSVPController` - Accept/update RSVP responses
- `RSVPService` - RSVP logic, waitlist promotion
- `EventRepository`, `InviteeRepository`, `RSVPRepository` - Data access

**Frontend (React):**
- Event creation page
- Invite management page
- Host dashboard (attendance tracking)
- Invitee response page (via unique link)

### Data Ownership and State Model

**Core Entities:**

**Event**
- title, description, location
- startDateTime, maxCapacity (optional)
- createdBy (host email)
- status: DRAFT, OPEN_FOR_RSVPS, LOCKED, CANCELLED, CLOSED
- createdAt, updatedAt

**Invitee**
- email
- eventId
- uniqueToken (for response link)

**RSVP**
- inviteeId, eventId
- status: YES, NO, MAYBE, WAITLISTED
- respondedAt

**State Machines:**
- Event: DRAFT → OPEN_FOR_RSVPS → LOCKED (auto, at startDateTime) or CANCELLED or CLOSED
- RSVP: YES/NO/MAYBE or WAITLISTED (if capacity reached)

---

## 8. Trust, Security, and Operational Notes

### Trust Boundaries and Security

- **No authentication** - Anyone can visit
- **Host Access Control**: Only creator can modify event (need to track host somehow)
- **RSVP Link Security**: Unique token prevents guessing
- **Email Validation**: Basic format check, no verification required
- **No sensitive data exposure**: Don't reveal other invitees' emails or responses

### Concurrency and Correctness

**Critical Scenario**: Two invitees RSVP "Yes" simultaneously when exactly one spot remains
- Solution: Database transaction on capacity check → insert RSVP with status
- One succeeds with YES, other auto-assigned WAITLISTED

**Waitlist Promotion**: When host changes response from Yes to No
- Transaction: Decrement confirmed count, find first waitlisted, promote to YES
- Must be atomic to prevent double-promotion

### Scalability and Multi-Tenancy

- **Not multi-tenant**: Each event is isolated
- **Expected scale**: Single sprint, small number of concurrent events
- **Indexing**: eventId, inviteeId for fast lookups
- **No sharding needed** at this scale

---

## 9. Risks and Failure Modes

**Risk: Email Uniqueness**
- If invitee invited twice with different emails, creates duplicate RSVPs
- Mitigation: Unique constraint on (event, email)

**Risk: Race Condition on Capacity**
- Multiple simultaneous Yes responses → might accept more than capacity
- Mitigation: Database-level transaction with row-level lock

**Risk: Host Identity**
- No auth, so how do we know who the host is when they return?
- Mitigation: Email-based host link (like invitees get) or simple session

**Risk: Data Loss**
- No backup strategy mentioned
- Mitigation: PostgreSQL handles this; assume production backup in place

---

## 10. Alternatives and Tradeoffs

**Alt 1: User Accounts**
- Pro: Can track host across sessions, more secure
- Con: Adds auth complexity, friction for simple use case
- **Decision**: Skip for MVP, use email + token

**Alt 2: WebSocket for Live Dashboard**
- Pro: Real-time updates without refresh
- Con: More infrastructure, not essential for MVP
- **Decision**: HTTP polling sufficient for now

**Alt 3: Automatic Waitlist to Confirmed**
- Pro: Faster, no manual steps
- Con: Only works if one spot frees; might miss second, third, etc.
- **Decision**: Implement with transaction to handle sequentially

---

## 11. Rollout and Migration Notes

- **No existing data**: Fresh PostgreSQL schema
- **No rollout phases**: Single-sprint sprint, deploy everything at once
- **Future migration**: If we add user accounts, need to link events to user IDs

---

## Appendix: Raw Feature Brief (Working Notes)

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

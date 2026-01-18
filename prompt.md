# prompt.md — Dice Temple (Railway-deployable lightweight JS app)

You are Claude acting as a senior full-stack JavaScript engineer + product-minded implementer. Build a small real-time web app that a group of 5 friends can use as a Dungeons & Dragons–esque dice rolling tool.

## High-level goal
Create a lightweight JavaScript app that can be deployed easily on Railway. It supports 5 concurrent users in one shared session:
- 4 Players
- 1 Dungeon Master (DM)

Everyone can roll common TTRPG dice with a satisfying animated roll. Each roll is recorded in a shared scrolling roll-history panel. The DM can optionally hide their roll results from the other players.

---

## Core features

### Dice set (each user has these buttons/dice)
- D4  (1–4)
- D6  (1–6)
- D8  (1–8)
- D10 (1–10)
- D00 (percentile tens: 10, 20, …, 100)
- D12 (1–12)
- D20 (1–20)

### Rolling behavior
- When a user clicks/taps a die, an animated roll plays in that user’s UI box (their “edge” of the board).
- The roll resolves to a random value (uniform distribution across valid faces).
- After resolution, the app emits a “roll event” to all connected clients and appends it to roll history.

### Roll history
- A scrollable history box shows newest rolls at the bottom (or top—pick one, but keep consistent).
- Each entry includes:
  - timestamp (HH:MM:SS is enough)
  - roller name
  - die type (e.g., D20)
  - result (value)
- History should be shared and synchronized live for all users.
- History autoscrolls to the newest entry (unless the user has manually scrolled up; implement a simple “stick to bottom unless user scrolls away” behavior if easy, otherwise always autoscroll).

### DM hidden rolls
- The DM has a toggle: “Hide my rolls”.
- If enabled:
  - Other players see the history entry as: “DM rolled D20 — hidden” (no result).
  - The DM still sees their own actual result locally and in their own history view (either show the number or include a “(hidden to others)” note).
- If disabled:
  - Everyone sees the DM result like normal.

---

## Layout / UI requirements

### Scene / background
- Fill the screen with:
  - a 2D grid (subtle)
  - a 2D “temple-like” texture background
- This is a visual theme layer behind the UI.

### Player boxes at edges
There are 5 overlay boxes positioned around the “board” (temple background):
- Top edge: DM box (recommended)
- Bottom edge: Player box
- Left edge: Player box
- Right edge: Player box
- One remaining player box can be placed bottom-left/bottom-right or another sensible edge position.
(Choose a clean arrangement that works on common screens; prioritize usability over perfect symmetry.)

Each box includes:
- Player name + role label
- Dice controls (buttons for D4, D6, etc.)
- Dice animation area (where the roll animation appears)
- A small indicator if the user is disconnected (optional)

### Responsive design
- Must work on desktop and mobile.
- On narrow screens, you may stack boxes or use a simplified layout (e.g., collapsible panels), but keep the “temple board” feeling if possible.
- Keep the app lightweight—avoid heavy frameworks unless truly needed.

---

## Real-time / multiplayer requirements
- State is shared live across clients:
  - connected users / assigned roles
  - roll history
  - DM hide toggle state (only impacts what is broadcast)
- Multiple clients connect via WebSockets.
- Hard cap: 5 concurrent users in a single room/session.

### Joining / identity (keep it simple)
Implement a simple join flow:
- Landing screen asks for:
  - Display name
  - Role: Player or DM
- DM should be protected by a shared secret so a random friend can’t accidentally join as DM:
  - Use an environment variable like `DM_SECRET`.
  - If role=DM, require entering the secret.
- Players can join without a secret.

You may optionally implement a single shared `ROOM_CODE` env var for everyone to join the same session, but it’s not required. Keep it simple.

---

## Tech constraints & deployment on Railway

### Must be easy to deploy on Railway
- Provide a Node.js server that serves the client and hosts WebSockets.
- Use `process.env.PORT`.
- Provide `package.json` scripts that work with Railway’s default build/run:
  - `npm install`
  - `npm run build`
  - `npm start`

### Recommended architecture (keep lightweight)
Use:
- **Node + Express** for serving static files and API (if any)
- **Socket.IO** (or ws) for real-time events
- Client: **Vanilla JS + Vite** (or minimal React if you think it’s worth it; prefer vanilla for “lightweight”)
- Styling: plain CSS (or a tiny utility approach). No huge UI libs.

No database required initially:
- Store roll history in memory on the server.
- On server restart, history resets (acceptable)



## Plan: Let the owner edit waiter names

Currently, waiter names are hardcoded as `const WAITERS` in `LoginScreen.tsx`. We'll move this list into the POS context so the owner can manage it.

### Changes

1. **`src/context/POSContext.tsx`** — Add `waiters: string[]` and `setWaiters` to context state, initialized with the default 6 names.

2. **`src/pages/LoginScreen.tsx`** — Remove the hardcoded `WAITERS` array; read `waiters` from `usePOS()` instead.

3. **`src/pages/OwnerPanel.tsx`** — Add a "Gestionar meseros" (Manage waiters) quick action that opens a modal where the owner can:
   - See the current list of waiter names
   - Edit any name inline
   - Add a new waiter
   - Remove a waiter
   - Save changes

All state stays in-memory via context (same pattern as the rest of the app).


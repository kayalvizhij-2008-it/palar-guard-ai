---
name: emil-design-eng
description: "Emil Kowalski design engineering principles. Delivers high-polish micro-interactions, responsive button feedback, spring physics, origin-aware transitions, and sub-300ms timing discipline."
---

# Emil Kowalski Design Engineering Toolkit

Great software feels physical, immediate, and responsive. Polish is the accumulation of unseen, meticulous micro-details.

## Golden Interaction Rules

1. **Active & Press States**:
   - Every clickable button or interactive card must have a tactile press state: `active:scale-[0.98]` or subtle brightness reduction.
   - Feedback must occur within 100ms of user contact.

2. **Spring Physics & Timing**:
   - Prefer realistic spring physics over linear or harsh ease-in transitions.
   - Recommended Framer Motion spring: `{ type: "spring", stiffness: 400, damping: 30 }`.
   - Micro-interactions must stay between 150ms and 250ms. Never make the user wait for a decorative animation.

3. **Origin-Aware Transitions**:
   - Modals and popovers should expand outward from the trigger element or center with subtle scale (`scale from 0.95 to 1.0` and `opacity 0 to 1`).
   - Never animate entering elements from `scale(0)` (which looks cartoony and unnatural).

4. **Smooth Dismissal**:
   - Exit animations should be 30-40% faster than entry animations to keep the interface feeling snappy and responsive.

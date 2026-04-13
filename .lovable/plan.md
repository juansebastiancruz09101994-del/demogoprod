

## Fix: Propagation should only recalculate the locked variable

### Problem
When a value propagates from parent to child, the current code guesses which variable to recalculate by looking for empty/zero fields. This causes it to overwrite manually-entered values. For example, changing "Tasa MO" from 4.36 to 3.36 propagates `total_hours` correctly to the child "Tamaño Fuerza Laboral", but then the solver picks `hrs_per_worker` as the target instead of recalculating `workers_req` (which is the locked/calculated field).

### Root cause
The `targetId` (which variable is "locked" for calculation) only lives in the `Node` component's local state. The `propagateValues` function in `SimulationMap.tsx` has no access to it, so it guesses wrong.

### Solution

1. **Store `targetId` in `NodeData`** (`types.ts`): Add optional `targetId?: string` to the `NodeData` interface.

2. **Persist `targetId` from Node to parent** (`Node.tsx`): When the student changes which variable is locked (radio button), call a new callback `onTargetChange(nodeId, targetId)` to save it to the node data.

3. **Use stored `targetId` during propagation** (`SimulationMap.tsx`):
   - In `propagateValues`, instead of guessing the target variable, read `child.targetId` and use it directly for the `solve` call.
   - Add `handleTargetChange` callback to update node's `targetId`.
   - Fallback: if no `targetId` stored, use the first variable (current default in Node).

### Files to modify
1. `src/components/SimulationMap/types.ts` — add `targetId?: string` to `NodeData`
2. `src/components/SimulationMap/Node.tsx` — add `onTargetChange` prop; call it when radio changes
3. `src/components/SimulationMap/SimulationMap.tsx` — add `handleTargetChange`; fix `propagateValues` to use stored `targetId`


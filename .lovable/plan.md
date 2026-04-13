

## Fix suggestion highlights and make guide messages specific

### Problem 1: Zoom effect on suggestions
The `animate-demo-pulse` animation scales elements to 1.5x (`scale(1.5)`), causing suggestion buttons to overflow outside the node.

**Fix**: Remove `animate-demo-pulse` from guide-highlighted suggestions. The green ring + background is sufficient visual cue. Only keep the `GuidePulse` dot.

### Problem 2: Generic completion messages
Currently when all fields are filled, the guide says something like "¡Horas calculadas! Determina cuántos trabajadores necesitas." — too vague. It should list the available suggestions with a brief note about what data each one needs.

**Fix**: Instead of a static `COMPLETION_MESSAGES` string, dynamically build the message from the node's actual suggestions. Add a new map `SUGGESTION_HINTS` that describes what each suggestion module needs:

```
material_needs: "Necesitarás la Tasa de Uso de MP (panel de reporte, sección Producción)."
labor_needs: "Necesitarás la Tasa de Mano de Obra (panel de reporte)."
workforce: "Necesitarás las Horas por Trabajador (~500 hrs/trimestre)."
...
```

The completion message becomes:
```
¡Cálculo completo! ¿Qué quieres calcular ahora?

• Calcular Fuerza Laboral → Necesitarás las Horas por Trabajador (~500 hrs/trimestre).
• Calcular Costo Mano de Obra → Necesitarás el Salario por Hora.
```

### Files to modify

1. **`tailwind.config.ts`** — No change needed (animation stays for demo mode)
2. **`src/components/SimulationMap/Node.tsx`** — Remove `animate-demo-pulse` class from guide-highlighted suggestions (keep it for demo highlights only)
3. **`src/components/SimulationMap/Guide/guideHints.ts`** — Add `SUGGESTION_HINTS` map; remove static `COMPLETION_MESSAGES`
4. **`src/components/SimulationMap/Guide/GuideContext.tsx`** — In the "all fields filled" branch, dynamically build the message using the node's `suggestions` array + `SUGGESTION_HINTS`


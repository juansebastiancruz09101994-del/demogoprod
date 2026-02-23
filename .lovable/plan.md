
## Flecha animada apuntando a la tarjeta del escenario activo

### Que se hara
Agregar una flecha flotante animada (bouncing) al lado izquierdo de la tarjeta del escenario que el estudiante debe seleccionar. La flecha aparece en tres momentos:
1. Despues de cargar el Excel, apunta a "Situacion 1 - Operacion Optima"
2. Al completar el Escenario 1, apunta a "Situacion 2 - Maxima Capacidad"
3. Al completar el Escenario 2, apunta a "Situacion 3 - Crisis de Suministros"

La flecha desaparece una vez que el estudiante expande la tarjeta (da clic).

### Logica de visibilidad
La flecha se muestra cuando:
- El escenario esta activo (`currentScenario === scenario.id`)
- La tarjeta NO esta expandida (`scenarioExpanded !== scenario.id`)
- El escenario NO esta completado

Esto cubre el caso inicial (report loaded, scenario 1 seleccionado pero no expandido) y las transiciones entre escenarios.

### Detalle tecnico

**Archivo: `src/components/SimulationMap/DemoMode/ScenarioCards.tsx`**

- Importar `ArrowLeft` de lucide-react (flecha apuntando hacia la tarjeta desde la izquierda)
- Dentro del map de cada tarjeta, agregar un div posicionado a la izquierda de la tarjeta con la flecha
- Condicion: `isActive && !isExpanded && !isCompleted`
- La flecha tendra una animacion CSS de bounce horizontal (izquierda-derecha) para llamar la atencion

**Archivo: `tailwind.config.ts`**

- Agregar keyframe `bounce-left`:
  - `0%, 100%`: translateX(0)
  - `50%`: translateX(-8px)
- Agregar animation `bounce-left: bounce-left 1s ease-in-out infinite`

### Diseno visual
- Flecha color acorde al escenario (emerald para 1, orange para 2, red para 3)
- Posicionada a la izquierda de la tarjeta con `absolute -left-10`
- Tamano: 24x24px
- Con un texto pequeno "Haz clic aqui" debajo de la flecha (opcional, se puede omitir para mantenerlo limpio)

### Archivos a modificar
1. `tailwind.config.ts` - agregar keyframe y animacion bounce-left
2. `src/components/SimulationMap/DemoMode/ScenarioCards.tsx` - agregar flecha animada condicional

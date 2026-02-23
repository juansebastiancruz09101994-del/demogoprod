

## Modo Demo: Tutorial Interactivo Paso a Paso

### Resumen

Se agregara un **modo demo** que guia al estudiante a traves de 3 escenarios de produccion. El estudiante interactua con la app en tiempo real (no es un video), siguiendo indicaciones visuales: un **punto pulsante** senala donde hacer clic, y un **mensaje de orientacion** explica que hacer en cada paso.

### Flujo General del Modo Demo

```text
[Boton "Modo Demo" en controles]
        |
        v
[Paso 0: Pulso en panel izquierdo]
  "Carga el reporte de resultados del Q anterior"
        |
        v
[Reporte cargado -> Aparecen 3 tarjetas de escenarios arriba-derecha]
  Tarjeta 1 en color + pulso
        |
        v
[Estudiante toca Tarjeta 1 -> Se despliega enunciado]
  Comienza secuencia guiada de Escenario 1
        |
        v
[Completa Escenario 1 -> Tarjeta 2 se activa con pulso]
        |
        v
[Escenario 2 guiado...]
        |
        v
[Escenario 3 guiado... -> Pop-up de Feedback al final]
```

### Componentes a Crear

**1. `src/components/SimulationMap/DemoMode/DemoContext.tsx`**
Contexto React que gestiona todo el estado del demo:
- `isDemoActive`: si el modo demo esta activo
- `currentScenario`: 0 (pre-carga), 1, 2, 3
- `currentStep`: indice del paso actual dentro del escenario
- `scenarioExpanded`: cual tarjeta esta desplegada
- Funciones: `startDemo()`, `advanceStep()`, `completeScenario()`

**2. `src/components/SimulationMap/DemoMode/demoScenarios.ts`**
Definicion de datos de los 3 escenarios con:
- Titulo, enunciado, color
- Array de pasos, donde cada paso tiene:
  - `targetType`: que tipo de accion (click-suggestion, fill-input, solve)
  - `targetNodeType`: tipo de nodo involucrado
  - `targetVariable`: variable a llenar (si aplica)
  - `expectedValue`: valor esperado (para validacion)
  - `message`: texto de orientacion para el estudiante
  - `highlightSelector`: indicador de donde esta el elemento a interactuar

Ejemplo de pasos del Escenario 1:
1. "Escribe 210,000 en Unidades Objetivo" -> pulso en el input de `target` del nodo root
2. "Haz clic en '+ Calcular Materia Prima'" -> pulso en el boton de sugerencia
3. "Introduce la Tasa de Uso: 3.90 (la ves en el panel izquierdo)" -> pulso en input `rate`
4. "Haz clic en '+ Calcular Horas Mano de Obra'" -> volver al nodo root
5. "Introduce la Tasa MO: 4.36" -> pulso en input `rate` del nodo labor_needs
6. "Haz clic en '+ Calcular Costo Material'" -> pulso en sugerencia del nodo material_needs
7. "Introduce el Precio por Unidad: $2.25" -> pulso en input `price`
8. "Haz clic en '+ Calcular Costo Mano de Obra'" -> desde labor_needs o workforce
9. Llenar workers, wage, hours para calcular costo MO
10. Crear nodo Costo Total y llenar Costos Fijos ($400,000)
11. Resolver Costo Total -> Crear Costo Unitario -> resultado $20.71

**3. `src/components/SimulationMap/DemoMode/ScenarioCards.tsx`**
Panel flotante arriba-derecha con 3 tarjetas:
- Cada tarjeta muestra: numero, titulo, estado (bloqueada/activa/completada)
- La tarjeta activa tiene el efecto de pulso y color
- Al hacer clic se despliega el enunciado del escenario
- Las tarjetas bloqueadas estan en gris y no son interactuables

**4. `src/components/SimulationMap/DemoMode/GuidePulse.tsx`**
Componente visual del punto pulsante:
- Circulo animado con CSS pulse
- Se posiciona sobre el elemento objetivo
- Incluye un tooltip/mensaje de orientacion al lado

**5. `src/components/SimulationMap/DemoMode/DemoOverlay.tsx`**
Capa que combina el pulso y el mensaje:
- Mensaje flotante con flecha apuntando al elemento objetivo
- Fondo semi-transparente opcional para enfocar atencion
- Boton "Saltar paso" o "Salir del demo"

### Modificaciones a Archivos Existentes

**`src/components/SimulationMap/SimulationMap.tsx`**
- Envolver contenido en `DemoProvider`
- Agregar boton "Modo Demo" en los controles (bottom-right), con icono de graduacion
- Renderizar `ScenarioCards` cuando el demo esta activo y el reporte cargado
- Renderizar `GuidePulse` posicionado segun el paso actual
- Escuchar eventos de nodos/inputs para detectar cuando el estudiante completa un paso y avanzar automaticamente

**`src/components/SimulationMap/Node.tsx`**
- Aceptar prop opcional `demoHighlight` con info del paso actual
- Aplicar clase de pulso al input o boton de sugerencia correspondiente
- Mostrar mensaje de orientacion junto al elemento resaltado

**`src/components/SimulationMap/ReportPanel.tsx`**
- Aceptar prop `demoHighlight` para mostrar el punto pulsante cuando el demo pide cargar el reporte

### Logica de Deteccion de Avance

Cada paso define una condicion de completado:
- **click-suggestion**: se detecta cuando `handleAddChild` crea un nodo del tipo esperado
- **fill-input**: se detecta cuando `handleNodeUpdate` recibe el valor correcto (con tolerancia del 5%)
- **auto**: el paso avanza automaticamente (para mensajes informativos)

Cuando se completa el ultimo paso del Escenario 3, se abre automaticamente el `FeedbackModal`.

### Detalles de los 3 Escenarios

**Escenario 1 - Operacion Optima (210,000 uds)**
~11 pasos: Produccion -> Req MP -> Costo MP -> Req MO -> Costo MO -> Costo Total -> Costo Unitario ($20.71)

**Escenario 2 - Maxima Capacidad (263,420 uds)**
~13 pasos: Similar al 1 pero incluye nodo Contratacion (Regla 2x), calculo de deficit de horas, 891 nuevos trabajadores. Costo Unitario: $22.27

**Escenario 3 - Crisis de Suministros (180,000 uds)**
~12 pasos: Produccion reducida, inventario con precio viejo (400,000 uds) y precio nuevo (+25%), costo de capacidad ociosa (se paga a todos los 1,852 trabajadores). Costo Unitario: $23.77. Al final se dispara el FeedbackModal.

### Estilos del Punto Pulsante

Se agregara una animacion CSS `demo-pulse` en `tailwind.config.ts`:
```text
keyframes:
  demo-pulse:
    0%, 100%: scale(1), opacity(1)
    50%: scale(1.5), opacity(0.5)

animation:
  demo-pulse: "demo-pulse 1.5s ease-in-out infinite"
```

El punto sera un circulo azul de 12px con un anillo exterior animado.

### Archivos Nuevos (6)
- `src/components/SimulationMap/DemoMode/DemoContext.tsx`
- `src/components/SimulationMap/DemoMode/demoScenarios.ts`
- `src/components/SimulationMap/DemoMode/ScenarioCards.tsx`
- `src/components/SimulationMap/DemoMode/GuidePulse.tsx`
- `src/components/SimulationMap/DemoMode/DemoOverlay.tsx`
- `src/components/SimulationMap/DemoMode/index.ts`

### Archivos Modificados (4)
- `src/components/SimulationMap/SimulationMap.tsx`
- `src/components/SimulationMap/Node.tsx`
- `src/components/SimulationMap/ReportPanel.tsx`
- `tailwind.config.ts`


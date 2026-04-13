
Corregiría esto en cuatro frentes, porque ya pude ubicar exactamente por qué está fallando:

### 1. Hacer que GoProd sí sea draggable y no arrastre nodos/canvas
Problema detectado:
- El overlay hoy escucha `mousemove` global, pero no aísla bien el gesto.
- Además, el canvas sigue reaccionando al mouse y por eso se mueve el fondo o incluso nodos.
- El texto se puede seleccionar porque el cuerpo del asistente no está tratado como superficie interactiva aislada.

Qué haré:
- Limitar el drag de GoProd a un “header” real del overlay, no al contenido.
- Frenar propagación del mouse y del pointer desde el overlay hacia el canvas.
- Desactivar selección de texto mientras se arrastra.
- Evitar que cualquier click dentro del overlay dispare `onMouseDown` del canvas o de nodos.
- Mantener la posición del overlay independiente del sistema de nodos.

### 2. Rehacer el parser del mensaje para que el formato salga siempre bien
Problema detectado:
- El parser actual solo toma bullets dentro de bloques separados por `\n\n`.
- Si los bullets llegan en una sola cadena con saltos simples, o mezclados con el texto, no los reconoce bien.
- Por eso aparecen bullets sin negrita como “Calcular Costo Mano de Obra”.

Qué haré:
- Parsear línea por línea, no por bloques.
- Detectar cualquier línea que empiece con `•`, aunque no venga separada por doble salto.
- Separar correctamente `label` y `description` usando la flecha `→`.
- Si una línea no trae descripción, mostrarla de forma segura y consistente en vez de romper el formato.
- Renderizar:
  - mensaje principal como párrafo
  - bullets como lista
  - etiqueta en negrita
  - descripción en texto normal

### 3. Completar y auditar todas las recomendaciones/insights
Problema detectado:
- “Definir Producción Objetivo →” sale incompleto porque `SUGGESTION_HINTS` no tiene entrada para `production_target`.
- Hay riesgo de que existan otras sugerencias sin insight asociado.

Qué haré:
- Revisar todas las `suggestions` definidas en `modules.tsx`.
- Cruzarlas contra `SUGGESTION_HINTS`.
- Completar las faltantes, empezando por `production_target`.
- Ajustar el copy para que todas las rutas sugeridas tengan texto gerencial útil y completo.
- Verificar también que no haya labels inconsistentes o duplicados que rompan la lectura.

### 4. Ajustar el overlay a la UX que pides
Qué haré:
- Volver al ancho anterior (`max-w-md`).
- Bajar ligeramente la tipografía para que respire mejor.
- Recuperar altura variable según el contenido.
- Mantener solo un `max-height` razonable como red de seguridad extrema, no como altura fija principal.
- Conservar el efecto cristal líquido suave, con más opacidad en hover pero sin competir con el nodo activo.

### Archivos a modificar
1. `src/components/SimulationMap/Guide/GuideOverlay.tsx`
   - aislar drag
   - evitar selección accidental
   - rehacer parsing/formato
   - volver a ancho más compacto y altura variable

2. `src/components/SimulationMap/Guide/guideHints.ts`
   - completar insights faltantes
   - revisar consistencia de todas las recomendaciones

3. `src/components/SimulationMap/Guide/GuideContext.tsx`
   - si hace falta, normalizar cómo se construye el mensaje para que siempre llegue en formato parseable

### Validación que haré al implementar
- Arrastrar GoProd desde su cabecera sin mover canvas ni nodos
- Hacer click dentro del texto sin seleccionar accidentalmente ni desplazar otros elementos
- Verificar que todas las sugerencias salgan con:
  - bullet
  - etiqueta en negrita
  - descripción completa
- Confirmar específicamente que “Calcular Costo Mano de Obra” y “Definir Producción Objetivo” queden bien formateadas y completas

### Detalle técnico
La causa principal no es visual sino estructural:
- el drag del overlay no está aislado del sistema de drag del canvas
- el parser del mensaje es demasiado frágil
- falta al menos un `SUGGESTION_HINTS['production_target']`, lo que genera la flecha vacía

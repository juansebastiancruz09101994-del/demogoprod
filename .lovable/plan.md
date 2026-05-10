## Plan para corregir el modo Demo / Estudio

### Objetivo
Hacer que el usuario pueda alternar claramente entre:

- **Modo Demo**: experiencia guiada con escenarios pedagógicos.
- **Modo Estudio / Estrategia**: práctica real donde el estudiante calcula y toma decisiones libremente usando el árbol.

El cambio de modo **no debe borrar nodos, conexiones, reporte ni cálculos**.

### Cambios propuestos

1. **Separar el significado del bombillo**
   - El bombillo actualmente activa/desactiva el asistente, por eso aparece como “Desactivar asistente”.
   - Cambiaré su etiqueta visible/tooltip para que no se confunda con el cambio de modo.
   - Si el bombillo sigue siendo el asistente estratégico, su texto será algo como:
     - “Activar apoyo estratégico”
     - “Desactivar apoyo estratégico”

2. **Convertir el botón de Demo en alternador real Demo ↔ Estudio**
   - El botón con ícono de birrete dejará de llamar siempre a `startDemo()`.
   - Pasará a una función tipo `handleToggleDemoMode()`:
     - Si el demo está activo: llama a `demo.exitDemo()` y vuelve a **Modo Estudio**.
     - Si el demo está inactivo: entra a **Modo Demo**.

3. **Evitar borrado automático al entrar o salir del demo**
   - La función actual `handleStartDemo()` borra:
     - nodos
     - conexiones
     - reporte cargado
     - datos guardados en `localStorage`
   - Cambiaré ese comportamiento para que alternar entre modos no destruya el trabajo del estudiante.
   - Al entrar al demo se activará la guía demo, pero no se limpiará el estado de estudio.
   - Al salir del demo se quedará disponible el canvas/reporte actual.

4. **Renombrar textos de interfaz para hacerlo claro**
   - El botón activo del demo indicará “Cambiar a modo estudio” o “Modo Estudio”.
   - El botón inactivo indicará “Cambiar a modo demo” o “Modo Demo”.
   - El botón “Salir” del overlay demo se entenderá como salida hacia estudio, sin reiniciar datos.

### Archivos a modificar

- `src/components/SimulationMap/SimulationMap.tsx`
  - Ajustar la función del botón demo.
  - Actualizar tooltips/títulos de botones.
  - Eliminar el borrado de datos del cambio de modo.

- `src/components/SimulationMap/DemoMode/DemoOverlay.tsx`
  - Cambiar el texto “Salir” por una acción más clara como “Modo estudio”.

### Resultado esperado

El estudiante podrá:

1. Entrar a **Modo Demo** para ver escenarios guiados.
2. Salir al **Modo Estudio / Estrategia** con un clic.
3. Volver al demo si quiere.
4. Mantener sus datos, reporte, nodos y conexiones al alternar entre ambos modos.

No se tocará la lógica de cálculo de módulos ni las fórmulas del árbol de decisiones.
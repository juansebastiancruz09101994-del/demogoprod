

## Ajuste del indicador de demo en el panel de Reporte

### Cambios en `src/components/SimulationMap/ReportPanel.tsx`

**1. Remover el efecto de zoom (animate-demo-pulse) del contenedor de upload**
- En la linea 175, quitar `animate-demo-pulse` de la clase CSS del dropzone cuando `demoHighlight` esta activo
- Mantener solo el borde azul y fondo suave como indicador estatico

**2. Mover el punto pulsante (GuidePulse) junto al texto "Subir Excel"**
- Remover el `GuidePulse` de la esquina superior derecha del contenedor principal (lineas 126-130)
- Colocarlo inline junto al texto "Subir Excel de reportes (no de decisiones)" en la linea 193, para que aparezca visible al lado del nombre

**3. Remover el ring/borde extra del contenedor principal**
- En la linea 121, quitar `ring-2 ring-blue-300` del contenedor principal cuando esta en demo highlight, dejando solo el borde normal

### Resultado visual esperado
- Sin efecto de zoom/scale en el area de upload
- Un punto azul pulsante visible junto al texto "Subir Excel de reportes"
- El panel se ve limpio, sin anillos extra ni animaciones de escala


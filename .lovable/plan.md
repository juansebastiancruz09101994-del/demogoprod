

## Formato del asistente GoProd: cristal líquido + texto estructurado

### Cambios

**1. Texto estructurado en `GuideOverlay.tsx`**
- Parsear `guideMessage` para detectar el bloque principal (antes de `\n\n`) y las líneas con `•`
- Renderizar el bloque principal como párrafo normal
- Renderizar cada bullet como un elemento con el nombre de la sugerencia en **negrita** y la descripción en texto normal (separados por `→`)
- Usar `text-xs` para las sugerencias para diferenciarlas del mensaje principal

**2. Efecto cristal líquido en el contenedor**
- Cambiar `bg-white/95` → `bg-white/40 backdrop-blur-xl` para efecto glassmorphism translúcido
- En hover: transición a `bg-white/70` (recupera color pero no al 100%)
- Usar `transition-all duration-300` para suavizar

**3. Contenedor más ancho y altura fija**
- Cambiar `max-w-md` → `max-w-xl` para más espacio horizontal
- Agregar `h-[180px]` fijo al contenedor interior + `overflow-y-auto` para scroll si el contenido excede
- Esto evita que el asistente crezca y tape el canvas

**4. Mensaje estructurado desde `GuideContext.tsx`**
- Sin cambios en la lógica — el formato `\n\n` y `•` / `→` ya existe; el parsing se hace en el overlay

### Archivos a modificar

1. **`src/components/SimulationMap/Guide/GuideOverlay.tsx`** — glassmorphism, hover effect, ancho mayor, altura fija, parsing de texto estructurado


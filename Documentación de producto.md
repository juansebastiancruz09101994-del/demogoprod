# Documentación de Producto — GoProd

> Copiloto adaptativo, visual e interactivo para la toma de decisiones estratégicas de producción dentro de la simulación de negocios *Simulations.ca*.

---

## 1. Introducción — ¿Qué es GoProd?

### 1.1 Contexto de la simulación
La simulación se llama **Simulations.ca** y recrea un universo controlado llamado **"universo gamma"** en el que los participantes, organizados en equipos, deben tomar decisiones estratégicas trimestrales en distintas áreas funcionales de una empresa: **mercadeo y ventas, finanzas, producción, recursos humanos y compra de información**. La simulación pondera las decisiones tomadas por cada equipo y devuelve analíticas y reportes trimestrales que sirven como insumo para el siguiente ciclo de decisiones.

### 1.2 Definición
**GoProd** es un copiloto que asiste a futuros gerentes en la toma de decisiones estratégicas de producción dentro de ese universo simulado. Es una herramienta **adaptativa, visual e interactiva** que contribuye a gestionar el pensamiento estratégico de forma **holística**. Su naturaleza adaptativa la hace versátil: si bien su núcleo son las decisiones de producción, los estudiantes pueden empezar a razonar desde otras áreas como finanzas o recursos humanos y encadenar cálculos hacia el resto del sistema.

### 1.3 Público objetivo
Estudiantes de **pregrado y maestría** de la **Facultad de Administración de la Universidad de Los Andes**, específicamente de la materia **Gerencia Estratégica**. Su diseño tiene el potencial de extenderse a otros cursos de **MBA, Finanzas e Ingeniería Industrial**.

### 1.4 Propuesta de valor
GoProd convierte el ejercicio tradicional de presupuesto de producción en un **mapa dinámico de nodos conectados**: un **árbol de decisiones adaptativo** que puede crecer tanto como el estudiante lo requiera, siguiendo el hilo de razonamiento que él mismo elija.

---

## 2. Alcance pedagógico

### 2.1 Objetivos de aprendizaje priorizados
GoProd nace para facilitar la consecución de objetivos de aprendizaje de la materia *Gerencia Estratégica*. Del árbol de objetivos definido al inicio del proyecto, se priorizaron los siguientes:

**1.2. Integra decisiones funcionales en una estrategia coherente (Cr)**

**1.2.1. Mercadeo y ventas (A / An)**
- **1.2.1.1 (C)** Identifica segmentos y mercados meta (Industrial / Consumo; Este / Oeste) según su sensibilidad al precio y a la publicidad.
- **1.2.1.2 (A)** Diseña una mezcla de mercadeo coherente con la posición estratégica de la empresa.

**1.2.2. Producción y operaciones (A / An)**
- **1.2.2.1 (R)** Reconoce los recursos requeridos para la producción: materia prima, mano de obra y capacidad de planta.
- **1.2.2.2 (A)** Calcula costos unitarios y productividad de la planta usando los reportes de producción.

### 2.2 Objetivo funcional
Facilitar la toma de decisiones estratégicas de producción que involucran, entre otras: **presupuesto de producción, requerimientos de materia prima, planeación de mano de obra, valoración de inventarios (precio ponderado), decisiones de contratación (Regla 2x), cálculo de costo total y costo unitario**.

### 2.3 Enfoque didáctico
Aprendizaje **por descubrimiento**: el sistema **nunca entrega la respuesta**. Guía al estudiante a consultar el **reporte de resultados** (descargado desde la simulación) y a razonar por su cuenta. GoProd concatena las fórmulas matemáticas de producción y otras áreas, permitiendo **despejarlas** y calcular variables de forma **dinámica y no lineal (adaptativa)**.

### 2.4 Roles
- **Estudiante**: construye su propio flujo de decisiones, experimenta con escenarios y toma decisiones informadas.
- **Docente**: usa GoProd como material de apoyo en clase, asigna escenarios o deja el Modo Estudio libre para las jugadas reales del día a día de la simulación.

---

## 3. Modos de uso

GoProd tiene dos modos, seleccionables mediante un **toggle vertical tipo cápsula** ubicado en el canvas (íconos de **sombrerito de graduación** = estudio, **bombillo** = demo).

### 3.1 Modo Estudio (libre)
Canvas en blanco. El estudiante construye libremente su flujo de nodos: agrega módulos, conecta, edita valores y borra. Ideal para las **jugadas reales del día a día** en la simulación, para tareas asignadas o para exploración autónoma.

### 3.2 Modo Demo (guiado)
Recorrido pedagógico con **tres escenarios** predefinidos. Cada escenario tiene pasos con:
- Mensajes contextuales que orientan sin dar la respuesta.
- **Pulsos visuales** sobre inputs y sugerencias objetivo.
- **Validación por tolerancia** (rangos porcentuales configurados por paso).
- **Snapshot independiente del canvas por escenario**: cada escenario preserva su propio estado.

Los tres escenarios son:
1. **Operación Óptima** — 210,000 uds (80% de capacidad).
2. **Máxima Capacidad** — 263,420 uds con aplicación de la **Regla 2x**.
3. **Crisis de Suministros** — 180,000 uds con **inflación del 25%** en materia prima.

---

## 4. Funcionalidades disponibles

### 4.1 Canvas de simulación
- Nodos **arrastrables** con posicionamiento libre.
- **Conexiones automáticas** entre módulos relacionados.
- **Propagación bidireccional** del grafo: al cambiar una variable, el resto se recalcula.
- Layout tipo **"fórmula visual"** vertical, con el **resultado destacado en verde** en la parte inferior de cada nodo.
- Sin animaciones de zoom o escalado (para no distraer).

### 4.2 Módulos de cálculo disponibles
| Módulo | Rol |
|---|---|
| Plan de Producción | Punto de partida: unidades objetivo |
| Requerimiento de Materia Prima | Cantidad de MP necesaria |
| Requerimiento de Horas de Mano de Obra | Horas totales de MO |
| Fuerza Laboral | Trabajadores necesarios |
| Decisión de Contratación (Regla 2x) | Contrataciones adicionales |
| Costo de Materia Prima | Costo total de MP |
| Costo de Mano de Obra | Costo total de MO |
| Costo Total | Suma de todos los costos |
| Costo Unitario | Costo total / unidades producidas |

### 4.3 Inputs numéricos
- **Comas** para separar miles.
- **Punto** para decimales.
- **Error visual en rojo** si el estudiante usa coma como separador decimal.

### 4.4 Sugerencias contextuales
Cada nodo propone los **siguientes cálculos posibles** ("+ Calcular …"), guiando la construcción del árbol de decisiones sin imponer un único camino.

### 4.5 Borrado en cascada
Al eliminar un nodo, el sistema lista **todos los módulos descendientes** que se removerán y exige **confirmación explícita**.

### 4.6 Panel de Reporte
Contiene los datos del **trimestre anterior** que el estudiante debe consultar para tomar sus decisiones: capacidad de planta, tasas de uso, precios, plantilla actual, inventarios, costos fijos, salarios y productividad.

### 4.7 Guía visual
- **Pulsos** coloreados sobre elementos objetivo.
- **Flechas** que dirigen la atención sin bloquear la interacción.
- Sin animaciones de zoom.

### 4.8 Exportación a PDF
Exportación del mapa y resultados con **layout similar al layout de decisiones del simulador**, para reducir la fricción y evitar errores de transcripción cuando el estudiante ingrese sus decisiones al simulador real.

### 4.9 Feedback modal
Se muestra al completar los tres escenarios del Modo Demo, invitando al estudiante a reflexionar sobre lo aprendido.

### 4.10 Controles del canvas
Zoom in / zoom out, fit-view y reset. Todos comparten una **estética homogénea** con transparencia al reposo (~30% de opacidad) y color completo al pasar el mouse por encima, para no distraer visualmente durante el trabajo.

### 4.11 Badge superior de modo activo
Cápsula centrada en la parte superior que indica si estás en **Modo Estudio** o **Modo Demo**, con opción de cerrar (X). Aplica transparencia con recuperación de opacidad al hover.

---

## 5. Fórmulas matemáticas usadas

### 5.1 Producción y requerimientos
- **Unidades Objetivo** = Capacidad × % Utilización
- **Requerimiento de Materia Prima (uds)** = Unidades Objetivo × Tasa de uso de MP
- **Requerimiento de Horas de Mano de Obra** = Unidades Objetivo × Tasa de MO
- **Fuerza Laboral necesaria** = Horas totales / Horas por trabajador

### 5.2 Contratación — Regla 2x
- **Déficit** = Trabajadores necesarios − Trabajadores actuales
- **Nuevos contratados** = 2 × Déficit
- **Total nómina** = Trabajadores actuales + Nuevos contratados

### 5.3 Costos
- **Costo de Materia Prima** = Unidades de MP × Precio unitario *(o precio ponderado en escenarios de crisis)*
- **Precio Ponderado de MP** = (Stock viejo × Precio viejo + Compra nueva × Precio viejo × 1.25) / Total de unidades
- **Costo de Mano de Obra** = Trabajadores × Horas por trabajador × Salario por hora
- **Costo Total** = Costo MP + Costo MO + Costos Fijos
- **Costo Unitario** = Costo Total / Unidades Objetivo

### 5.4 Invertibilidad del grafo
El grafo es **bidireccional**: ciertas fórmulas se **invierten automáticamente** cuando el estudiante fija manualmente un resultado, permitiendo despejar cualquier variable.

---

## 6. Escenarios del Modo Demo (detalle)

### 6.1 Escenario 1 — Operación Óptima
**Enunciado.** La empresa opera al 80% de una capacidad de 263,420 uds, produciendo ~210,000 uds.
**Objetivo pedagógico.** Construir el flujo completo de costo unitario en condiciones estándar.
**Valores esperados clave.** Objetivo 210,000; tasa MP 3.90; tasa MO 4.36; horas/trabajador 500; salario 2.30; precio MP 2.25; costos fijos 400,000.

### 6.2 Escenario 2 — Máxima Capacidad
**Enunciado.** Pedido extraordinario que exige producir a máxima capacidad (263,420 uds). La plantilla actual no alcanza; hay que contratar aplicando la **Regla 2x**.
**Objetivo pedagógico.** Comprender el impacto de la decisión de contratación sobre el costo unitario.

### 6.3 Escenario 3 — Crisis de Suministros
**Enunciado.** Entorno inflacionario: se reduce la producción a 180,000 uds. Hay stock a precio viejo (400,000 uds) y la MP adicional cuesta 25% más. Debe pagarse a **todos** los 1,852 trabajadores aunque haya capacidad ociosa.
**Objetivo pedagógico.** Valoración de inventarios mediante **precio ponderado** y análisis de capacidad ociosa.

---

## 7. Funcionalidades explícitamente fuera de alcance

- **Sin registro ni autenticación** de usuarios.
- **Sin persistencia en la nube** ni sincronización entre dispositivos.
- **Sin backend, base de datos ni analítica** de estudiantes.
- **Sin colaboración multiusuario** en tiempo real.
- **Sin reportes por cohorte** ni panel docente.
- **Sin integración con LMS** (Bloque Neón).
- **No cubre presupuesto financiero completo** (efectivo, capital de trabajo, estados financieros).
- **No cubre pronóstico de demanda, MRP multinivel ni programación** de producción detallada.
- **No soporta múltiples productos** o líneas simultáneas.
- **Sin internacionalización** (solo español).

---

## 8. Arquitectura no técnica de alto nivel

GoProd es una **aplicación web de una sola página** que corre íntegramente en el **navegador del estudiante**. Se organiza conceptualmente en tres capas:

```text
┌─────────────────────────────────────────────────────┐
│  Capa de Guía (Modo Demo + asistente pedagógico)    │
│  Orquesta la experiencia de aprendizaje             │
├─────────────────────────────────────────────────────┤
│  Motor de Grafo (bidireccional, adaptativo)         │
│  Propaga cálculos entre módulos y despeja fórmulas  │
├─────────────────────────────────────────────────────┤
│  Canvas (nodos, conexiones, árbol de decisiones)    │
│  Superficie visual e interactiva del estudiante     │
└─────────────────────────────────────────────────────┘
```

- Los datos del ejercicio (reporte del trimestre anterior y escenarios) vienen **precargados** como contenido del producto.
- **No se envía información del estudiante a ningún servidor**.
- Las decisiones mapeadas en el árbol de decisiones adaptativo **no se sincronizan automáticamente con el simulador**; el estudiante las transcribe manualmente (facilitado por la exportación a PDF con layout análogo).

---

## 9. Limitaciones conocidas

- **Persistencia local únicamente**: el trabajo vive en la sesión del navegador. Recargar o cerrar la pestaña puede perder el estado del canvas del Modo Estudio.
- **Sin cuentas de usuario**: no se puede retomar un ejercicio desde otro dispositivo.
- **Sin historial ni versiones** del canvas.
- **Sin exportación de datos crudos**: solo PDF con tablas de decisiones (layout similar al del simulador).
- **Optimizado para escritorio**: la experiencia en móvil y tablet es limitada por el tamaño del canvas.
- **Contenido fijo**: los escenarios y el reporte no son editables por el docente desde la interfaz.
- **Tolerancias fijas** en la validación de respuestas del Modo Demo.
- **Sin accesibilidad avanzada** (lectores de pantalla, navegación completa por teclado).

---

## 10. Glosario breve

- **Tasa de uso de MP** — Unidades de materia prima requeridas por unidad de producto terminado.
- **Regla 2x** — Política de contratación: por cada trabajador faltante se contratan dos, anticipando rotación e ineficiencias iniciales.
- **Costo Unitario** — Costo total de producción dividido entre las unidades producidas.
- **Precio Ponderado** — Promedio ponderado del costo unitario de MP cuando conviven stock viejo e inventario nuevo comprado a distinto precio.
- **Capacidad Ociosa** — Diferencia entre la capacidad instalada y la producción efectivamente realizada.
- **Árbol de decisiones adaptativo** — Estructura visual de nodos y conexiones que el estudiante hace crecer a medida que toma decisiones; se recalcula automáticamente al modificar cualquier variable.

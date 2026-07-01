# Plan: Documentación de Producto de GoProd

## Objetivo

Crear un único archivo `Documentación de producto.md` en la raíz del proyecto que sirva como referencia integral (no técnica pero rigurosa) sobre GoProd: qué es, para qué sirve, qué hace, qué no hace y cómo está organizado.

## Ubicación del archivo

`Documentación de producto.md` (raíz del repositorio, junto a `README.md`).

## Estructura del documento

1. **Introducción – ¿Qué es GoProd?**
  - Contexto de la simulación: La simulación se llama "Simulations.ca" y simula un universo controlado llamado "universo gamma" donde los participantes deben tomar decisiones estratégicas de mercadeo y ventas, finanzas, producción, recursos humanos, compra de informacion.  La simulación pondera las decisiones tomadas por cada equipo y ofrece analíticas y reportes trimestrales. 
  - Definición: GoProd es un copiloto que asiste a futuros gerentes en la toma de decisiones estrategicas de producción dentro de ese universo simulado. Go prod es una herramienta adaptativa, visual e interactiva que contriuye a gestionar el pensamiento estrategico de forma holistica. Su naturaleza "adaptativo" lo hace versatil, pues si bien su core son las decisiones de producción, los estudiantes pueden empezar a tomar decisiones desde otras áreas como las finanzas o recursos humanos. 
  - Público objetivo: estudiantes de pregrado y maestría de la facultad de administración de la Universidad de Los Andes, especificamente de la materia Gerencia Estratégica, aunque su uso tiene el potecial de usarse en otras clases de MBA, Finanzas e Ingeniería Industrial. 
  - Propuesta de valor: convertir un ejercicio de presupuesto de producción en un mapa dinámico de nodos conectados. Es un "árbol de decisiones adaptativo" que puede crecer tanto como el estudiante lo requiera. 
2. **Alcance pedagógico**
  - Objetivos de aprendizaje: GoProd como herramienta de aprendizaje adaptativo nace para facilitar la consecución de objetivos de aprendizaje de la materia Gerencia Estratégica. Según el árbol de objetivos de aprendizaje estructurado al inicio del proyecto, se priorizaron los siguientes objetivos y se decidió basar GoProd en ellos: 
    **1.2. Integra decisiones funcionales en una estrategia coherente (Cr)** 
    **1.2.1. Mercadeo y ventas (A / An)** 
    - **1.2.1.1 (C)** Identifica segmentos y mercados meta (Industrial / Consumo; Este / Oeste) según su sensibilidad al precio y a la publicidad. 
    - **1.2.1.2 (A)** Diseña una mezcla de mercadeo coherente con la posición estratégica de la empresa.  
    **1.2.2. Producción y operaciones (A / An)** 
    - **1.2.2.1 (R)** Reconoce los recursos requeridos para la producción: materia prima, mano de obra y capacidad de planta. 
    - **1.2.2.2 (A)** Calcula costos unitarios y productividad de la planta usando los reportes de producción.
  - El objetivo funcional de GoProd es facilitar la toma de decisiones estrategicas de producción que involucran, entre otras cosas, presupuesto de producción, requerimientos de materia prima, planeación de mano de obra, valoración de inventarios (precio ponderado), decisiones de contratación (Regla 2x), cálculo de costo total y costo unitario.
  - Enfoque didáctico: aprendizaje por descubrimiento; el sistema nunca entrega la respuesta, guía al estudiante a consultar el reporte de resultados (que se descarga desde la simulacion) y razonar. El sistema concatena las fórmulas matemáticas de producción y otras áreas, permitiendo despejarlas y calcular variables de forma dinámica no-lineal (adaptativa). 
  - Rol del docente y del estudiante.
3. **Modos de uso**
  - **Modo Estudio (libre)**: canvas en blanco, el estudiante construye su propio flujo de nodos, agrega módulos, conecta, edita y borra libremente. Sirve para exploración autónoma o para tareas asignadas. Ideal para las jugadas "reales" del día a día en la simulación. 
  - **Modo Demo (guiado)**: recorrido pedagógico con tres escenarios (Operación Óptima 210k uds, Máxima Capacidad 263,420 uds con Regla 2x, Crisis de Suministros 180k uds con inflación 25%). Cada escenario tiene pasos con mensajes contextuales, pulsos visuales sobre inputs/sugerencias, y validación por tolerancia.
  - Toggle vertical (sombrerito/bombillo) para alternar entre modos.
4. **Funcionalidades disponibles**
  - **Canvas de simulación**: nodos arrastrables, conexiones automáticas, propagación bidireccional del grafo, layout tipo fórmula visual con resultado destacado en verde.
  - **Módulos de cálculo**: Unidades Objetivo, Requerimientos de Materia Prima, Requerimientos de Mano de Obra, Fuerza Laboral, Decisión de Contratación (Regla 2x), Costo Materia Prima, Costo Mano de Obra, Costo Total, Costo Unitario.
  - **Inputs numéricos**: formato con comas para miles y punto para decimales; validación con error visual si se usa coma para decimales.
  - **Sugerencias contextuales**: cada nodo propone los siguientes cálculos posibles.
  - **Borrado en cascada**: al eliminar un nodo se listan y confirman los módulos descendientes que se removerán.
  - **Panel de Reporte**: datos del trimestre anterior (capacidad, tasas, precios, plantilla, inventarios, costos fijos, salarios, productividad).
  - **Guía visual**: pulsos y flechas coloreadas sobre elementos objetivo, sin animaciones de zoom.
  - **Exportación a PDF** del mapa/resultados. Layout similar al layout de decisiones del simulador para evitar fricción del usuario y errores de transcripción. 
  - **Feedback modal** al completar los tres escenarios.
  - **Controles del canvas**: zoom in/out, fit-view, reset, con estética homogénea y transparencia al reposo.
  - **Badge superior** de modo activo con opción de cerrar.
5. **Fórmulas matemáticas usadas**
  - Unidades Objetivo = Capacidad × %Utilización.
  - Requerimiento de MP (unidades) = Unidades Objetivo × Tasa de uso de MP.
  - Requerimiento de Horas MO = Unidades Objetivo × Tasa de MO.
  - Fuerza Laboral necesaria = Horas totales / Horas por trabajador.
  - Regla 2x (contratación): Nuevos contratados = 2 × Déficit; Total nómina = Actuales + Nuevos.
  - Costo Materia Prima = Unidades MP × Precio unitario (o precio ponderado en crisis).
  - Precio Ponderado MP = (Stock viejo × Precio viejo + Compra nueva × Precio viejo × 1.25) / Total unidades.
  - Costo Mano de Obra = Trabajadores × Horas × Salario por hora.
  - Costo Total = Costo MP + Costo MO + Costos Fijos.
  - Costo Unitario = Costo Total / Unidades Objetivo.
  - Nota sobre invertibilidad: el grafo es bidireccional; ciertas fórmulas se invierten automáticamente cuando el estudiante fija el resultado.
6. **Escenarios del Modo Demo (detalle)**
  - Escenario 1 – Operación Óptima: enunciado, objetivos, valores esperados clave.
  - Escenario 2 – Máxima Capacidad: aplicación de Regla 2x, decisiones de contratación.
  - Escenario 3 – Crisis de Suministros: valoración de inventarios, precio ponderado, capacidad ociosa.
7. **Funcionalidades explícitamente fuera de alcance**
  - No hay registro ni autenticación de usuarios.
  - No hay persistencia en la nube ni sincronización entre dispositivos.
  - No hay backend, base de datos, ni analítica de estudiantes.
  - No hay colaboración multiusuario en tiempo real.
  - No hay generación de reportes por cohorte ni panel docente.
  - No hay integración con LMS (Bloque Neón).
  - No cubre presupuesto financiero completo (efectivo, capital de trabajo, estados financieros).
  - No cubre pronóstico de demanda, MRP multinivel, ni programación de producción detallada.
  - No hay soporte para múltiples productos o líneas simultáneas.
  - No hay internacionalización (solo español).
8. **Arquitectura no técnica de alto nivel**
  - Aplicación web de una sola página que corre íntegramente en el navegador del estudiante.
  - Tres capas conceptuales: (a) el **canvas** que dibuja árbol de decisiones (nodos y conexiones), (b) el **motor de grafo** que propaga cálculos entre módulos, (c) la **capa de guía** (Modo Demo + asistente) que orquesta la experiencia pedagógica.
  - Los datos del ejercicio (reporte del trimestre anterior, escenarios) vienen precargados como contenido del producto.
  - No se envía información del estudiante a ningún servidor.
  - Las decisiones mapeadas en el árbol de decisiones adaptativo tampoco se sincronizan con el simulador. 
9. **Limitaciones conocidas**
  - **Persistencia local únicamente**: el trabajo vive en la sesión del navegador; recargar o cerrar la pestaña puede perder el estado del canvas del Modo Estudio.
  - **Sin cuentas de usuario**: no se puede "retomar" un ejercicio desde otro dispositivo.
  - **Sin historial ni versiones** del canvas.
  - **Sin exportación de datos crudos** (solo PDF con tablas de deciciones, cuyo layout se asemeja al layout del simulador).
  - **Optimizado para escritorio**; la experiencia en móvil/tablet es limitada por el tamaño del canvas.
  - **Contenido fijo**: los escenarios y el reporte no son editables por el docente desde la interfaz.
  - **Tolerancias fijas** en la validación de respuestas del Modo Demo.
  - **Sin accesibilidad avanzada** (lectores de pantalla, navegación por teclado completa).
10. **Glosario breve** (Tasa de uso, Regla 2x, Costo Unitario, Precio Ponderado, Capacidad Ociosa, etc.).

## Proceso

1. Revisar `modules.tsx`, `demoScenarios.ts`, `ReportPanel.tsx`, `types.ts` y `README.md` para confirmar módulos, fórmulas y textos oficiales antes de redactar.
2. Escribir el archivo en español, con encabezados jerárquicos claros, listas y tablas cuando aporten.
3. Sin código fuente ni jerga técnica interna (nombres de archivos, hooks, etc.); mantener el registro accesible a docentes y coordinadores académicos.

## Entregable

Un único archivo Markdown listo para compartir con stakeholders no técnicos.
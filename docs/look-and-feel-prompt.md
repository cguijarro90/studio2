# Prompt de Diseño para Replicar el Look & Feel de "Biomass Mapper"

## Resumen del Proyecto

El objetivo es desarrollar una nueva aplicación web con un *look and feel* (apariencia y estilo) inspirado en la aplicación "Biomass Mapper". Este prompt se centra exclusivamente en las directrices de diseño visual, dejando la funcionalidad específica de la nueva aplicación para ser definida por separado. La aplicación debe ser moderna, limpia, profesional y altamente funcional.

## Stack Tecnológico de Frontend

La aplicación se construirá utilizando el siguiente stack tecnológico para asegurar la consistencia del diseño:

-   **Framework:** Next.js con App Router
-   **Lenguaje:** TypeScript
-   **Librería de Componentes:** React
-   **UI Kit:** ShadCN/UI
-   **Estilos:** Tailwind CSS
-   **Iconografía:** Lucide-React

## Directrices de Estilo Visual

### 1. Paleta de Colores (Tema Claro)

El diseño se basará en un tema claro, profesional y de alto contraste. Los colores se definirán como variables HSL en `src/app/globals.css` para el tema de ShadCN.

-   **Fondo (`--background`):** Blanco puro (`0 0% 100%`).
-   **Texto Principal (`--foreground`):** Casi negro, un gris muy oscuro para una lectura cómoda (`222.2 84% 4.9%`).
-   **Primario (`--primary`):** Un azul corporativo oscuro, usado para elementos de marca principal como el título y los botones de acción (`240 100% 10%`).
-   **Acento (`--accent`):** Un verde brillante y llamativo, usado para estados "hover", switches activos y otros elementos que requieran atención visual (`150 100% 50%`).
-   **Tarjetas y Popovers (`--card`, `--popover`):** Blanco puro, a juego con el fondo.
-   **Bordes (`--border`):** Un gris claro y sutil para separar elementos sin sobrecargar visualmente (`210 40% 89.8%`).

### 2. Tipografía

La tipografía debe ser limpia, moderna y muy legible.

-   **Fuente Principal:** 'Neue Haas Grotesk'. Debe ser importada localmente usando `@font-face` en `globals.css` para el cuerpo del texto (`font-body`) y los titulares (`font-headline`).
-   **Peso de Fuente:** Utilizar `normal` para el texto del cuerpo y `bold` para los titulares y elementos importantes.
-   **Jerarquía:** Establecer una clara jerarquía visual usando diferentes tamaños de texto. Por ejemplo, `text-2xl` para títulos principales, `text-base` o `text-sm` para el cuerpo y `text-muted-foreground` para textos secundarios.

### 3. Maquetación y Layout (Layout)

La estructura principal de la aplicación debe ser un diseño asimétrico de dos columnas en escritorio, que se adapta a una vista de una sola columna en dispositivos móviles.

-   **Escritorio:** Un layout de dos columnas:
    -   **Contenido Principal (70% del ancho):** Un área grande a la izquierda, ideal para visualizaciones de datos, mapas o contenido principal.
    -   **Panel Lateral (30% del ancho):** Un panel a la derecha, con un ancho fijo (ej. `30rem`), que contiene los controles, filtros y listas de resultados. Este panel debe tener un borde izquierdo (`border-l`) para separarlo del contenido principal.
-   **Móvil:** El panel lateral se oculta y se convierte en un `Sheet` (panel deslizable) que se activa mediante un botón flotante (ej. `MobilePanelToggle`) anclado en la parte inferior derecha de la pantalla.

### 4. Estilo de Componentes (ShadCN UI)

Todos los componentes deben seguir una estética coherente, utilizando las primitivas de ShadCN/UI.

-   **Tarjetas (`Card`):** Usar bordes sutiles, esquinas redondeadas (`rounded-lg`) y una ligera sombra (`shadow-sm`) para darles profundidad. El fondo debe ser `bg-card`.
-   **Botones (`Button`):**
    -   El botón de acción principal debe usar el color `primary`.
    -   Los botones secundarios deben usar la variante `secondary` o `ghost`.
    -   Los botones deben tener esquinas redondeadas (`rounded-md`).
-   **Formularios (`Input`, `Slider`, `Switch`):**
    -   **Inputs:** Deben tener un borde claro (`border-input`) y un `ring` de color primario al enfocarlos.
    -   **Switches:** Deben usar el color `accent` cuando están activados.
    -   **Sliders:** La parte activa del slider debe usar el color `primary`.
-   **Diálogos y Popovers (`Dialog`, `InfoWindow`):** Deben tener fondo `bg-popover`, bordes y sombras para destacar sobre el contenido. Las `InfoWindows` en un mapa deben ser compactas y con un botón de cierre claro (`X`).

### 5. Iconografía

-   Utilizar exclusivamente la librería `lucide-react`.
-   Los iconos deben ser consistentes en tamaño (ej. `h-5 w-5`) y grosor de línea.
-   Asociar iconos a acciones y tipos de datos para mejorar la usabilidad (ej. un icono de `HelpCircle` para la ayuda, iconos de `MapPin` para ubicaciones, etc.).

Con este prompt, cualquier modelo de lenguaje debería ser capaz de generar una estructura de proyecto y estilos CSS que se asemejen mucho a la aplicación actual, proporcionando una base sólida sobre la cual construir la nueva funcionalidad.
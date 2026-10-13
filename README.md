# 🌐 DevPulse — Radar Developer & Tech News Hub

> **Plataforma en tiempo real para desarrolladores, entusiastas de la tecnología y telecomunicaciones.**  
> Agrega, categoriza y presenta las últimas noticias, videos y publicaciones de las mejores fuentes globales y creadores destacados en una interfaz fluida inspirada en el diseño de Apple.

---

## 📋 Tabla de Contenidos

1. [¿De qué se trata el proyecto?](#-de-qué-se-trata-el-proyecto)
2. [Objetivo Principal](#-objetivo-principal)
3. [Stack Tecnológico](#-stack-tecnológico)
4. [Arquitectura del Sistema](#-arquitectura-del-sistema)
5. [Fuentes Conectadas](#-fuentes-conectadas)
6. [Diseño e Interfaz de Usuario](#-diseño-e-interfaz-de-usuario)
7. [Despliegue Permanente en la Nube](#-despliegue-permanente-en-la-nube)
8. [Puntos a Mejorar y Roadmap Futuro](#-puntos-a-mejorar-y-roadmap-futuro)
9. [Instalación y Desarrollo Local](#-instalación-y-desarrollo-local)
10. [Licencia y Créditos](#-licencia-y-créditos)

---

## 💡 ¿De qué se trata el proyecto?

**DevPulse** es una aplicación web de alto rendimiento que centraliza el flujo de noticias tech más relevante de Internet en un único panel interactivo. 

En lugar de consultar múltiples sitios (blogs de ingeniería, YouTube, Medium, Hacker News, medios de telecomunicaciones y portales de noticias), DevPulse consolida todo el contenido de forma automatizada mediante Server-Side Rendering (SSR) y consumo de APIs / feeds RSS en tiempo real.

### Características destacadas:
- ⚡ **Agregación Multi-Fuente:** Conecta feeds oficiales, comunidades, creadores y medios tech.
- ⭐ **Spotlight de Creador Oficial:** Sección destacada exclusiva para **midudev** con sus videos más recientes de YouTube, enlaces directos a sus redes y contador de reproducciones.
- 🏷️ **Categorización Heurística Inteligente:** Clasifica cada artículo automáticamente en cuatro categorías clave:
  - `IA & ML`
  - `Software & Dev`
  - `Telecomunicaciones`
  - `General Tech`
- #️⃣ **Extracción de Hashtags y Tendencias:** Identifica tópicos clave (`#ai`, `#react`, `#medium`, `#python`, `#kubernetes`, `#midudev`, etc.) y calcula qué temas son tendencia.
- 🔍 **Búsqueda Instantánea y Filtros Cruzados:** Búsqueda en vivo por título, autor, fragmento, fuente o hashtag, compatible con navegación rápida por teclado (`1` - `5`).
- 🔖 **Modo Guardados (Bookmarks):** Guarda lecturas pendientes con persistencia en `localStorage`.
- 👁️ **QuickSheet Modal:** Vista rápida con reproducción embebida de videos, tiempos estimados de lectura y botones para compartir en X/Twitter, Reddit y LinkedIn.

---

## 🎯 Objetivo Principal

1. **Eliminar el ruido y la fragmentación:** Filtrar el contenido irrelevante y la sobrecarga de información, ofreciendo un radar técnico limpio y enfocado a desarrolladores.
2. **Priorizar fuentes de calidad:** Combinar fuentes técnicas oficiales (Google, GitHub, Vercel, Mozilla), cobertura de telecomunicaciones (Cisco, AT&T, Huawei), discusión comunitaria (Hacker News, DEV, Hugging Face, Medium) y creadores influyentes en español (**midudev**).
3. **Experiencia de usuario premium:** Demostrar una interfaz web moderna, accesible y física, basada en los principios de diseño y animación de Apple (materiales translúcidos, respuesta elástica, desenfoque de fondo y paletas de color con contraste refinado).

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework Base** | **[Astro 7.3+](https://astro.build/)** | Arquitectura orientada a islas, renderizado en servidor (`output: "server"`) y optimización extrema de assets. |
| **UI Framework** | **[React 19](https://react.dev/)** | Componentes interactivos e hidratación en cliente (`client:load`). |
| **Estilos & Diseño** | **[Tailwind CSS v4](https://tailwindcss.com/)** + `@tailwindcss/vite` | Motor de estilos de última generación, variables CSS nativas, soporte P3 y utilidades personalizadas. |
| **Lenguaje** | **[TypeScript 6.0+](https://www.typescriptlang.org/)** | Tipado estricto para entidades de noticias, estados y respuestas de API. |
| **Íconos** | **[Lucide React](https://lucide.dev/)** | Iconografía consistente y ligera. |
| **Parsing RSS** | **`rss-parser` (v3.13+)** | Motor para procesar feeds RSS 2.0 y Atom con extracción de imágenes y metadatos extendidos. |
| **Adaptador Cloud** | **`@astrojs/vercel` (v11+)** | Adaptador oficial para despliegue en Vercel Serverless & Edge Functions. |
| **Runtime** | **Node.js (>=22.12.0)** | Motor de ejecución moderno con soporte para stripping nativo de tipos. |

---

## 🏗️ Arquitectura del Sistema

```
src/
├── components/                 # Componentes React de interfaz de usuario
│   ├── ArticleCard.tsx         # Tarjeta de artículo (modo cuadrícula y compacto)
│   ├── ArticleQuickSheet.tsx   # Modal de hoja rápida (estilo Apple Sheet)
│   ├── BookmarksView.tsx       # Panel de artículos guardados
│   ├── CategoryFilters.tsx     # Pestañas de categorías con atajos numéricos
│   ├── HashtagBar.tsx          # Barra de etiquetas en tendencia y accesos a redes
│   ├── MidudevSpotlight.tsx    # Banner destacado con videos del canal de midudev
│   ├── Navbar.tsx              # Barra de navegación flotante tipo cristal
│   ├── NewsApp.tsx             # Orquestador principal de estado y layout
│   ├── SocialIcons.tsx         # Iconos vectoriales de YouTube, Twitch, X, Reddit, etc.
│   └── SourceFilter.tsx        # Selector de fuentes individuales con badges de estado
├── hooks/
│   ├── useBookmarks.ts         # Hook personalizado para persistencia en localStorage
│   └── useNews.ts              # Hook de filtrado reactivo, recarga y conteo de noticias
├── pages/
│   ├── api/
│   │   └── news.ts             # Endpoint REST (/api/news) con soporte ?refresh=true
│   └── index.astro             # Página principal SSR con pre-carga de datos
├── services/
│   ├── categorizer.ts          # Algoritmo de puntuación por keywords y extracción de hashtags
│   ├── hackerNews.ts           # Integración con API oficial de Hacker News (Firebase)
│   ├── midudevFetcher.ts       # Extractor multi-estrategia para midudev (scrape + seed)
│   ├── newsAggregator.ts       # Agregador central con caché en memoria y deduplicación
│   └── rssParser.ts            # Parser con headers personalizados y extracción de medios
├── styles/
│   └── global.css              # Glassmorphism, animaciones elásticas y tema oscuro profundo
├── types/
│   └── news.ts                 # Definiciones de tipos (Article, SourceInfo, CategoryName, etc.)
└── utils/
    └── formatters.ts           # Formateo de fechas relativas en español
```

### Flujo de Datos y Caché:
1. **Pre-render en Servidor:** Al acceder a la ruta `/`, `index.astro` invoca `aggregateNews(false)` para generar el HTML inicial con datos reales sin pantallas en blanco.
2. **Caché en Memoria (TTL 2 minutos):** `newsAggregator.ts` retiene las respuestas para evitar peticiones repetitivas a los servidores externos y prevenir bloqueos por rate-limit.
3. **Endpoint de Actualización Manual:** Al pulsar el botón de refresco en la UI, se consulta `/api/news?refresh=true`, invalidando la memoria temporal y consultando las fuentes en vivo.

---

## 📡 Fuentes Conectadas

Actualmente DevPulse agrega **15 fuentes simultáneas**:

### 1. Creador Destacado
- **midudev**: Extractor dedicado que recupera los últimos videos del canal de YouTube, miniaturas HQ, vistas y enlaces directos. Incluye modo fallback garantizado.

### 2. Blogs Oficiales de Desarrollo
- **GitHub Blog**: Novedades de la plataforma, Git, seguridad y open source.
- **web.dev (Google)**: Estándares web, métricas Core Web Vitals, CSS moderno y Chrome.
- **Vercel News**: Novedades de Next.js, infraestructura de frontend y AI SDK.
- **Mozilla Hacks**: Artículos profundos de Firefox, WebAssembly y estándares web abiertos.

### 3. Comunidades de Programación
- **DEV Community**: Artículos y tutoriales escritos por la comunidad dev global.
- **Hacker News (Y Combinator)**: Top 25 debates técnicos más valorados con puntuación y comentarios.
- **Hugging Face**: Blog oficial sobre modelos de frontera, IA de código abierto y Transformers.

### 4. Medios Tecnológicos y Publicaciones
- **TechCrunch**: Noticias de startups, rondas de inversión e innovación tecnológica.
- **The New York Times (Technology)**: Periodismo e impacto global de la tecnología.
- **Medium**: Historias técnicas con extracción de sus etiquetas temáticas (`#python`, `#kubernetes`, `#ai`, etc.).

### 5. Telecomunicaciones, Redes & Conectividad
- **Cisco Blogs**: Redes empresariales, ciberseguridad, routers y switches.
- **AT&T México**: Noticias de telecomunicaciones y despliegue local de red.
- **AT&T Global**: Novedades corporativas, conectividad 5G y fibra óptica.
- **Huawei**: Avances en 5G, telecomunicaciones globales y HarmonyOS.

---

## 🎨 Diseño e Interfaz de Usuario

El proyecto sigue una interpretación para la web de los lineamientos de **Apple Interface Design**:

- **Materiales Translúcidos (Glassmorphism):** Paneles con efecto `backdrop-blur-2xl`, bordes con reflejos de luz física (`border-white/[0.08]`) y degradados profundos sobre fondo `#070913`.
- **Efecto de Prensado Físico (`apple-press`):** Micro-interacciones de compresión elástica (`scale: 0.97`) al interactuar con botones o tarjetas.
- **Respuesta Visual al Estado:** Píldoras interactivas con estados de conexión en vivo (puntos verdes para feeds saludables, ámbar para creadores y rojo ante incidencias temporales).
- **Tipografía y Legibilidad:** Jerarquía clara con títulos en fuente Geist/Inter, contraste equilibrado para evitar fatiga visual y lectura cómoda tanto en móvil como en escritorio.
- **Atajos de Teclado:**
  - Presiona las teclas `1` a `5` para saltar inmediatamente entre categorías sin usar el ratón.

---

## ☁️ ¿Se puede quedar subido a la nube de forma permanente?

### **SÍ, 100% permanente y a coste cero ($0 USD/mes)**

El proyecto está diseñado para funcionar indefinidamente en el **Tier Gratuito (Hobby)** de las principales plataformas cloud modernas.

### 1. Opción Recomendada: Vercel (Configurado y Listo)
El proyecto ya cuenta con la dependencia `@astrojs/vercel` integrada en su configuración de compilación.

- **Ventajas:**
  - Despliegue automático con cada `git push` a la rama `main`.
  - Soporte nativo para Serverless Functions de Astro.
  - Certificado SSL automático (HTTPS), dominio `.vercel.app` gratuito y soporte para dominio personalizado.
  - Generosos límites gratuitos: 100,000 ejecuciones de funciones al día y 100 GB de ancho de banda mensual (más que suficiente para miles de visitas diarias).
- **Cómo desplegar en Vercel:**
  1. Ingresa a [vercel.com](https://vercel.com/) e inicia sesión con tu cuenta de GitHub (`angelurrutdev`).
  2. Haz clic en **"Add New... -> Project"**.
  3. Selecciona el repositorio **`DevPulse`**.
  4. Vercel detectará Astro automáticamente. Haz clic en **"Deploy"**.

### 2. Opción Alternativa: Cloudflare Pages
- Ejecución en el Edge global de Cloudflare con latencia ultra-baja.
- Ancho de banda ilimitado y sin coste.
- Solo requiere cambiar el adaptador a `@astrojs/cloudflare` en `astro.config.mjs`.

### 3. Opción Contenedor: Docker / Render / Railway
- Si prefieres alojarlo en tu propio servidor o VPS, puedes ejecutar `npm run build` y correr el servidor Node.js o empaquetarlo en una imagen ligera de Docker.

### 🛡️ Medidas de resiliencia implementadas para permanencia:
- **Tolerancia a fallos:** Si un feed externo (por ejemplo, YouTube o un RSS) se cae o cambia de formato, el resto de las 14 fuentes continúan operando normalmente. La app **nunca se bloquea**.
- **Caché en servidor:** Protege al servidor de saturación de red o límites de peticiones (Rate Limiting).
- **Control de ruido:** Filtros automáticos que descartan noticias que no correspondan al ámbito tecnológico.

---

## 🚀 Puntos a Mejorar y Roadmap Futuro

Para evolucionar DevPulse hacia un producto aún más completo, se sugieren los siguientes puntos de mejora:

1. **Resúmenes Automáticos con Inteligencia Artificial:**
   - Integrar la API de **Google Gemini 1.5 Flash** para generar un micro-resumen de 2 oraciones en español para artículos extensos en inglés.
2. **Base de Datos Persistente (Cloud Sync):**
   - Actualmente los artículos guardados se almacenan en el `localStorage` del navegador del usuario.
   - Conectar **Supabase**, **Turso** o **Neon** con autenticación básica (GitHub OAuth) para sincronizar lecturas guardadas entre el móvil y la laptop.
3. **PWA (Progressive Web App) y Modo Offline:**
   - Añadir `manifest.json` y Service Worker para instalar la aplicación como app nativa en iOS/Android y permitir consultar las últimas noticias leídas sin conexión a internet.
4. **Feeds Personalizables por el Usuario:**
   - Permitir al usuario introducir cualquier enlace RSS o canal de YouTube desde los ajustes para personalizar su propio feed.
5. **Notificaciones Push / Webhook de Alertas:**
   - Enviar notificaciones opcionales cuando midudev publique un nuevo video o surja una noticia de impacto crítico en ciberseguridad o IA.
6. **Búsqueda Semántica:**
   - Búsqueda vectorial mediante embeddings para encontrar noticias por concepto (ej. *"modelos de lenguaje que programan"*) y no solo por coincidencia exacta de palabras.
7. **Pruebas Automatizadas:**
   - Implementar tests unitarios con **Vitest** para los servicios de sanitización, categorización y extracción de hashtags.

---

## 💻 Instalación y Desarrollo Local

### Requisitos previos:
- **Node.js** `>= 22.12.0` (o superior)
- **npm**, **pnpm** o **bun**

### Pasos:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/angelurrutdev/DevPulse.git
   cd DevPulse
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   *Nota: Según las directrices del proyecto, para ejecutarlo en segundo plano puedes usar:*
   ```bash
   npx astro dev --background
   ```
   *Y gestionar con `npx astro dev status`, `npx astro dev logs`, `npx astro dev stop`.*

4. **Abrir en el navegador:**
   Visita `http://localhost:4321` para ver la aplicación funcionando localmente.

5. **Compilar para producción:**
   ```bash
   npm run build
   ```

6. **Comprobar tipos de TypeScript y Astro:**
   ```bash
   npx astro check
   ```

---

## 📄 Licencia

Este proyecto está distribuido bajo la licencia **MIT**. Siéntete libre de modificarlo, compartirlo y adaptarlo a tus necesidades.

---

**Desarrollado con ❤️ para la comunidad developer y tech.**  
Repositorio oficial: [github.com/angelurrutdev/DevPulse](https://github.com/angelurrutdev/DevPulse)

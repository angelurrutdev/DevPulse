# 🎬 Guía Completa: Extracción, Persistencia y Resumen con IA de Transcripciones de YouTube (100% Gratis)

> **Documento técnico y plantilla de arquitectura para replicar en nuevos proyectos.**  
> Esta guía detalla cómo extraer transcripciones de YouTube sin pagar por APIs oficiales, cómo almacenarlas de forma permanente para no volver a consultarlas y cómo generar resúmenes automáticos con Inteligencia Artificial.

---

## 📑 Tabla de Contenidos

1. [Arquitectura General](#1-arquitectura-general)
2. [Variables de Entorno (`.env`)](#2-variables-de-entorno-env)
3. [Implementación en Python (Script Independiente)](#3-implementación-en-python-script-independiente)
4. [Implementación en Node.js / TypeScript](#4-implementación-en-nodejs--typescript)
5. [Estrategia de Persistencia Permanente (Base de Datos)](#5-estrategia-de-persistencia-permanente-base-de-datos)
6. [Pipeline con IA: Generar Resúmenes Automáticos (Gemini API)](#6-pipeline-con-ia-generar-resúmenes-automáticos-gemini-api)
7. [Problemas Comunes y Cómo Resolverlos (Solución de Errores)](#7-problemas-comunes-y-cómo-resolverlos-solución-de-errores)
8. [Estructura de Carpetas Recomendada para tu Nuevo Proyecto](#8-estructura-de-carpetas-recomendada-para-tu-nuevo-proyecto)

---

## 1. Arquitectura General

```
[ ID del Video de YouTube ]
           │
           ▼
┌───────────────────────────────┐
│ ¿Existe en la Base de Datos?  │
└───────────────────────────────┘
     │                    │
    SÍ                   NO
     │                    │
     │                    ▼
     │       ┌─────────────────────────────────────┐
     │       │ Extraer Transcripción de YouTube    │
     │       │ (youtube-transcript-api / library)  │
     │       └─────────────────────────────────────┘
     │                    │
     │                    ▼
     │       ┌─────────────────────────────────────┐
     │       │ Resumen opcional con IA (Gemini)    │
     │       └─────────────────────────────────────┘
     │                    │
     │                    ▼
     │       ┌─────────────────────────────────────┐
     │       │ Guardar en Base de Datos permanente │
     │       └─────────────────────────────────────┘
     │                    │
     ▼                    ▼
   [ Retornar resultado instantáneo al usuario ]
```

**Regla de oro:** YouTube nunca cambia las transcripciones de un video ya publicado. El patrón debe ser **"Fetch Once, Cache Forever"** (Descargar una sola vez, almacenar para siempre).

---

## 2. Variables de Entorno (`.env`)

Crea un archivo `.env` en la raíz de tu nuevo proyecto con estas variables:

```bash
# ==========================================
# 1. Base de Datos (Opciones gratuitas)
# ==========================================
# Si usas Supabase (PostgreSQL en la nube gratuito):
SUPABASE_URL="https://tu-proyecto.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

# O si usas PostgreSQL directo / Neon / Turso:
DATABASE_URL="postgresql://usuario:password@host:5432/db"

# ==========================================
# 2. Inteligencia Artificial (Para resúmenes)
# ==========================================
# Google Gemini API (Tier gratuito muy generoso, 15 RPM sin coste):
# Obtén tu clave en: https://aistudio.google.com/app/apikey
GEMINI_API_KEY="AIzaSy..."

# Opcional si prefieres OpenAI / Groq:
# GROQ_API_KEY="gsk_..."
# OPENAI_API_KEY="sk-..."

# ==========================================
# 3. Configuración de Idiomas
# ==========================================
DEFAULT_TRANSCRIPT_LANGUAGES="es,es-419,es-ES,en"
```

---

## 3. Implementación en Python (Script Independiente)

Python es el lenguaje con mejor ecosistema para scraping y tareas de datos.

### Instalación de dependencias:

```bash
pip install youtube-transcript-api google-genai python-dotenv supabase
```

### Código: `transcript_extractor.py`

```python
import os
import re
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound

load_dotenv()

def extraer_video_id(url_o_id: str) -> Optional[str]:
    """
    Extrae el ID de 11 caracteres de cualquier URL de YouTube (shorts, watch, youtu.be)
    """
    patron = r'(?:v=|\/|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})'
    match = re.search(patron, url_o_id)
    return match.group(1) if match else (url_o_id if len(url_o_id) == 11 else None)


def obtener_transcripcion_youtube(
    video_id: str, 
    idiomas: list[str] = ['es', 'es-419', 'es-ES', 'en'],
    con_timestamps: bool = False
) -> Dict[str, Any]:
    """
    Descarga la transcripción oficial o automática de YouTube sin usar API Keys.
    """
    clean_id = extraer_video_id(video_id)
    if not clean_id:
        return {"ok": False, "error": "ID de video inválido", "video_id": video_id}

    try:
        # Obtener los subtítulos ordenados por preferencia de idioma
        transcript_data = YouTubeTranscriptApi.get_transcript(clean_id, languages=idiomas)
        
        # Formato texto plano continuo
        texto_plano = " ".join([fragmento['text'] for fragmento in transcript_data])
        # Limpieza básica de saltos de línea repetidos
        texto_limpio = re.sub(r'\s+', ' ', texto_plano).strip()

        resultado = {
            "ok": True,
            "video_id": clean_id,
            "texto": texto_limpio,
            "total_palabras": len(texto_limpio.split()),
        }

        if con_timestamps:
            # Lista con [{'start': 0.0, 'duration': 4.2, 'text': 'Hola mundo'}]
            resultado["fragmentos"] = transcript_data

        return resultado

    except TranscriptsDisabled:
        return {"ok": False, "error": "El autor desactivó los subtítulos para este video", "video_id": clean_id}
    except NoTranscriptFound:
        return {"ok": False, "error": f"No se encontraron subtítulos en los idiomas: {idiomas}", "video_id": clean_id}
    except Exception as e:
        return {"ok": False, "error": str(e), "video_id": clean_id}


# Prueba de uso:
if __name__ == "__main__":
    # Video de midudev: "Espionaje en la era de la IA"
    id_prueba = "IHs3rhATACU"
    res = obtener_transcripcion_youtube(id_prueba)
    
    if res["ok"]:
        print(f"✅ Transcripción obtenida con éxito ({res['total_palabras']} palabras)")
        print(f"Fragmento: {res['texto'][:300]}...")
    else:
        print(f"❌ Error: {res['error']}")
```

---

## 4. Implementación en Node.js / TypeScript

Si tu nuevo proyecto usa **Next.js**, **Express**, **Astro** o **Fastify**, puedes usar Node.js sin instalar Python.

### Instalación de dependencias:

```bash
npm install youtube-transcript dotenv
npm install -D @types/node typescript
```

### Código: `src/services/youtubeTranscript.ts`

```typescript
import { YoutubeTranscript } from 'youtube-transcript';

export interface TranscriptResult {
  ok: boolean;
  videoId: string;
  text?: string;
  wordCount?: number;
  fragments?: Array<{ text: string; start: number; duration: number }>;
  error?: string;
}

export function extractYouTubeId(urlOrId: string): string | null {
  const match = urlOrId.match(/(?:v=|\/|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];
  return urlOrId.length === 11 ? urlOrId : null;
}

export async function fetchVideoTranscript(
  urlOrId: string,
  preferredLanguage = 'es'
): Promise<TranscriptResult> {
  const videoId = extractYouTubeId(urlOrId);

  if (!videoId) {
    return { ok: false, videoId: urlOrId, error: 'ID de video inválido' };
  }

  try {
    const rawFragments = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: preferredLanguage,
    });

    if (!rawFragments || rawFragments.length === 0) {
      return { ok: false, videoId, error: 'No se encontraron subtítulos disponibles' };
    }

    const fullText = rawFragments
      .map((item) => item.text.replace(/&amp;/g, '&').replace(/&#39;/g, "'"))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      ok: true,
      videoId,
      text: fullText,
      wordCount: fullText.split(/\s+/).length,
      fragments: rawFragments.map((f) => ({
        text: f.text,
        start: f.offset / 1000,
        duration: f.duration / 1000,
      })),
    };
  } catch (err: any) {
    return {
      ok: false,
      videoId,
      error: err?.message || 'Error desconocido al obtener la transcripción',
    };
  }
}
```

---

## 5. Estrategia de Persistencia Permanente (Base de Datos)

Para que el transcript quede guardado permanentemente y tu aplicación responda en **menos de 10 milisegundos**, crea esta tabla SQL:

### Esquema SQL (PostgreSQL / Supabase / Neon):

```sql
CREATE TABLE IF NOT EXISTS video_transcripts (
    video_id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(300),
    channel_name VARCHAR(150),
    language VARCHAR(10) DEFAULT 'es',
    transcript TEXT NOT NULL,
    summary TEXT,
    word_count INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por palabras clave en la transcripción
CREATE INDEX idx_transcripts_fts ON video_transcripts USING gin(to_tsvector('spanish', transcript));
```

### Script de Guardado Permanente con Supabase en TypeScript:

```typescript
import { createClient } from '@supabase/supabase-js';
import { fetchVideoTranscript } from './youtubeTranscript';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getOrFetchPermanentTranscript(videoId: string, title?: string) {
  // 1. Revisar si ya está en base de datos
  const { data: existing } = await supabase
    .from('video_transcripts')
    .select('*')
    .eq('video_id', videoId)
    .single();

  if (existing) {
    return { fromCache: true, data: existing };
  }

  // 2. Si no existe, descargar de YouTube
  const fetched = await fetchVideoTranscript(videoId);
  if (!fetched.ok || !fetched.text) {
    throw new Error(fetched.error || 'Fallo al descargar transcripción');
  }

  // 3. Guardar en Base de Datos para siempre
  const newRow = {
    video_id: videoId,
    title: title || 'Video de YouTube',
    transcript: fetched.text,
    word_count: fetched.wordCount,
  };

  await supabase.from('video_transcripts').upsert(newRow);

  return { fromCache: false, data: newRow };
}
```

---

## 6. Pipeline con IA: Generar Resúmenes Automáticos (Gemini API)

Una vez que tienes el texto de la transcripción, puedes usar la **API oficial gratuita de Gemini** para generar resúmenes ejecutivos en español.

### Código en Python (`summarizer.py`):

```python
import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

PROMPT_SISTEMA = """
Eres un asistente editorial experto en tecnología y desarrollo de software.
A partir de la transcripción de un video de YouTube, genera:
1. Un resumen ejecutivo en 2 oraciones concisas.
2. 3 a 5 puntos clave (bullets) con los temas técnicos más relevantes aprendidos.
3. 3 hashtags temáticos recomendados.
Responde en formato Markdown limpio, directo y sin introducciones innecesarias.
"""

def resumir_transcripcion(texto_transcripcion: str, titulo: str = "") -> str:
    # Si el texto es muy largo, recortamos a ~20,000 palabras para evitar saturar contexto
    texto_seguro = texto_transcripcion[:60000]

    prompt_usuario = f"""
    Título del Video: {titulo}
    
    Transcripción del Video:
    \"\"\"{texto_seguro}\"\"\"
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            {"role": "user", "parts": [{"text": PROMPT_SISTEMA + "\n\n" + prompt_usuario}]}
        ],
    )
    return response.text
```

---

## 7. Problemas Comunes y Cómo Resolverlos (Solución de Errores)

| Problema | Causa | Solución Definitiva |
| :--- | :--- | :--- |
| **`TranscriptsDisabled`** | El creador del video desactivó explícitamente los subtítulos en YouTube Studio. | Capturar la excepción y mostrar un mensaje claro: *"Este video no cuenta con subtítulos habilitados"*. Opcionalmente usar Whisper de OpenAI si tienes el audio. |
| **`NoTranscriptFound`** | El video solo tiene subtítulos en inglés y pediste español. | Configurar siempre una lista con fallback: `languages=['es', 'es-419', 'en']`. Si está en inglés, puedes traducirlo con Gemini. |
| **Bloqueo de IP en la nube (HTTP 429 / Too Many Requests)** | YouTube a veces bloquea las IPs de servidores cloud (AWS, Vercel, DigitalOcean) si se hacen demasiadas peticiones seguidas. | **1.** Siempre revisar primero la base de datos antes de pedir a YouTube.<br>**2.** En scripts de extracción masiva, agregar una pausa: `time.sleep(1)`.<br>**3.** Si se ejecuta en un worker de fondo, pasar una cookie de sesión o proxy residencial. |
| **Textos con etiquetas HTML (`&amp;`, `&#39;`)** | Formato heredado del reproductor XML de YouTube. | Limpiar con regex o funciones de sanitización antes de guardar en la BD. |

---

## 8. Estructura de Carpetas Recomendada para tu Nuevo Proyecto

Si vas a inicializar tu nuevo proyecto dedicado a esto, esta es la estructura más limpia y modular:

```text
mi-proyecto-transcripts/
├── .env.example                # Plantilla de variables de entorno
├── .env                        # Tus credenciales secretas (ignorado en .gitignore)
├── requirements.txt            # Dependencias Python (o package.json si usas Node)
├── README.md                   # Documentación de tu proyecto
├── schema.sql                  # Definición de la tabla en base de datos
├── src/
│   ├── config.py               # Carga de variables con pydantic o os.getenv
│   ├── database.py             # Conexión a Supabase / SQLite / PostgreSQL
│   ├── extractor.py            # Funciones para obtener subtítulos de YouTube
│   ├── ai_service.py           # Conexión con Gemini para resúmenes
│   └── main.py                 # Orquestador del pipeline o API FastAPI / Express
```

---

### 📦 Resumen de Dependencias para copiar y pegar:

#### En Python:
```bash
pip install youtube-transcript-api google-genai python-dotenv supabase
```

#### En Node.js:
```bash
npm install youtube-transcript @google/genai @supabase/supabase-js dotenv
```

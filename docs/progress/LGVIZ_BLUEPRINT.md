# 🎮 LgoViz — Project Blueprint (Master Document)

> **Versi:** 1.0 | **Dibuat:** April 2026  
> **Deskripsi:** Media pembelajaran visualisasi algoritma berbasis web untuk siswa SMK RPL — stack Next.js + Supabase + pixel art UI.  
> **Dokumen ini adalah "bible" project. Baca sebelum mulai setiap step.**

---

## 📋 DAFTAR ISI

1. [Role](#1-role)
2. [Context](#2-context)
3. [Constraint](#3-constraint)
4. [Chaining — Master Plan](#4-chaining--master-plan)
5. [Struktur Folder Target](#5-struktur-folder-target)
6. [Skema Database Supabase](#6-skema-database-supabase)
7. [Desain Sistem Interpreter Engine](#7-desain-sistem-interpreter-engine)
8. [Panduan Tema Pixel Art](#8-panduan-tema-pixel-art)
9. [Template Prompt Per Step](#9-template-prompt-per-step)
10. [Template Summary MD Per Step](#10-template-summary-md-per-step)

---

## 1. ROLE

```
Kamu adalah senior fullstack developer dan UI/UX engineer yang spesialis dalam:
- Membangun aplikasi web edukasi interaktif dengan Next.js 14+ (App Router) dan TypeScript
- Membuat interpreter engine berbasis JavaScript untuk memvisualisasikan eksekusi kode C++
- Mendesain antarmuka bergaya pixel art / retro game dengan Tailwind CSS
- Mengintegrasikan autentikasi dan database dengan Supabase

Kamu memahami konteks bahwa ini adalah media pembelajaran untuk siswa SMK jurusan RPL
yang perlu memahami logika pemrograman (percabangan, perulangan, struktur data) secara visual
dan interaktif. Pengguna utama adalah remaja 15-18 tahun yang familiar dengan browser dan
perangkat digital. Kamu selalu menulis kode yang clean, terstruktur, dan mudah dikembangkan.
```

---

## 2. CONTEXT

### 2.1 Deskripsi Produk
**LgoViz** adalah aplikasi web pembelajaran algoritma yang memungkinkan siswa SMK RPL
mengamati eksekusi kode C++ langkah demi langkah beserta perubahan nilai variabel secara
real-time. Filosofinya seperti W3Schools — konten serius dan edukatif — tapi dengan UI
bergaya pixel art / retro game seperti Codedex.io.

### 2.2 Target Pengguna
- **Primer:** Siswa SMK jurusan RPL kelas X–XI
- **Sekunder:** Guru pemrograman sebagai alat bantu mengajar

### 2.3 Fitur Utama
| Fitur | Deskripsi |
|-------|-----------|
| **Code Editor** | Monaco Editor dengan syntax highlighting C++ |
| **Step Visualizer** | Eksekusi kode C++ langkah demi langkah |
| **Code Highlighter** | Penanda baris aktif yang sedang dieksekusi |
| **Variable Tracker** | Panel real-time perubahan nilai variabel tiap langkah |
| **Animation Control** | Tombol play, pause, next, prev, first, last + speed slider |
| **Modul Konten** | 3 modul: Percabangan, Perulangan, Struktur Data & Algoritma |
| **Auth System** | Login / Register via Supabase Auth |
| **Pixel Art UI** | Tema retro game dengan font pixel, border tebal, aksen neon |

### 2.4 Halaman Aplikasi
```
/                        → Landing Page
/auth/login              → Login
/auth/register           → Register
/dashboard               → Pilih Modul
/learn/[moduleId]        → Halaman Materi + Visualizer
```

### 2.5 Tech Stack
```
Frontend     : Next.js 14 (App Router) + TypeScript
Styling      : Tailwind CSS + Custom CSS Variables (pixel theme)
Code Editor  : Monaco Editor (@monaco-editor/react)
Parser C++   : tree-sitter / tree-sitter-c (WebAssembly build)
Evaluator    : Custom JavaScript evaluator (dibuat manual)
Animasi      : Framer Motion
Auth & DB    : Supabase (Auth + PostgreSQL)
Deployment   : Vercel
Font Pixel   : "Press Start 2P" (Google Fonts)
```

### 2.6 Arsitektur Sistem
```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                │
│                                                      │
│  ┌──────────────┐    ┌──────────────────────────┐   │
│  │ Monaco Editor│───▶│   Interpreter Engine      │   │
│  │  (kode C++)  │    │                          │   │
│  └──────────────┘    │  1. Parser (tree-sitter)  │   │
│                      │     → AST                 │   │
│  ┌──────────────┐    │  2. Evaluator (JS)        │   │
│  │  Modul/Materi│    │     → Execution Trace []  │   │
│  │  (hardcode)  │    └────────────┬─────────────┘   │
│  └──────────────┘                 │                  │
│                                   ▼                  │
│  ┌────────────────────────────────────────────────┐  │
│  │              Visualizer UI                     │  │
│  │  ┌─────────────────┐  ┌─────────────────────┐  │  │
│  │  │ Code Highlighter│  │  Variable Tracker    │  │  │
│  │  │ (baris aktif)   │  │  (nilai variabel)    │  │  │
│  │  └─────────────────┘  └─────────────────────┘  │  │
│  │         ┌────────────────────────────┐          │  │
│  │         │    Animation Controls      │          │  │
│  │         │ ◀◀  ◀  ▶  ▶▶  ⏸  speed   │          │  │
│  │         └────────────────────────────┘          │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
              │ Auth + User Data
              ▼
┌─────────────────────────┐
│      SUPABASE           │
│  - Auth (login/register)│
│  - Table: users         │
└─────────────────────────┘
```

### 2.7 Konten Modul (Hardcode di Frontend)
```
Modul 1: Percabangan
  - if tunggal
  - if-else
  - else-if berantai
  - nested if
  - switch-case

Modul 2: Perulangan
  - for loop
  - while loop
  - do-while loop
  - nested loop
  - break & continue

Modul 3: Struktur Data & Algoritma
  - Array
  - Stack
  - Queue
  - Linear Search
  - Bubble Sort
```

---

## 3. CONSTRAINT

### 3.1 Constraint Teknis
```
1. Interpreter engine HARUS berjalan sepenuhnya di sisi client (client-side only).
   Tidak boleh ada server backend untuk eksekusi kode — alasan: aksesibilitas offline
   dan keamanan (tidak ada code execution di server).

2. Gunakan Next.js App Router (bukan Pages Router).

3. Semua komponen UI yang butuh interaktivitas harus diberi directive "use client".

4. Konten materi (teks penjelasan, template kode) di-hardcode sebagai TypeScript
   object/array di folder /src/data/ — TIDAK disimpan di Supabase.
   Supabase hanya untuk: autentikasi user.

5. Monaco Editor harus di-load dengan dynamic import (next/dynamic) karena SSR
   tidak kompatibel.

6. tree-sitter-c menggunakan WebAssembly — harus diinisialisasi async sebelum dipakai.
   Tangani loading state dengan benar.

7. Execution Trace adalah array of StepObject. Satu step = satu perubahan state program.
   Format:
   {
     stepIndex: number,
     lineNumber: number,
     variables: Record<string, { value: any, type: string, changed: boolean }>,
     output: string[],
     explanation: string
   }

8. Jangan gunakan library CSS component (MUI, Chakra, shadcn) — semua styling
   pakai Tailwind CSS + custom CSS variables saja agar konsisten dengan pixel theme.

9. TypeScript strict mode ON. Tidak ada penggunaan 'any' kecuali di evaluator engine
   yang memang butuh dynamic typing.

10. Setiap komponen harus ada di folder yang sesuai strukturnya (lihat bagian 5).
```

### 3.2 Constraint Desain
```
1. Warna utama: dark background (#0a0a0f), aksen neon hijau (#00ff88) dan
   neon biru (#00d4ff), teks utama (#e2e8f0).

2. Font heading / aksen: "Press Start 2P" (pixel font).
   Font body / konten: "VT323" atau "Courier New" (monospace retro).

3. Border style: solid 2px dengan warna aksen — NO rounded corners kecuali
   di komponen kecil seperti badge/tag.

4. Animasi: blocky/snappy (tidak smooth easing). Gunakan steps() di CSS transition
   untuk efek pixel.

5. Semua panel utama punya "scanline" effect subtle di background (CSS overlay).

6. Cursor custom: pixel cursor jika memungkinkan.

7. Responsive: minimal bisa dipakai di tablet (768px). Mobile bukan prioritas utama.
```

### 3.3 Constraint Proses
```
1. Setiap step chaining WAJIB diakhiri dengan membuat file summary:
   /docs/progress/step-[N]-summary.md

2. Summary berisi: daftar file yang dibuat/diubah, keputusan teknis, masalah
   yang ditemukan + solusinya, dan konteks untuk step berikutnya.

3. Jangan lanjut ke step berikutnya sebelum summary dibuat.

4. Jika ada perubahan dari rencana awal, catat di summary sebagai
   "⚠️ DEVIATION" beserta alasannya.

5. Test setiap fitur secara manual sebelum pindah step.
```

---

## 4. CHAINING — MASTER PLAN

### Overview
```
STEP 1 → Setup & Auth
STEP 2 → Layout & Pixel Art Theme
STEP 3 → Data Konten & Halaman Materi
STEP 4 → Interpreter Engine (Core)
STEP 5 → Visualizer UI
STEP 6 → Animation Controls & Polish
STEP 7 → Integrasi Final & Deploy
```

---

### STEP 1 — Project Setup & Autentikasi
**Durasi estimasi:** 1–2 hari  
**Output:** Project bisa dijalankan, halaman login/register berfungsi

**Yang dikerjakan:**
- Init project Next.js 14 + TypeScript + Tailwind CSS
- Setup Supabase project (buat project, copy env keys)
- Install semua dependencies utama
- Konfigurasi Tailwind dengan custom pixel theme (warna, font)
- Buat layout dasar (Navbar, Footer)
- Halaman `/auth/login` dan `/auth/register`
- Supabase Auth integration (signIn, signUp, signOut)
- Protected route: `/dashboard` hanya bisa diakses kalau sudah login
- Middleware Next.js untuk auth guard

**Dependencies yang diinstall di step ini:**
```bash
npm install @supabase/supabase-js @supabase/ssr
npm install framer-motion
npm install @monaco-editor/react
```

**File yang dibuat:**
```
src/
  app/
    layout.tsx               ← Root layout + font import
    page.tsx                 ← Landing page (placeholder dulu)
    auth/
      login/page.tsx
      register/page.tsx
    dashboard/page.tsx       ← Protected, placeholder
  components/
    ui/
      PixelButton.tsx        ← Komponen tombol pixel art
      PixelCard.tsx          ← Komponen card pixel art
    layout/
      Navbar.tsx
      Footer.tsx
  lib/
    supabase/
      client.ts              ← Supabase browser client
      server.ts              ← Supabase server client
  middleware.ts              ← Auth guard
  styles/
    globals.css              ← CSS variables + scanline effect
```

**Kriteria selesai (Definition of Done):**
- [ ] `npm run dev` berjalan tanpa error
- [ ] User bisa register akun baru
- [ ] User bisa login
- [ ] User bisa logout
- [ ] Akses `/dashboard` tanpa login → redirect ke `/auth/login`
- [ ] Font "Press Start 2P" muncul di heading
- [ ] Warna tema dark sudah teraplikasi

---

### STEP 2 — Layout & Pixel Art Theme
**Durasi estimasi:** 1–2 hari  
**Output:** Semua halaman punya shell UI yang konsisten dan terlihat seperti pixel art game

**Yang dikerjakan:**
- Landing page lengkap (hero section, feature cards, CTA)
- Dashboard page (grid modul dengan pixel card)
- Shell halaman `/learn/[moduleId]` (layout split: editor kiri, visualizer kanan)
- Komponen UI pixel art library:
  - `PixelButton` (primary, secondary, danger)
  - `PixelCard` (dengan border retro)
  - `PixelBadge` (untuk label modul)
  - `ProgressBar` pixel style
  - `Navbar` dengan pixel logo
- Efek visual: scanline overlay, CRT glow pada text, cursor blink
- Animasi masuk halaman dengan Framer Motion (blocky transitions)

**File yang dibuat/diubah:**
```
src/
  app/
    page.tsx                 ← Landing page lengkap
    dashboard/page.tsx       ← Grid modul
    learn/[moduleId]/
      page.tsx               ← Shell layout visualizer
  components/
    ui/
      PixelButton.tsx
      PixelCard.tsx
      PixelBadge.tsx
      PixelProgressBar.tsx
      ScanlineOverlay.tsx
    sections/
      HeroSection.tsx
      FeatureSection.tsx
      ModuleGrid.tsx
  styles/
    globals.css              ← Tambah pixel effects
```

**Kriteria selesai:**
- [ ] Landing page terlihat seperti game retro, bukan website biasa
- [ ] Font "Press Start 2P" konsisten di semua heading
- [ ] Warna neon (#00ff88, #00d4ff) muncul sebagai aksen
- [ ] Semua halaman sudah punya layout shell yang benar
- [ ] Tidak ada komponen yang pakai warna/font "default" Tailwind

---

### STEP 3 — Data Konten & Halaman Materi
**Durasi estimasi:** 1–2 hari  
**Output:** Semua konten materi bisa dibaca, halaman learn berfungsi dengan template kode

**Yang dikerjakan:**
- Buat TypeScript data structure untuk modul, topik, dan template kode
- Isi semua 15 topik dengan:
  - Judul dan deskripsi
  - Penjelasan konsep (teks)
  - Template kode C++ starter
  - Kode C++ contoh yang sudah benar
  - Poin-poin learning objective
- Halaman `/learn/[moduleId]` menampilkan:
  - Sidebar daftar topik
  - Panel materi (teks penjelasan)
  - Monaco Editor dengan template kode
  - Navigasi antar topik

**File yang dibuat:**
```
src/
  data/
    modules.ts               ← Master data semua modul
    topics/
      percabangan.ts         ← 5 topik percabangan
      perulangan.ts          ← 5 topik perulangan
      struktur-data.ts       ← 5 topik struktur data
  types/
    module.ts                ← TypeScript types
  app/
    learn/[moduleId]/
      page.tsx               ← Update dengan data nyata
  components/
    learn/
      TopicSidebar.tsx
      MaterialPanel.tsx
      CodeEditorPanel.tsx
```

**Struktur Data TypeScript:**
```typescript
// types/module.ts
export interface Topic {
  id: string
  title: string
  description: string
  explanation: string        // HTML atau markdown
  starterCode: string        // Kode C++ untuk editor
  solutionCode: string       // Kode C++ contoh lengkap
  learningObjectives: string[]
}

export interface Module {
  id: string
  title: string
  description: string
  icon: string               // emoji atau icon name
  topics: Topic[]
}
```

**Kriteria selesai:**
- [ ] Semua 15 topik punya konten lengkap
- [ ] Monaco Editor muncul dengan kode starter
- [ ] Sidebar menampilkan daftar topik dan bisa diklik
- [ ] Navigasi next/prev antar topik berfungsi
- [ ] Tidak ada halaman yang crash karena data kosong

---

### STEP 4 — Interpreter Engine (Core)
**Durasi estimasi:** 3–5 hari (step terberat)  
**Output:** Kode C++ bisa dieksekusi dan menghasilkan execution trace yang akurat

**Yang dikerjakan:**
- Setup dan inisialisasi tree-sitter-c (WebAssembly)
- Build parser: kode C++ string → AST
- Build evaluator JavaScript: AST → Execution Trace[]
- Evaluator harus support:
  - Deklarasi variabel (int, float, double, char, bool, string)
  - Assignment dan operator aritmatika (+, -, *, /, %)
  - Operator perbandingan (==, !=, <, >, <=, >=)
  - Operator logika (&&, ||, !)
  - Percabangan: if, if-else, else-if, nested if, switch-case
  - Perulangan: for, while, do-while, nested loop, break, continue
  - Array satu dimensi
  - Stack dan Queue (simulasi manual)
  - `cout` output
- Error handling: syntax error, runtime error (infinite loop guard)
- Unit test evaluator dengan kode C++ sederhana

**File yang dibuat:**
```
src/
  lib/
    interpreter/
      index.ts               ← Entry point, export utama
      parser.ts              ← Wrapper tree-sitter-c
      evaluator.ts           ← Core evaluator (terbesar)
      types.ts               ← Types untuk ExecutionTrace, Step, dll
      utils.ts               ← Helper functions
      builtins.ts            ← Simulasi cout, stack, queue
  __tests__/
    interpreter/
      evaluator.test.ts      ← Unit tests
```

**Format Execution Trace:**
```typescript
// lib/interpreter/types.ts
export interface Variable {
  name: string
  value: any
  type: string              // "int" | "float" | "bool" | "string" | ...
  changed: boolean          // true jika berubah di step ini
}

export interface ExecutionStep {
  stepIndex: number
  lineNumber: number        // baris mana yang aktif
  variables: Variable[]    // semua variabel beserta nilainya
  output: string[]          // output cout sampai step ini
  explanation: string       // penjelasan langkah dalam bahasa Indonesia
  scopeDepth: number        // kedalaman scope (untuk indent visual)
}

export interface ExecutionTrace {
  steps: ExecutionStep[]
  totalSteps: number
  hasError: boolean
  errorMessage?: string
}
```

**Kriteria selesai:**
- [ ] Kode `int main(){ int x = 5; if(x > 3){ cout << "yes"; } }` menghasilkan trace yang benar
- [ ] For loop sederhana menghasilkan trace per iterasi
- [ ] Nested loop menghasilkan trace yang benar untuk setiap iterasi
- [ ] Infinite loop terhenti dengan error message setelah 1000 langkah
- [ ] Syntax error menghasilkan pesan error yang jelas
- [ ] Semua unit test pass

---

### STEP 5 — Visualizer UI
**Durasi estimasi:** 2–3 hari  
**Output:** Visualizer lengkap terhubung dengan interpreter engine

**Yang dikerjakan:**
- `CodeHighlighter`: Monaco Editor yang menampilkan highlight baris aktif
- `VariableTracker`: Panel yang menampilkan semua variabel + animasi saat nilai berubah
- `OutputConsole`: Panel output cout
- `ExplanationPanel`: Teks penjelasan langkah saat ini
- `StepIndicator`: Indikator step ke-N dari total
- Integrasi semua komponen dalam halaman `/learn/[moduleId]`
- Tombol "Run" untuk menjalankan interpreter dan menghasilkan trace
- State management: `currentStep`, `executionTrace`, `isRunning`

**File yang dibuat:**
```
src/
  components/
    visualizer/
      CodeHighlighter.tsx    ← Monaco + line highlight
      VariableTracker.tsx    ← Panel variabel
      OutputConsole.tsx      ← Panel cout output
      ExplanationPanel.tsx   ← Penjelasan langkah
      StepIndicator.tsx      ← Step counter
      VisualizerShell.tsx    ← Wrapper semua komponen
  hooks/
    useInterpreter.ts        ← Custom hook untuk interpreter state
```

**State di useInterpreter:**
```typescript
// hooks/useInterpreter.ts
interface InterpreterState {
  trace: ExecutionTrace | null
  currentStep: number
  isRunning: boolean
  isPlaying: boolean
  speed: number             // ms per step saat auto-play
  error: string | null
}
```

**Kriteria selesai:**
- [ ] Tekan "Run" → Monaco Editor highlight baris pertama
- [ ] Variable Tracker menampilkan semua variabel
- [ ] Variabel yang baru berubah muncul dengan highlight berbeda (flash animasi)
- [ ] Output console menampilkan hasil cout bertahap
- [ ] Penjelasan langkah muncul di panel bawah
- [ ] StepIndicator menunjukkan "Step 3 / 24"

---

### STEP 6 — Animation Controls & Polish
**Durasi estimasi:** 1–2 hari  
**Output:** Kontrol animasi lengkap, UI polished, siap presentasi

**Yang dikerjakan:**
- `AnimationControls` component:
  - Tombol: ⏮ (first) | ◀ (prev) | ▶/⏸ (play/pause) | ▶ (next) | ⏭ (last)
  - Speed slider: 0.5x, 1x, 2x, 3x
  - Keyboard shortcuts: Arrow keys, Space untuk play/pause
- Auto-play mode: step berjalan otomatis sesuai speed
- Animasi variabel berubah (flash neon saat value change)
- Pixel sound effects (opsional, toggle on/off)
- Loading state saat interpreter parsing
- Error state dengan pesan yang jelas
- Responsive fine-tuning (tablet 768px)
- Review semua halaman: konsistensi warna, font, spacing

**File yang dibuat:**
```
src/
  components/
    visualizer/
      AnimationControls.tsx
    ui/
      PixelSlider.tsx
      PixelTooltip.tsx
  hooks/
    useKeyboardShortcuts.ts
```

**Kriteria selesai:**
- [ ] Auto-play berjalan dan berhenti otomatis di step terakhir
- [ ] Speed slider mengubah kecepatan auto-play
- [ ] Keyboard shortcuts berfungsi (ArrowLeft/Right, Space)
- [ ] Animasi flash pada variabel yang berubah nilai
- [ ] Semua halaman konsisten pixel art theme
- [ ] Tidak ada layout yang "pecah" di 768px

---

### STEP 7 — Integrasi Final & Deploy
**Durasi estimasi:** 1 hari  
**Output:** LgoViz live di internet, siap presentasi

**Yang dikerjakan:**
- End-to-end testing semua flow
- Bug fixing dari testing
- Optimasi performance (lazy loading, dynamic import)
- SEO metadata di setiap halaman
- README.md project
- Deploy ke Vercel
- Custom domain (opsional)
- Screenshot/video demo untuk portofolio

**File yang dibuat:**
```
README.md
.env.example
docs/
  progress/               ← Semua summary step ada di sini
```

**Kriteria selesai:**
- [ ] App live di Vercel
- [ ] Register → Login → Pilih modul → Jalankan visualizer → semua jalan
- [ ] Tidak ada console error di production
- [ ] README menjelaskan cara setup project
- [ ] Link deploy sudah jalan di Chrome dan Firefox

---

## 5. STRUKTUR FOLDER TARGET

```
lgovic/
├── src/
│   ├── app/                          ← Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx                  ← Landing page
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── learn/
│   │       └── [moduleId]/
│   │           └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/                       ← Pixel UI library
│   │   │   ├── PixelButton.tsx
│   │   │   ├── PixelCard.tsx
│   │   │   ├── PixelBadge.tsx
│   │   │   ├── PixelSlider.tsx
│   │   │   ├── PixelTooltip.tsx
│   │   │   └── ScanlineOverlay.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── sections/                 ← Landing page sections
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeatureSection.tsx
│   │   │   └── ModuleGrid.tsx
│   │   ├── learn/                    ← Halaman materi
│   │   │   ├── TopicSidebar.tsx
│   │   │   ├── MaterialPanel.tsx
│   │   │   └── CodeEditorPanel.tsx
│   │   └── visualizer/               ← Inti visualizer
│   │       ├── VisualizerShell.tsx
│   │       ├── CodeHighlighter.tsx
│   │       ├── VariableTracker.tsx
│   │       ├── OutputConsole.tsx
│   │       ├── ExplanationPanel.tsx
│   │       ├── StepIndicator.tsx
│   │       └── AnimationControls.tsx
│   │
│   ├── data/                         ← Konten hardcode
│   │   ├── modules.ts                ← Master list modul
│   │   └── topics/
│   │       ├── percabangan.ts
│   │       ├── perulangan.ts
│   │       └── struktur-data.ts
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   └── interpreter/
│   │       ├── index.ts
│   │       ├── parser.ts
│   │       ├── evaluator.ts
│   │       ├── builtins.ts
│   │       ├── utils.ts
│   │       └── types.ts
│   │
│   ├── hooks/
│   │   ├── useInterpreter.ts
│   │   └── useKeyboardShortcuts.ts
│   │
│   ├── types/
│   │   └── module.ts
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   └── middleware.ts
│
├── docs/
│   └── progress/
│       ├── step-1-summary.md
│       ├── step-2-summary.md
│       └── ...
│
├── public/
│   ├── fonts/
│   └── images/
│
├── .env.local                        ← Supabase keys (jangan di-commit)
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 6. SKEMA DATABASE SUPABASE

Untuk versi ini, Supabase hanya dipakai untuk **autentikasi**. Tidak ada tabel tambahan yang diperlukan karena konten hardcode di frontend.

Supabase Auth secara otomatis membuat tabel `auth.users`. Tidak perlu konfigurasi database tambahan untuk MVP ini.

```sql
-- Tidak ada tabel custom yang diperlukan untuk MVP.
-- Supabase Auth handle semuanya.

-- Jika di masa depan ingin track progress user:
-- CREATE TABLE user_progress (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   user_id UUID REFERENCES auth.users(id),
--   topic_id TEXT NOT NULL,
--   completed_at TIMESTAMP DEFAULT NOW()
-- );
```

---

## 7. DESAIN SISTEM INTERPRETER ENGINE

### Flow Kerja
```
Input: string kode C++
         │
         ▼
┌─────────────────┐
│     PARSER      │
│  (tree-sitter)  │
│                 │
│ "int x = 5;"   │
│       ↓         │
│  AST Node Tree  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    EVALUATOR    │
│  (custom JS)    │
│                 │
│ Walk AST node   │
│ by node, update │
│ environment     │
│ (variable store)│
│ record each step│
└────────┬────────┘
         │
         ▼
Output: ExecutionTrace[]
```

### Evaluator — Node Types yang Harus Dihandle
```
Program → function_definition → compound_statement
  ├── declaration (int x = 5)
  ├── assignment_expression (x = x + 1)
  ├── if_statement
  │     ├── condition (expression)
  │     ├── then_clause (compound_statement)
  │     └── else_clause (optional)
  ├── for_statement
  │     ├── init (declaration/assignment)
  │     ├── condition (expression)
  │     ├── update (expression)
  │     └── body (compound_statement)
  ├── while_statement
  ├── do_statement
  ├── switch_statement
  ├── break_statement
  ├── continue_statement
  └── expression_statement
        └── call_expression (cout)
```

### Infinite Loop Guard
```typescript
const MAX_STEPS = 1000
let stepCount = 0

// Di setiap iterasi loop:
stepCount++
if (stepCount > MAX_STEPS) {
  throw new Error("Infinite loop terdeteksi: program melebihi 1000 langkah")
}
```

---

## 8. PANDUAN TEMA PIXEL ART

### CSS Variables (globals.css)
```css
:root {
  /* Warna Utama */
  --bg-primary: #0a0a0f;
  --bg-secondary: #0f0f1a;
  --bg-panel: #13131f;
  --bg-highlight: #1a1a2e;

  /* Aksen Neon */
  --neon-green: #00ff88;
  --neon-blue: #00d4ff;
  --neon-purple: #b44fff;
  --neon-yellow: #ffdd00;

  /* Teks */
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #475569;
  --text-code: #00ff88;

  /* Border */
  --border-primary: #2d2d4e;
  --border-accent: #00ff88;

  /* Font */
  --font-pixel: "Press Start 2P", monospace;
  --font-mono: "VT323", "Courier New", monospace;
}
```

### Scanline Effect (CSS)
```css
.scanline-overlay::after {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.05) 2px,
    rgba(0, 0, 0, 0.05) 4px
  );
  pointer-events: none;
  z-index: 9999;
}
```

### Pixel Button Pattern
```css
.pixel-btn {
  font-family: var(--font-pixel);
  font-size: 10px;
  padding: 12px 20px;
  background: transparent;
  color: var(--neon-green);
  border: 2px solid var(--neon-green);
  cursor: pointer;
  position: relative;
  text-transform: uppercase;
  letter-spacing: 2px;
  transition: all 0.1s steps(1);  /* Pixel transition */
}

.pixel-btn:hover {
  background: var(--neon-green);
  color: var(--bg-primary);
  box-shadow: 4px 4px 0px var(--neon-green);
  transform: translate(-2px, -2px);
}

.pixel-btn:active {
  transform: translate(0, 0);
  box-shadow: none;
}
```

### CRT Glow Effect untuk Text
```css
.glow-text {
  text-shadow:
    0 0 10px var(--neon-green),
    0 0 20px var(--neon-green),
    0 0 40px var(--neon-green);
}
```

---

## 9. TEMPLATE PROMPT PER STEP

Gunakan template ini setiap kali mulai step baru. Copy, isi bagian [BRACKET], kirim ke AI.

```
=== LGOVIC PROJECT — STEP [NOMOR] ===

ROLE:
Kamu adalah senior fullstack developer yang spesialis membangun aplikasi web edukasi
interaktif dengan Next.js 14+, TypeScript, Tailwind CSS, dan Supabase.
Kamu paham konteks proyek LgoViz — media pembelajaran visualisasi algoritma C++ berbasis web
bergaya pixel art untuk siswa SMK RPL.

CONTEXT:
Proyek: LgoViz (media pembelajaran visualisasi algoritma C++)
Stack: Next.js 14 App Router + TypeScript + Tailwind + Supabase + Monaco Editor
Tema: Pixel art / retro game (seperti Codedex.io)
Status saat ini: [SALIN ISI DARI summary step sebelumnya]

CONSTRAINT:
- Interpreter engine berjalan sepenuhnya client-side
- Konten materi hardcode di /src/data/, bukan di Supabase
- Supabase hanya untuk autentikasi
- Styling: Tailwind CSS + CSS variables saja, tidak pakai UI library
- Monaco Editor pakai next/dynamic (SSR disabled)
- TypeScript strict mode ON
- Setiap komponen interaktif pakai "use client"
- Warna: bg #0a0a0f, aksen #00ff88 dan #00d4ff
- Font pixel: "Press Start 2P"
- Di akhir step, buat file summary di /docs/progress/step-[N]-summary.md

TASK (STEP [NOMOR] — [NAMA STEP]):
[DESKRIPSI LENGKAP TASK DARI BAGIAN CHAINING DI ATAS]

Tolong:
1. Buat semua file yang diperlukan dengan kode lengkap (bukan placeholder)
2. Jelaskan setiap keputusan teknis yang penting
3. Jika ada hal yang tidak bisa diselesaikan, catat sebagai "⚠️ PENDING" beserta alasannya
4. Di akhir, buat isi summary.md untuk step ini
```

---

## 10. TEMPLATE SUMMARY MD PER STEP

Setelah selesai setiap step, buat file `/docs/progress/step-[N]-summary.md` dengan format ini:

```markdown
# Step [N] Summary — [Nama Step]
**Tanggal:** [tanggal]
**Status:** ✅ Selesai / ⚠️ Selesai dengan catatan / ❌ Belum selesai

## File yang Dibuat/Diubah
- `src/...` — [deskripsi singkat]
- `src/...` — [deskripsi singkat]

## Keputusan Teknis
- [Keputusan 1]: [Alasan]
- [Keputusan 2]: [Alasan]

## Masalah yang Ditemukan & Solusi
- **Masalah:** [deskripsi]
  **Solusi:** [deskripsi]

## ⚠️ Deviasi dari Rencana (jika ada)
- [Apa yang berubah dari blueprint]: [Alasan]

## Dependencies yang Ditambahkan
```bash
npm install [package]
```

## Konteks untuk Step Berikutnya
- [Hal penting yang perlu diketahui AI di step berikutnya]
- [State/struktur yang sudah ada dan bisa langsung dipakai]
- [File mana yang paling relevan untuk dilanjutkan]

## Definition of Done — Checklist
- [x] [Kriteria 1]
- [x] [Kriteria 2]
- [ ] [Kriteria yang belum selesai]
```

---

## 🚀 CARA PAKAI BLUEPRINT INI

1. **Baca blueprint ini setiap mulai sesi coding**
2. **Mulai dari Step 1** — copy template prompt di bagian 9
3. **Isi bagian [CONTEXT]** dengan summary step sebelumnya (kosong untuk step 1)
4. **Kerjakan task** sesuai daftar di bagian 4
5. **Buat summary** setelah selesai setiap step
6. **Lanjut ke step berikutnya** dengan summary sebagai konteks

> 💡 **Tips:** Jika satu step terlalu besar, pecah jadi sub-step. Misal Step 4 (interpreter) bisa dipecah jadi Step 4a (parser) dan Step 4b (evaluator).

---

*Dokumen ini dibuat sebagai master blueprint proyek LgoViz.*  
*Update dokumen ini jika ada perubahan signifikan pada arah proyek.*

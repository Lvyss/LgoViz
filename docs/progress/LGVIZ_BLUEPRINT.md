# LgoViz — Project Blueprint v2.0

> **Versi:** 2.0 | **Revisi dari:** v1.0 (April 2026)
> **Perubahan utama:** Desain pivot ke premium minimalis dark, tambah sistem evaluasi quiz, admin panel, progress tracking, dan konten materi disimpan di Supabase (bukan hardcode).
> **Dokumen ini adalah "bible" project. Baca sebelum mulai setiap step.**

---

## DAFTAR ISI

1. [Role](#1-role)
2. [Context](#2-context)
3. [Constraint](#3-constraint)
4. [Chaining — Master Plan](#4-chaining--master-plan)
5. [Struktur Folder Target](#5-struktur-folder-target)
6. [Skema Database Supabase](#6-skema-database-supabase)
7. [Desain Sistem Interpreter Engine](#7-desain-sistem-interpreter-engine)
8. [Sistem Evaluasi & Progress](#8-sistem-evaluasi--progress)
9. [Panduan Desain Premium Minimalis](#9-panduan-desain-premium-minimalis)
10. [Template Prompt Per Step](#10-template-prompt-per-step)
11. [Template Summary MD Per Step](#11-template-summary-md-per-step)

---

## 1. ROLE

```
Kamu adalah senior fullstack developer dan UI/UX engineer yang spesialis dalam:
- Membangun aplikasi web edukasi interaktif dengan Next.js 14+ (App Router) dan TypeScript
- Membuat interpreter engine berbasis JavaScript untuk memvisualisasikan eksekusi kode C++
- Mendesain antarmuka premium minimalis dark dengan Tailwind CSS — elegan, bersih, dan modern
- Mengintegrasikan autentikasi, database, dan role-based access control dengan Supabase

Kamu memahami konteks bahwa ini adalah media pembelajaran untuk siswa SMK jurusan RPL.
Fokus utama bukan hafalan materi, tapi pemahaman abstraksi logika pemrograman melalui
visualisasi langsung. Kamu selalu menulis kode clean, terstruktur, dan mudah dikembangkan.
```

---

## 2. CONTEXT

### 2.1 Deskripsi Produk

**LgoViz** adalah aplikasi web pembelajaran algoritma yang memungkinkan siswa SMK RPL
mengamati eksekusi kode C++ langkah demi langkah beserta perubahan nilai variabel secara
real-time. Filosofi desain: **premium minimalis dark** — bersih, elegan, modern seperti
produk SaaS mahal, bukan pixel art.

**Flow belajar utama:**
```
Pilih Topik
    ↓
Halaman Visualizer
  [Code Editor] + [Step Visualizer] + [Variable Tracker]
  [Tombol ?] → Tooltip/Modal materi dasar pengertian
    ↓
Selesai eksplorasi visualisasi
    ↓
[Mulai Quiz] → 5 soal pilihan ganda tentang topik ini
    ↓
Skor ≥ 70%? → Topik UNLOCKED, lanjut ke topik berikutnya
Skor < 70%? → Bisa retry quiz
```

### 2.2 Target Pengguna

| Role | Akses | Deskripsi |
|------|-------|-----------|
| **Siswa** | `/`, `/auth/*`, `/dashboard`, `/learn/*`, `/quiz/*` | Pengguna utama, belajar dan mengerjakan quiz |
| **Admin** | `/admin/*` | 1 akun via env variable, kelola semua konten dan data |

### 2.3 Halaman Aplikasi

```
PUBLIC
/                        → Landing Page
/auth/login              → Login
/auth/register           → Register

SISWA (protected, role: student)
/dashboard               → Overview progress semua modul
/learn/[moduleId]        → Daftar topik dalam modul
/learn/[moduleId]/[topicId]  → Halaman visualizer + quiz

ADMIN (protected, role: admin)
/admin                   → Dashboard admin (overview statistik)
/admin/questions         → Kelola soal (CRUD)
/admin/questions/new     → Tambah soal baru
/admin/questions/[id]    → Edit soal
/admin/materials         → Kelola materi (teks/kode per topik)
/admin/students          → Daftar siswa + progress mereka
/admin/students/[id]     → Detail progress siswa
```

### 2.4 Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| **Code Editor** | Monaco Editor dengan syntax highlighting C++ |
| **Step Visualizer** | Eksekusi kode C++ langkah demi langkah |
| **Code Highlighter** | Highlight baris aktif yang sedang dieksekusi |
| **Variable Tracker** | Panel real-time perubahan nilai variabel tiap langkah |
| **Animation Control** | Play, pause, next, prev, first, last + speed slider |
| **Tombol ?** | Modal/tooltip materi dasar per topik (pengertian singkat) |
| **Quiz System** | 5 soal pilihan ganda per topik, skor ≥ 70% untuk unlock |
| **Progress Tracking** | Track topik yang sudah selesai dan skor quiz per siswa |
| **Admin Panel** | CRUD soal, edit materi, lihat progress siswa, manage user |
| **Unlock System** | Topik berikutnya unlocked setelah quiz lulus |

### 2.5 Tech Stack

```
Frontend     : Next.js 14 (App Router) + TypeScript
Styling      : Tailwind CSS v4 + Custom CSS Variables (premium dark theme)
Code Editor  : Monaco Editor (@monaco-editor/react)
Parser C++   : tree-sitter / tree-sitter-c (WebAssembly build)
Evaluator    : Custom JavaScript evaluator (dibuat manual)
Animasi      : Framer Motion
Auth & DB    : Supabase (Auth + PostgreSQL + Row Level Security)
Deployment   : Vercel
Font         : Inter (Google Fonts) — clean, modern, bukan pixel
```

### 2.6 Arsitektur Sistem

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│                                                              │
│  SISWA FLOW                                                  │
│  ┌──────────────┐    ┌──────────────────────────────────┐   │
│  │ Monaco Editor│───▶│      Interpreter Engine           │   │
│  │  (kode C++)  │    │  Parser (tree-sitter) → AST       │   │
│  └──────────────┘    │  Evaluator (JS) → Execution Trace │   │
│                      └──────────────┬───────────────────┘   │
│  ┌──────────────┐                   │                        │
│  │  Tombol [?]  │                   ▼                        │
│  │  → Modal     │    ┌──────────────────────────────────┐   │
│  │  materi      │    │  Visualizer UI                    │   │
│  │  dasar       │    │  Code Highlighter + Var Tracker   │   │
│  └──────────────┘    │  Animation Controls               │   │
│                      └──────────────────────────────────┘   │
│                                   ↓                          │
│                      ┌──────────────────────────────────┐   │
│                      │  Quiz System                      │   │
│                      │  5 soal PG dari Supabase          │   │
│                      │  Skor ≥ 70% → unlock next topic   │   │
│                      └──────────────────────────────────┘   │
│                                                              │
│  ADMIN FLOW                                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Admin Panel                                          │   │
│  │  CRUD Questions | Edit Materials | View Progress      │   │
│  │  Manage Students                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                │ All data via Supabase Client/Server
                ▼
┌───────────────────────────────────────────────────────────┐
│                      SUPABASE                             │
│  Auth (login/register/role)                               │
│  PostgreSQL:                                              │
│    - profiles (user data + role)                          │
│    - modules (data modul)                                 │
│    - topics (data topik per modul)                        │
│    - materials (konten materi per topik — editable admin) │
│    - questions (soal quiz per topik — CRUD admin)         │
│    - question_options (pilihan jawaban)                   │
│    - user_progress (progress per topik per user)          │
│    - quiz_attempts (riwayat pengerjaan quiz)              │
└───────────────────────────────────────────────────────────┘
```

### 2.7 Konten Modul

```
Modul 1: Percabangan (5 topik)
  1. if tunggal
  2. if-else
  3. else-if berantai
  4. nested if
  5. switch-case

Modul 2: Perulangan (5 topik)
  1. for loop
  2. while loop
  3. do-while loop
  4. nested loop
  5. break & continue

Modul 3: Struktur Data & Algoritma (5 topik)
  1. Array
  2. Stack
  3. Queue
  4. Linear Search
  5. Bubble Sort
```

---

## 3. CONSTRAINT

### 3.1 Constraint Teknis

```
1. Interpreter engine HARUS berjalan sepenuhnya di sisi client (client-side only).
   Tidak ada server backend untuk eksekusi kode.

2. Gunakan Next.js App Router (bukan Pages Router).

3. Semua komponen UI yang butuh interaktivitas harus diberi directive "use client".

4. Konten materi (teks penjelasan, kode contoh) DISIMPAN di Supabase tabel materials.
   Bukan hardcode. Admin bisa edit via admin panel.

5. Soal quiz DISIMPAN di Supabase tabel questions + question_options.
   Admin bisa CRUD via admin panel.

6. Monaco Editor harus di-load dengan dynamic import (next/dynamic, ssr: false).

7. tree-sitter-c menggunakan WebAssembly — harus diinisialisasi async.

8. Execution Trace format:
   {
     stepIndex: number,
     lineNumber: number,
     variables: Record<string, { value: any, type: string, changed: boolean }>,
     output: string[],
     explanation: string
   }

9. Role-based access:
   - role 'student': akses /dashboard, /learn/*, /quiz/*
   - role 'admin': akses semua + /admin/*
   - Admin diset via Supabase dashboard (update kolom role di tabel profiles)
   - ADMIN_EMAIL disimpan di .env sebagai referensi

10. Row Level Security (RLS) Supabase WAJIB diaktifkan:
    - Siswa hanya bisa read/write data miliknya sendiri
    - Admin bisa read/write semua data
    - Quiz questions hanya bisa dibaca oleh authenticated users
    - Materials bisa dibaca oleh authenticated users, ditulis hanya admin

11. Styling: Tailwind CSS v4 + CSS variables saja. TIDAK pakai UI library (MUI, Chakra, dll).

12. TypeScript strict mode ON.

13. Unlock system: topik ke-N hanya bisa diakses jika topik ke-(N-1) sudah lulus quiz
    (skor ≥ 70%). Topik pertama setiap modul selalu unlocked.
```

### 3.2 Constraint Desain

```
FILOSOFI: Premium minimalis dark. Seperti produk SaaS mahal (Linear, Vercel, Resend).
Bukan pixel art, bukan gamifikasi berlebihan. Fokus ke konten dan fungsi.

1. Background: #060608 (hampir hitam, bukan hitam murni)
   Gunakan subtle radial gradient sebagai "atmospheric glow" di belakang hero/section

2. Surface/panel: rgba(255,255,255,0.04) dengan border rgba(255,255,255,0.08)
   Efek glass minimal, bukan frosted glass penuh

3. Accent: #00e87a (hijau) untuk success/primary action
             #38bdf8 (biru) untuk info/secondary
             #a78bfa (ungu) untuk advanced/highlight
   Penggunaan MINIMAL — hanya untuk elemen yang benar-benar butuh atensi

4. Typography: Inter (weight 300, 400, 500 saja — TIDAK 600 atau 700)
   - Display/heading: 500 weight, letter-spacing -0.3px
   - Body: 400 weight, line-height 1.7
   - Caption/label: 300 weight, letter-spacing 0.5px
   - NO ALL CAPS kecuali label kategori kecil (font-size ≤ 10px)

5. Border radius: 8px untuk komponen kecil, 12px untuk card, TIDAK ada yang bulat penuh
   kecuali badge/chip (border-radius 100px)

6. Animasi: subtle dan smooth. Framer Motion dengan duration 0.2s, ease: [0.4, 0, 0.2, 1]
   Tidak ada animasi yang mencolok atau berlebihan

7. Spacing: generous whitespace. Padding section minimal 80px vertikal.

8. Hover state: very subtle — background naik sedikit opacity, border sedikit lebih terang
   Tidak ada color change drastis saat hover

9. Setiap "full section" di landing page punya min-height yang membuat konten terasa
   "bernapas" — tidak padat, tidak terlalu renggang

10. Tidak ada shadow (box-shadow: none) kecuali untuk focus ring input (outline style)
```

### 3.3 Constraint Proses

```
1. Setiap step chaining WAJIB diakhiri dengan membuat file summary:
   /docs/progress/step-[N]-summary.md

2. Summary berisi: daftar file yang dibuat/diubah, keputusan teknis, masalah
   yang ditemukan + solusinya, dan konteks untuk step berikutnya.

3. Jangan lanjut ke step berikutnya sebelum summary dibuat.

4. Jika ada perubahan dari rencana awal, catat di summary sebagai
   "DEVIATION" beserta alasannya.

5. Test setiap fitur secara manual sebelum pindah step.

6. Seed data: buat file seed SQL di /supabase/seed.sql untuk isi data awal
   (modul, topik, dan minimal 1 soal per topik untuk testing).
```

---

## 4. CHAINING — MASTER PLAN

### Overview

```
STEP 1 → Setup, Auth & Database Schema
STEP 2 → Desain Sistem & Komponen UI
STEP 3 → Landing Page, Auth Pages & Dashboard
STEP 4 → Halaman Learn & Visualizer Shell
STEP 5 → Interpreter Engine (Core)
STEP 6 → Visualizer UI (Highlighter + Variable Tracker + Controls)
STEP 7 → Sistem Quiz & Progress Tracking
STEP 8 → Admin Panel
STEP 9 → Integrasi Final, Polish & Deploy
```

---

### STEP 1 — Setup, Auth & Database Schema
**Durasi estimasi:** 1–2 hari
**Output:** Project berjalan, auth berfungsi, semua tabel database siap

**Yang dikerjakan:**
- Init project Next.js 14 + TypeScript + Tailwind CSS v4
- Install semua dependencies
- Setup Supabase project + environment variables
- Buat semua tabel database dengan SQL (lihat bagian 6)
- Aktifkan Row Level Security untuk semua tabel
- Buat Supabase Auth integration (signIn, signUp, signOut)
- Buat middleware/proxy untuk auth guard + role guard
- Buat seed SQL untuk data awal (modul, topik, soal contoh)
- Halaman login dan register (functional, styling minimal dulu)

**Dependencies:**
```bash
npm install @supabase/supabase-js @supabase/ssr
npm install framer-motion
npm install @monaco-editor/react
npm install web-tree-sitter
```

**File yang dibuat:**
```
src/
  lib/supabase/client.ts
  lib/supabase/server.ts
  types/database.ts          ← Generated types dari Supabase
  types/app.ts               ← Custom app types
  middleware.ts / proxy.ts   ← Auth + role guard
  app/auth/login/page.tsx
  app/auth/register/page.tsx
supabase/
  schema.sql                 ← DDL semua tabel
  seed.sql                   ← Data awal
  rls.sql                    ← Row Level Security policies
.env.local
.env.example
```

**Kriteria selesai:**
- [ ] `npm run dev` berjalan tanpa error
- [ ] Register, login, logout berfungsi
- [ ] Redirect ke /dashboard setelah login
- [ ] Akses /dashboard tanpa login → redirect ke /auth/login
- [ ] Akses /admin/* sebagai student → redirect ke /dashboard
- [ ] Semua tabel terbuat di Supabase dashboard
- [ ] RLS aktif di semua tabel
- [ ] Seed data berhasil dijalankan

---

### STEP 2 — Desain Sistem & Komponen UI
**Durasi estimasi:** 1–2 hari
**Output:** Design system lengkap, semua komponen reusable siap pakai

**Yang dikerjakan:**
- Setup CSS variables lengkap di globals.css (premium dark theme)
- Setup Tailwind config dengan custom tokens
- Buat komponen UI library:
  - `Button` (primary, secondary, ghost, danger — ukuran sm/md/lg)
  - `Card` (default, hover, bordered)
  - `Badge` / `Chip` (success, info, warning, muted)
  - `Input`, `Textarea`, `Select`
  - `Modal` / `Dialog`
  - `Tooltip` (untuk tombol ?)
  - `ProgressBar`
  - `Skeleton` (loading state)
  - `Avatar`
  - `Navbar` + `Sidebar`
  - `PageTransition` wrapper

**File yang dibuat:**
```
src/
  components/ui/
    Button.tsx
    Card.tsx
    Badge.tsx
    Input.tsx
    Modal.tsx
    Tooltip.tsx
    ProgressBar.tsx
    Skeleton.tsx
    Avatar.tsx
  components/layout/
    Navbar.tsx
    Sidebar.tsx (untuk admin)
    PageTransition.tsx
  styles/globals.css          ← Design tokens lengkap
  lib/utils.ts                ← cn() helper dan utility functions
```

**Kriteria selesai:**
- [ ] Semua komponen render tanpa error
- [ ] Dark theme konsisten di semua komponen
- [ ] Hover dan focus state sudah ada di semua interactive element
- [ ] Komponen sudah bisa dipakai di halaman berikutnya

---

### STEP 3 — Landing Page, Auth Pages & Dashboard
**Durasi estimasi:** 1–2 hari
**Output:** Semua halaman publik dan dashboard siswa tampil dengan desain final

**Yang dikerjakan:**

**Landing Page (/):**
- Navbar minimal (Logo + Login + CTA)
- Hero section: judul besar, subtitle, 2 CTA button, atmospheric glow background
- Feature section: 6 fitur dalam grid card
- Modul section: 3 modul card
- Footer minimal

**Auth Pages:**
- Login: card centered, form clean, link ke register
- Register: card centered, form (nama, email, password), link ke login

**Dashboard (/dashboard):**
- Greeting + tanggal
- 3 stat cards (topik selesai, streak, total skor)
- Grid 3 modul dengan progress bar per modul
- Quick action button ke topik terakhir yang dikerjakan

**File yang dibuat:**
```
src/
  app/page.tsx
  app/auth/login/page.tsx     ← Update dengan desain final
  app/auth/register/page.tsx  ← Update dengan desain final
  app/dashboard/page.tsx
  components/sections/
    HeroSection.tsx
    FeatureSection.tsx
    ModuleSection.tsx
  components/dashboard/
    StatCard.tsx
    ModuleProgressCard.tsx
```

**Kriteria selesai:**
- [ ] Landing page terlihat premium dan minimalis
- [ ] Auth pages clean dan user-friendly
- [ ] Dashboard menampilkan data real dari Supabase (progress user)
- [ ] Responsive di desktop dan tablet (768px+)
- [ ] Semua transisi halaman smooth

---

### STEP 4 — Halaman Learn & Visualizer Shell
**Durasi estimasi:** 1–2 hari
**Output:** Halaman learn dengan layout split siap, Monaco Editor terpasang, unlock system berfungsi

**Yang dikerjakan:**
- Halaman `/learn/[moduleId]`: daftar topik dengan status (locked/unlocked/completed)
- Halaman `/learn/[moduleId]/[topicId]`: layout split
  - Kiri: Monaco Editor (60% width)
  - Kanan: Visualizer panel (placeholder) + Variable Tracker (placeholder)
  - Bawah editor: Tombol [Run] + [?] (info materi) + [Quiz] (setelah visualize)
  - Tombol [?] membuka Modal dengan materi dasar dari Supabase
- Fetch konten: starter code dan materi dari Supabase (tabel topics + materials)
- Unlock system: cek progress user sebelum render topik
- Navigasi antar topik (prev/next)
- Loading skeleton saat fetch data

**File yang dibuat:**
```
src/
  app/learn/
    [moduleId]/
      page.tsx               ← Daftar topik + status
      [topicId]/
        page.tsx             ← Shell visualizer
  components/learn/
    TopicList.tsx            ← Daftar topik dengan lock indicator
    TopicCard.tsx
    VisualizerShell.tsx      ← Layout wrapper
    MaterialModal.tsx        ← Modal tombol ?
  hooks/
    useTopicProgress.ts      ← Hook untuk cek unlock status
```

**Kriteria selesai:**
- [ ] Daftar topik menampilkan status locked/unlocked/completed
- [ ] Topik pertama setiap modul selalu unlocked
- [ ] Topik terkunci tidak bisa diakses (redirect ke topik sebelumnya)
- [ ] Monaco Editor muncul dengan starter code dari Supabase
- [ ] Tombol [?] membuka modal dengan materi dasar
- [ ] Navigasi prev/next topik berfungsi

---

### STEP 5 — Interpreter Engine (Core)
**Durasi estimasi:** 3–5 hari (step terberat)
**Output:** Kode C++ bisa dieksekusi dan menghasilkan execution trace yang akurat

**Yang dikerjakan:**
- Setup dan inisialisasi tree-sitter-c (WebAssembly)
- Build parser: kode C++ string → AST
- Build evaluator JavaScript: AST → Execution Trace[]
- Support:
  - Tipe data: int, float, double, char, bool, string
  - Operator: aritmatika, perbandingan, logika
  - Percabangan: if, if-else, else-if, nested if, switch-case
  - Perulangan: for, while, do-while, nested loop, break, continue
  - Array satu dimensi
  - Stack dan Queue (simulasi manual)
  - cout output
- Error handling: syntax error, runtime error, infinite loop guard (max 1000 steps)
- Unit tests untuk semua node types

**File yang dibuat:**
```
src/lib/interpreter/
  index.ts
  parser.ts
  evaluator.ts
  builtins.ts
  types.ts
  utils.ts
src/__tests__/interpreter/
  evaluator.test.ts
```

**Format Execution Trace:**
```typescript
interface ExecutionStep {
  stepIndex: number
  lineNumber: number
  variables: {
    name: string
    value: any
    type: string
    changed: boolean
    scope: string
  }[]
  output: string[]
  explanation: string
  scopeDepth: number
}

interface ExecutionTrace {
  steps: ExecutionStep[]
  totalSteps: number
  hasError: boolean
  errorMessage?: string
}
```

**Kriteria selesai:**
- [ ] `int x = 5; if(x > 3){ cout << "yes"; }` → trace benar
- [ ] For loop sederhana → trace per iterasi
- [ ] Nested loop → trace benar untuk setiap level
- [ ] Infinite loop → error setelah 1000 steps
- [ ] Syntax error → pesan error yang jelas
- [ ] Semua unit test pass

---

### STEP 6 — Visualizer UI
**Durasi estimasi:** 2–3 hari
**Output:** Visualizer lengkap terhubung dengan interpreter engine

**Yang dikerjakan:**
- `CodeHighlighter`: Monaco Editor dengan highlight baris aktif (decoration API)
- `VariableTracker`: Panel variabel dengan animasi flash saat nilai berubah
- `OutputConsole`: Panel output cout
- `ExplanationPanel`: Penjelasan langkah dalam bahasa Indonesia
- `StepIndicator`: "Step 3 / 24"
- `AnimationControls`:
  - Tombol: ⏮ first | ◀ prev | ▶/⏸ play/pause | ▶ next | ⏭ last
  - Speed slider: 0.5x, 1x, 2x, 3x
  - Keyboard shortcuts: ArrowLeft, ArrowRight, Space
- `useInterpreter` hook: state management lengkap
- Auto-play mode dengan interval

**File yang dibuat:**
```
src/components/visualizer/
  CodeHighlighter.tsx
  VariableTracker.tsx
  OutputConsole.tsx
  ExplanationPanel.tsx
  StepIndicator.tsx
  AnimationControls.tsx
  VisualizerPanel.tsx       ← Wrapper semua komponen visualizer
src/hooks/
  useInterpreter.ts
  useKeyboardShortcuts.ts
```

**Kriteria selesai:**
- [ ] Run → highlight baris pertama langsung
- [ ] Variable Tracker menampilkan semua variabel
- [ ] Variabel yang berubah muncul dengan subtle flash animation
- [ ] Auto-play berjalan dan berhenti di step terakhir
- [ ] Speed slider berfungsi
- [ ] Keyboard shortcuts: Arrow keys dan Space
- [ ] Output console menampilkan cout bertahap

---

### STEP 7 — Sistem Quiz & Progress Tracking
**Durasi estimasi:** 2 hari
**Output:** Quiz berfungsi, progress tersimpan, unlock system aktif

**Yang dikerjakan:**
- Halaman Quiz: fetch soal dari Supabase (tabel questions + question_options)
- Tampilkan 5 soal pilihan ganda satu per satu
- Hitung skor setelah selesai
- Simpan hasil ke tabel quiz_attempts
- Jika skor ≥ 70%: update user_progress topik jadi 'completed', unlock topik berikutnya
- Jika skor < 70%: tampilkan retry button
- Update dashboard: progress bar per modul dihitung dari user_progress
- Hasil quiz: tampilkan skor, jawaban benar/salah, dan tombol lanjut/retry

**File yang dibuat:**
```
src/
  app/learn/[moduleId]/[topicId]/quiz/page.tsx
  components/quiz/
    QuizQuestion.tsx
    QuizProgress.tsx
    QuizResult.tsx
  hooks/
    useQuiz.ts
    useProgress.ts
  lib/
    progress.ts             ← Helper functions untuk progress
```

**Kriteria selesai:**
- [ ] Quiz memuat soal dari Supabase
- [ ] 5 soal tampil satu per satu dengan pilihan A/B/C/D
- [ ] Skor dihitung benar setelah semua soal dijawab
- [ ] Skor ≥ 70% → topik completed, unlock topik berikutnya
- [ ] Skor < 70% → retry tersedia
- [ ] Progress bar di dashboard terupdate setelah quiz selesai
- [ ] Riwayat quiz_attempts tersimpan di Supabase

---

### STEP 8 — Admin Panel
**Durasi estimasi:** 2–3 hari
**Output:** Admin bisa kelola semua konten via web interface

**Yang dikerjakan:**

**Layout Admin:**
- Sidebar navigasi admin (berbeda dari sidebar siswa)
- Header dengan info akun admin

**Halaman Admin:**

`/admin` — Dashboard Overview:
- Total siswa terdaftar
- Total quiz attempts hari ini
- Topik yang paling sering diulang (retry tinggi)
- Grafik sederhana progress siswa

`/admin/questions` — Kelola Soal:
- Tabel semua soal dengan filter per modul/topik
- Tombol tambah, edit, hapus per soal
- Status aktif/nonaktif soal

`/admin/questions/new` dan `/admin/questions/[id]`:
- Form soal: teks pertanyaan, 4 pilihan (A/B/C/D), pilih jawaban benar
- Assign ke topik mana
- Preview tampilan soal

`/admin/materials` — Kelola Materi:
- List semua topik
- Edit teks materi dasar per topik (textarea atau rich text sederhana)
- Edit starter code C++ per topik
- Edit solution code C++ per topik

`/admin/students` — Data Siswa:
- Tabel semua siswa (nama, email, tanggal daftar, total topik selesai)
- Filter dan search
- Klik siswa → detail progress per topik

`/admin/students/[id]`:
- Info profil siswa
- Progress detail: tabel semua topik + status + skor quiz terakhir
- Riwayat quiz attempts

**File yang dibuat:**
```
src/
  app/admin/
    page.tsx
    questions/page.tsx
    questions/new/page.tsx
    questions/[id]/page.tsx
    materials/page.tsx
    students/page.tsx
    students/[id]/page.tsx
    layout.tsx              ← Layout khusus admin dengan sidebar
  components/admin/
    AdminSidebar.tsx
    QuestionForm.tsx
    MaterialEditor.tsx
    StudentTable.tsx
    StatsCard.tsx
    SimpleChart.tsx
```

**Kriteria selesai:**
- [ ] Akses /admin/* sebagai student → redirect ke /dashboard
- [ ] Admin bisa tambah soal baru dengan 4 pilihan dan jawaban benar
- [ ] Admin bisa edit dan hapus soal
- [ ] Admin bisa edit materi per topik dan langsung tersimpan ke Supabase
- [ ] Admin bisa lihat daftar semua siswa
- [ ] Admin bisa lihat detail progress satu siswa
- [ ] Dashboard admin menampilkan statistik yang akurat

---

### STEP 9 — Integrasi Final, Polish & Deploy
**Durasi estimasi:** 1–2 hari
**Output:** LgoViz live di Vercel, siap presentasi

**Yang dikerjakan:**
- End-to-end testing semua user flow (student + admin)
- Bug fixing
- Loading state dan error state di semua halaman
- Empty state yang informative (belum ada data)
- Optimasi: dynamic import, lazy loading, image optimization
- SEO metadata di semua halaman
- README.md lengkap
- Deploy ke Vercel + set environment variables
- Test di production (Chrome + Firefox)

**File yang dibuat/diupdate:**
```
README.md
.env.example
docs/progress/          ← Semua summary step
```

**Kriteria selesai:**
- [ ] Semua user flow berjalan end-to-end tanpa error
- [ ] Loading state ada di semua halaman yang fetch data
- [ ] Error state yang informatif (bukan blank page)
- [ ] App live di Vercel
- [ ] README menjelaskan cara setup dan run project
- [ ] Tidak ada console error di production

---

## 5. STRUKTUR FOLDER TARGET

```
lgovic/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                        ← Landing page
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── learn/
│   │   │   └── [moduleId]/
│   │   │       ├── page.tsx                ← Daftar topik
│   │   │       └── [topicId]/
│   │   │           ├── page.tsx            ← Visualizer
│   │   │           └── quiz/page.tsx       ← Quiz
│   │   └── admin/
│   │       ├── layout.tsx                  ← Admin layout
│   │       ├── page.tsx                    ← Admin dashboard
│   │       ├── questions/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── materials/page.tsx
│   │       └── students/
│   │           ├── page.tsx
│   │           └── [id]/page.tsx
│   │
│   ├── components/
│   │   ├── ui/                             ← Design system
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── Avatar.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── PageTransition.tsx
│   │   ├── sections/                       ← Landing page
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeatureSection.tsx
│   │   │   └── ModuleSection.tsx
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx
│   │   │   └── ModuleProgressCard.tsx
│   │   ├── learn/
│   │   │   ├── TopicList.tsx
│   │   │   ├── TopicCard.tsx
│   │   │   ├── VisualizerShell.tsx
│   │   │   └── MaterialModal.tsx
│   │   ├── visualizer/
│   │   │   ├── VisualizerPanel.tsx
│   │   │   ├── CodeHighlighter.tsx
│   │   │   ├── VariableTracker.tsx
│   │   │   ├── OutputConsole.tsx
│   │   │   ├── ExplanationPanel.tsx
│   │   │   ├── StepIndicator.tsx
│   │   │   └── AnimationControls.tsx
│   │   ├── quiz/
│   │   │   ├── QuizQuestion.tsx
│   │   │   ├── QuizProgress.tsx
│   │   │   └── QuizResult.tsx
│   │   └── admin/
│   │       ├── AdminSidebar.tsx
│   │       ├── QuestionForm.tsx
│   │       ├── MaterialEditor.tsx
│   │       ├── StudentTable.tsx
│   │       └── StatsCard.tsx
│   │
│   ├── hooks/
│   │   ├── useInterpreter.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useQuiz.ts
│   │   ├── useProgress.ts
│   │   └── useTopicProgress.ts
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── interpreter/
│   │   │   ├── index.ts
│   │   │   ├── parser.ts
│   │   │   ├── evaluator.ts
│   │   │   ├── builtins.ts
│   │   │   ├── types.ts
│   │   │   └── utils.ts
│   │   ├── progress.ts
│   │   └── utils.ts
│   │
│   ├── types/
│   │   ├── database.ts                     ← Supabase generated types
│   │   └── app.ts                          ← Custom types
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   └── middleware.ts
│
├── supabase/
│   ├── schema.sql                          ← DDL semua tabel
│   ├── seed.sql                            ← Data awal
│   └── rls.sql                             ← RLS policies
│
├── docs/
│   └── progress/
│       ├── step-1-summary.md
│       └── ...
│
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 6. SKEMA DATABASE SUPABASE

```sql
-- =============================================
-- TABEL UTAMA
-- =============================================

-- Profiles (extend auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modules
CREATE TABLE modules (
  id TEXT PRIMARY KEY,              -- 'percabangan', 'perulangan', 'struktur-data'
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topics
CREATE TABLE topics (
  id TEXT PRIMARY KEY,              -- 'if', 'if-else', 'for', dll
  module_id TEXT REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  starter_code TEXT,                -- Kode C++ default di editor
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials (konten materi dasar per topik, editable admin)
CREATE TABLE materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id TEXT REFERENCES topics(id) ON DELETE CASCADE UNIQUE,
  content TEXT NOT NULL,            -- HTML atau teks penjelasan dasar
  solution_code TEXT,               -- Kode contoh solusi
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Questions (soal quiz)
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id TEXT REFERENCES topics(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Question Options (pilihan jawaban)
CREATE TABLE question_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  option_label TEXT NOT NULL CHECK (option_label IN ('A', 'B', 'C', 'D')),
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false
);

-- =============================================
-- TABEL PROGRESS & TRACKING
-- =============================================

-- User Progress (per topik per user)
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id TEXT REFERENCES topics(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'locked'
    CHECK (status IN ('locked', 'unlocked', 'completed')),
  best_score INTEGER DEFAULT 0,       -- skor terbaik 0-100
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- Quiz Attempts (riwayat pengerjaan quiz)
CREATE TABLE quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id TEXT REFERENCES topics(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,             -- skor 0-100
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,            -- score >= 70
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TRIGGER: Auto-create profile setelah register
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- TRIGGER: Auto-unlock topik pertama tiap modul
-- saat user baru terdaftar
-- (dihandle di aplikasi saat pertama akses dashboard)
-- =============================================
```

### RLS Policies (rls.sql)

```sql
-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Topics & Modules: semua authenticated user bisa read
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read modules"
  ON modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read topics"
  ON topics FOR SELECT TO authenticated USING (true);

-- Materials: authenticated bisa read, hanya admin yang write
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read materials"
  ON materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can write materials"
  ON materials FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Questions: authenticated bisa read (active only), admin bisa semua
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read active questions"
  ON questions FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admin can manage questions"
  ON questions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Question Options: sama seperti questions
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read question options"
  ON question_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage question options"
  ON question_options FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- User Progress: user hanya bisa lihat/edit miliknya sendiri
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own progress"
  ON user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all progress"
  ON user_progress FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Quiz Attempts: user hanya bisa lihat miliknya
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own attempts"
  ON quiz_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all attempts"
  ON quiz_attempts FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

---

## 7. DESAIN SISTEM INTERPRETER ENGINE

### Flow Kerja
```
Input: string kode C++
    ↓
PARSER (tree-sitter-c)
    kode C++ → AST (Abstract Syntax Tree)
    ↓
EVALUATOR (custom JavaScript)
    Walk AST node by node
    Update environment (variable store)
    Record setiap perubahan state ke execution trace
    ↓
Output: ExecutionTrace[]
```

### Infinite Loop Guard
```typescript
const MAX_STEPS = 1000
// Di setiap iterasi: stepCount++; if (stepCount > MAX_STEPS) throw Error
```

### Node Types yang Dihandle
```
declaration, assignment, if_statement, for_statement,
while_statement, do_statement, switch_statement,
break_statement, continue_statement, call_expression (cout),
array_declarator, subscript_expression
```

---

## 8. SISTEM EVALUASI & PROGRESS

### Flow Lengkap
```
User buka topik
    ↓
Cek user_progress untuk topik ini
    - status 'locked' → redirect ke topik sebelumnya
    - status 'unlocked' atau 'completed' → lanjut
    ↓
Halaman visualizer
    - Load starter code dari Supabase (topics.starter_code)
    - Tombol [?] → load materials dari Supabase (materials.content)
    ↓
User klik [Mulai Quiz]
    ↓
Halaman quiz
    - Load 5 soal aktif untuk topik ini (random dari questions)
    - Tampilkan satu per satu
    ↓
Selesai → hitung skor
    ↓
Simpan ke quiz_attempts
    ↓
Jika skor ≥ 70:
    - Update user_progress topik ini → 'completed', best_score
    - Update user_progress topik berikutnya → 'unlocked'
    - Tampilkan hasil + tombol [Topik Berikutnya]
Jika skor < 70:
    - Simpan attempt (passed: false)
    - Tampilkan hasil + breakdown jawaban + tombol [Coba Lagi]
```

### Unlock Logic
```typescript
// Topik pertama setiap modul: selalu 'unlocked' saat user baru daftar
// (di-seed saat pertama kali user akses dashboard)

// Setelah quiz passed:
async function unlockNextTopic(userId: string, currentTopicId: string) {
  const nextTopic = getNextTopicInModule(currentTopicId)
  if (nextTopic) {
    await supabase.from('user_progress').upsert({
      user_id: userId,
      topic_id: nextTopic.id,
      status: 'unlocked'
    })
  }
}
```

### Scoring
```
Skor = (correct_answers / total_questions) × 100
Pass threshold: 70
Contoh: 4/5 benar → skor 80 → PASSED
        3/5 benar → skor 60 → FAILED, bisa retry
```

---

## 9. PANDUAN DESAIN PREMIUM MINIMALIS

### CSS Variables (globals.css)
```css
:root {
  /* Backgrounds */
  --bg: #060608;
  --bg-2: #0b0b10;
  --bg-3: #10101a;
  --surface: rgba(255,255,255,0.04);
  --surface-2: rgba(255,255,255,0.07);
  --surface-3: rgba(255,255,255,0.10);

  /* Borders */
  --border: rgba(255,255,255,0.08);
  --border-2: rgba(255,255,255,0.14);
  --border-3: rgba(255,255,255,0.22);

  /* Accents */
  --green: #00e87a;
  --green-dim: rgba(0,232,122,0.12);
  --green-border: rgba(0,232,122,0.25);
  --blue: #38bdf8;
  --blue-dim: rgba(56,189,248,0.12);
  --purple: #a78bfa;
  --purple-dim: rgba(167,139,250,0.12);

  /* Text */
  --text: #f1f5f9;
  --text-2: #94a3b8;
  --text-3: #475569;
  --text-4: #2d3748;

  /* Font */
  --font: 'Inter', sans-serif;
}
```

### Atmospheric Glow (untuk hero dan section)
```css
/* Tambahkan sebagai pseudo element atau div absolute */
.hero-glow {
  position: absolute;
  top: -150px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 400px;
  background: radial-gradient(
    ellipse,
    rgba(0,232,122,0.07) 0%,
    transparent 70%
  );
  pointer-events: none;
  filter: blur(40px);
}
```

### Button Patterns
```css
/* Primary */
.btn-primary {
  background: var(--green);
  color: #060608;
  border: none;
  border-radius: 7px;
  font-weight: 500;
  font-size: 13px;
  padding: 10px 22px;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-primary:hover { opacity: 0.88; }

/* Ghost */
.btn-ghost {
  background: transparent;
  color: var(--text-2);
  border: 1px solid var(--border-2);
  border-radius: 7px;
  font-size: 13px;
  padding: 10px 22px;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-ghost:hover {
  color: var(--text);
  border-color: var(--border-3);
  background: var(--surface);
}
```

### Card Pattern
```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s ease;
}
.card:hover {
  background: var(--surface-2);
  border-color: var(--border-2);
  transform: translateY(-1px);
}
```

### Typography Scale
```css
h1 { font-size: 42px; font-weight: 500; letter-spacing: -0.5px; }
h2 { font-size: 28px; font-weight: 500; letter-spacing: -0.3px; }
h3 { font-size: 18px; font-weight: 500; letter-spacing: -0.2px; }
p  { font-size: 15px; font-weight: 400; line-height: 1.7; color: var(--text-2); }
```

---

## 10. TEMPLATE PROMPT PER STEP

Gunakan template ini setiap kali mulai step baru:

```
=== LGOVIC PROJECT — STEP [NOMOR]: [NAMA STEP] ===

ROLE:
Kamu adalah senior fullstack developer yang spesialis membangun aplikasi web edukasi
interaktif dengan Next.js 14+, TypeScript, Tailwind CSS v4, dan Supabase.
Proyek: LgoViz — media pembelajaran visualisasi algoritma C++ untuk siswa SMK RPL.
Desain: premium minimalis dark (seperti Linear / Vercel / Resend) — bukan pixel art.

CONTEXT:
[SALIN ISI DARI summary step sebelumnya — file step-N-summary.md]

CONSTRAINT:
- Interpreter engine berjalan sepenuhnya client-side
- Konten materi dan soal quiz disimpan di Supabase (bukan hardcode)
- Supabase dipakai untuk: auth, semua data konten, progress, dan quiz
- Role: 'student' dan 'admin' (cek dari tabel profiles)
- RLS aktif di semua tabel Supabase
- Styling: Tailwind CSS v4 + CSS variables saja, tidak pakai UI library
- Monaco Editor pakai next/dynamic (SSR disabled)
- TypeScript strict mode ON
- Desain: Inter font, background #060608, accent #00e87a
- Di akhir step, buat file /docs/progress/step-[N]-summary.md

TASK (STEP [NOMOR] — [NAMA STEP]):
[DESKRIPSI LENGKAP TASK DARI BAGIAN 4 DI ATAS]

Tolong:
1. Buat semua file yang diperlukan dengan kode lengkap (bukan placeholder/snippet)
2. Jelaskan setiap keputusan teknis yang penting
3. Jika ada hal yang tidak bisa diselesaikan, catat sebagai "PENDING" beserta alasannya
4. Di akhir, buat isi summary.md untuk step ini
```

---

## 11. TEMPLATE SUMMARY MD PER STEP

```markdown
# Step [N] Summary — [Nama Step]
**Tanggal:** [tanggal]
**Status:** Selesai / Selesai dengan catatan / Belum selesai

## File yang Dibuat/Diubah
- `src/...` — [deskripsi singkat]

## Keputusan Teknis
- [Keputusan]: [Alasan]

## Masalah yang Ditemukan & Solusi
- **Masalah:** [deskripsi]
  **Solusi:** [deskripsi]

## DEVIATION (jika ada)
- [Perubahan dari blueprint]: [Alasan]

## Dependencies Baru
npm install [package]

## Konteks untuk Step Berikutnya
- [Yang sudah siap dan bisa langsung dipakai]
- [File paling relevan untuk dilanjutkan]
- [Hal yang perlu diperhatikan]

## Definition of Done — Checklist
- [x] [Kriteria selesai]
- [ ] [Kriteria belum selesai]
```

---

## CARA PAKAI BLUEPRINT INI

1. Baca blueprint ini sebelum mulai setiap sesi coding
2. Mulai dari Step 1 (atau step yang belum selesai)
3. Copy template prompt di bagian 10
4. Isi bagian CONTEXT dengan summary step sebelumnya
5. Kerjakan semua kriteria di Definition of Done
6. Buat summary setelah selesai
7. Lanjut ke step berikutnya

> Catatan: Step 1-3 yang sudah selesai di v1 perlu di-rework karena ada perubahan
> desain (dari pixel art ke premium minimalis) dan perubahan arsitektur
> (konten sekarang di Supabase, bukan hardcode). Estimasi rework Step 1-3: 1-2 hari.

---

*Blueprint LgoViz v2.0 — Revisi April 2026*
*Perubahan dari v1.0: desain pivot, sistem evaluasi quiz, admin panel, unlock system, semua konten ke Supabase*
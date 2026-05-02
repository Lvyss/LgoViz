## Ringkasan Fungsi & CRUD — Admin (src/app/admin)

Dokumen ini merangkum semua fungsi, query, dan operasi CRUD yang dipakai di folder `src/app/admin`.
Berfokus pada: Topik, Materi, Soal/Options, Quiz Attempts, User Progress, dan Data Siswa.

---

## 1. Gambaran umum tabel (yang dipakai di admin)
- `modules`: id, title, description, order_index
- `topics`: id, module_id, title, description, order_index, starter_code
- `materials`: id, topic_id, content (HTML), solution_code, updated_at, updated_by
- `questions`: id, topic_id, question_text, is_active, order_index, created_by, created_at
- `question_options`: id, question_id, option_label (A/B/C/D), option_text, is_correct
- `profiles`: id (user id), full_name, email, role, created_at
- `user_progress`: id, user_id, topic_id, status ('locked'|'unlocked'|'completed'), best_score, completed_at
- `quiz_attempts`: id, user_id, topic_id, score, total_questions, correct_answers, passed (bool), attempted_at

---

## 2. Supabase client
- File: [src/lib/supabase/client.ts](src/lib/supabase/client.ts)
- Fungsi: `createClient()` — membuat Supabase client browser dengan cookie handlers. Semua file admin memanggil `createClient()` untuk melakukan query.

---

## 3. Helper / Query functions (src/lib/supabase/queries.ts)
Daftar fungsi penting yang tersedia dan kegunaannya:
- `getAllModules()` → read semua modul (SELECT * FROM modules ORDER BY order_index)
- `getTopicsByModule(moduleId)` → read topics untuk module tertentu (SELECT * FROM topics WHERE module_id)
- `getTopicById(topicId)` → read single topic by id
- `getMaterialByTopic(topicId)` → read material untuk sebuah topic (maybeSingle)
- `getQuestionsByTopic(topicId)` → read semua question aktif beserta opsi-nya
- `getUserProgress(userId)` → read seluruh progress user
- `getUserProgressForTopic(userId, topicId)` → read progress single (maybeSingle)
- `updateUserProgress(userId, topicId, status, bestScore?)` → upsert progress (upsert on user_id,topic_id)
- `unlockNextTopic(userId, currentTopicId, moduleId)` → logika buka topik berikutnya di module
- `initializeUserProgress(userId)` → inisialisasi progress user (unlock first per module)
- `saveQuizAttempt(userId, topicId, score, totalQuestions, correctAnswers, passed)` → insert quiz_attempts
- `getQuizAttempts(userId, topicId)` → read attempts

Catatan: fungsi-fungsi ini sudah meng-handle error dengan console.error dan mengembalikan nilai default bila gagal.

---

## 4. Halaman Admin & operasi CRUD yang tersedia

Catatan: semua operasi langsung menggunakan Supabase JS client melalui `createClient()` kecuali kalau menggunakan helper di `queries.ts`.

- Dashboard (`src/app/admin/page.tsx`)
  - Read-only: menghitung statistik dari tabel `profiles` (role=student), `user_progress` (status=completed), `quiz_attempts` (count dan average score).
  - Query yang dipakai: `profiles.select(..., { count: 'exact', head: true })`, `user_progress.select(..., { count: 'exact', head: true }).eq('status','completed')`, `quiz_attempts.select('score')`.

- Layout (`src/app/admin/layout.tsx`)
  - Read: `supabase.auth.getUser()` untuk cek login; `supabase.auth.signOut()` untuk logout.

- Topik (`src/app/admin/topics/page.tsx`)
  - Read: `modules.select('id,title')`, `topics.select('*, modules(title)')` dengan ordering.
  - Create: `topics.insert({ id, title, description, module_id, order_index, starter_code })` (id slug dibuat dari judul bila tidak diset).
  - Update: `topics.update({...}).eq('id', id)`.
  - Delete: `topics.delete().eq('id', id)` (dengan konfirmasi pada UI).
  - Fields/form: `id`, `title`*, `description`, `module_id`*, `order_index`, `starter_code`.

- Materi (`src/app/admin/materials/MaterialsContent.tsx` + page)
  - Read: `topics` (list untuk sidebar) + `materials.select('*')` untuk memuat material existing.
  - Update existing material: `materials.update({ content, solution_code, updated_at, updated_by }).eq('id', existingId)`.
  - Create material: `materials.insert({ topic_id, content, solution_code, updated_by })`.
  - Fields: `topic_id`, `content` (HTML string), `solution_code` (string | null), `updated_by` (user id), `updated_at`.
  - UI supports: preview mode (render HTML via dangerouslySetInnerHTML), default content generator `generateDefaultContent(topicTitle)`.

- Soal / Quiz (`src/app/admin/questions/*`)
  - List (`page.tsx`): read `questions` with related `topics(title)`; counts options via `question_options.select(..., { count: 'exact', head: true }).eq('question_id', q.id)`.
  - Create (`new/page.tsx`):
    - Insert question: `questions.insert({ topic_id, question_text, is_active: true, created_by })`.
    - Insert options: `question_options.insert([{ question_id, option_label, option_text, is_correct }, ...])`.
  - Edit (`[id]/page.tsx`):
    - Read question & its `question_options` (`.select('*').eq('question_id', questionId)`).
    - Update question: `questions.update({...}).eq('id', questionId)`.
    - Update options: update existing option rows via `question_options.update({...}).eq('id', opt.id)`; insert new options when missing.
    - Delete question: `questions.delete().eq('id', id)` (used in list page with confirmation).
    - Toggle active: `questions.update({ is_active: !currentStatus }).eq('id', id)`.
  - Fields: question (`topic_id`, `question_text`, `is_active`, `created_by`, `order_index`), option (`option_label`,`option_text`,`is_correct`).

- Siswa (`src/app/admin/students/*`)
  - List (`students/page.tsx`):
    - Read profiles: `profiles.select('*').eq('role','student').order('created_at', { ascending: false })`.
    - For each profile: count completed topics via `user_progress.select(..., { count:'exact', head:true }).eq('user_id', profile.id).eq('status','completed')`.
    - Avg score: `quiz_attempts.select('score').eq('user_id', profile.id)` → compute average client-side.
    - Last active: latest `quiz_attempts.select('attempted_at').eq('user_id', profile.id).order('attempted_at', { ascending: false }).limit(1)`.
  - Detail (`[id]/page.tsx`):
    - Read profile: `profiles.select('*').eq('id', studentId).maybeSingle()`.
    - Read topics + modules info: `topics.select('id,title,module_id,modules(title)')`.
    - Read user progress: `user_progress.select('*').eq('user_id', studentId)` → build per-topic status map.
    - Read quiz attempts: `quiz_attempts.select('*, topics(title)').eq('user_id', studentId')`.
    - Computed values: overallProgress, completedTopics, avgScore, last timestamps.

---

## 5. Field / Payload examples (payloads untuk Insert/Update)

- Create Topic (topics.insert):
  {
    id: 'array-1d',
    title: 'Array 1D',
    description: 'Deskripsi singkat',
    module_id: 'struktur-data',
    order_index: 3,
    starter_code: '...C++ starter code...'
  }

- Upsert User Progress (updateUserProgress helper):
  {
    user_id, topic_id, status: 'completed'|'unlocked'|'locked', best_score?, updated_at
  }

- Save Quiz Attempt (saveQuizAttempt helper):
  {
    user_id, topic_id, score: number, total_questions: number, correct_answers: number, passed: boolean, attempted_at: ISOString
  }

- Insert Question + Options:
  Question: { topic_id, question_text, is_active: true, created_by }
  Options: [{ question_id, option_label: 'A', option_text, is_correct }, ...]

---

## 6. Praktis & catatan implementasi
- Semua page admin menggunakan client-side Supabase (`createBrowserClient`). Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` diset.
- Banyak operasi bergantung pada `supabase.auth.getUser()` untuk `created_by` atau verifikasi peran (`profiles.role`). Pastikan policy row-level security (RLS) pada Supabase mengizinkan admin melakukan operasi ini, atau jalankan lewat server API jika perlu.
- Hati-hati saat delete `topics` / `questions`: UI menampilkan konfirmasi, namun DB-side cascading harus dikonfirmasi (FK / trigger) agar data terkait ikut dihapus jika itu yang diinginkan.
- `materials.content` disimpan sebagai HTML (dangerouslySetInnerHTML digunakan di preview). Validasi / sanitize bila konten dapat disisipkan oleh user tak terpercaya.

---

## 7. Rekomendasi perbaikan / pengamanan singkat
- Pertimbangkan memindahkan beberapa operasi sensitif (delete, upsert bulk) ke API server-side untuk memverifikasi peran dan menghindari ekspos anon-key.
- Tambahkan server-side input validation (mis. panjang teks, tipe score) dan sanitasi HTML sebelum disimpan.
- Gunakan transactional writes atau supabase.rpc untuk multi-step insert (questions + options) agar tidak terjadi partial-insert.

---

File ini dibuat otomatis sebagai ringkasan dari kode di [src/app/admin](src/app/admin) dan helper Supabase di [src/lib/supabase](src/lib/supabase). Jika mau, saya bisa tambahkan contoh curl/HTTP API minimal untuk tiap operasi.

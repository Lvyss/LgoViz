# Step 5 Summary — Evaluator Percabangan (Complete)
**Tanggal:** April 2026
**Status:** ✅ Selesai

---

## File yang Dibuat/Diubah

### Evaluator Percabangan
- `src/lib/interpreter/evaluators/percabangan.ts` — Full rewrite dengan nested if + else if chain + switch case

### UI
- `src/components/learn/InputModal.tsx` — Input modal dengan type-aware parsing untuk semua tipe variabel

---

## Fitur Evaluator Percabangan

### Control Flow — Percabangan
| Feature | Status | Notes |
|---------|--------|-------|
| `if` statement | ✅ | Boolean condition evaluation |
| `if-else` | ✅ | Branch tracking |
| `else if` chain | ✅ | Short-circuit on first TRUE, skip semua setelahnya |
| Nested `if` | ✅ | Stack-based state machine, berapapun levelnya |
| Nested `if` + `else if` | ✅ | Kombinasi nested dan chain bekerja |
| `switch-case` | ✅ | Match by value, fall-through support |
| `default` | ✅ | Dieksekusi jika tidak ada case yang cocok |
| `break` di switch | ✅ | Stop eksekusi, skip case berikutnya |

### I/O
| Feature | Status | Notes |
|---------|--------|-------|
| `cout <<` | ✅ | String literals + variables + endl |
| `cin >>` | ✅ | Async popup, type-aware parsing |

### Tipe Variabel yang Didukung di cin
| Tipe | Status | Parsing |
|------|--------|---------|
| `int` | ✅ | `parseInt` |
| `float` | ✅ | `parseFloat` |
| `double` | ✅ | `parseFloat` |
| `bool` | ✅ | true/false/1/0 |
| `char` | ✅ | charAt(0) |
| `string` | ✅ | raw string |

---

## Arsitektur State Machine

Evaluator percabangan menggunakan **stack-based state machine** dengan 3 state utama:
currentSkipMode     — apakah line sekarang harus diskip
currentPendingElse  — apakah sedang menunggu else/else-if
currentBranchSelected — apakah sudah ada branch yang dieksekusi

### Aturan Stack
- Setiap `{` → push state ke stack
- Setiap `}` → pop state dari stack
- `} else if` → **pop → eval → push** (3 operasi atomic)
- `} else {` → **pop → eval → push** (3 operasi atomic)
- `ifBranchSelected` & `ifPendingElse` disimpan di stack entry untuk dibaca oleh `} else if` berikutnya

### Handler Urutan di While Loop
{                    → pushBlock
}                    → popBlock + reset switch state
} else if (...) {    → handleCloseThenBranch(isElseIf=true)
} else {             → handleCloseThenBranch(isElseIf=false)
switch (...)         → set switchValue, inSwitch=true
case X:              → match switchValue, set skipMode
default:             → execute jika tidak ada match
break                → set switchDone=true, skipMode=true
if (...)             → eval condition, pushBlock, updateStackIfState
else if (...)        → standalone (tanpa })
else                 → standalone (tanpa })
Declaration          → int/float/bool/string/char/double
cin                  → async input dengan type-aware parsing
cout                 → output dengan endl support
Assignment           → variable = value
return               → stop execution

---

## Status Materi

| Materi | Status | Keterangan |
|--------|--------|------------|
| Percabangan | ✅ **Selesai** | if, else if, nested if, switch case semua berjalan |
| Perulangan | 🔒 Coming Soon | for, while, do-while belum diimplementasi di evaluator terpisah |
| Array | 🔒 Coming Soon | Belum diimplementasi |
| Fungsi | 🔒 Coming Soon | Belum diimplementasi |

---

## Keputusan Teknis

| Keputusan | Alasan |
|-----------|--------|
| Stack-based state machine | Satu-satunya pendekatan yang benar untuk nested if berapapun level |
| `ifBranchSelected` & `ifPendingElse` di stack entry | Nilai ini milik level if-else, bukan inner block — harus disimpan terpisah dari `parentBranchSelected` |
| `handleCloseThenBranch()` helper | Logika pop→eval→push yang dipakai oleh `} else if` dan `} else`, mencegah duplikasi |
| `parentSkipMode` dikembalikan sebagai return value | Caller butuh nilai ini untuk push stack entry berikutnya agar chain `} else if` panjang tetap benar |
| Push stack **sebelum** eval di IF handler | IF perlu simpan parent state sebelum eval mengubah current state |
| Type-aware cin parsing | `parseInt` saja tidak cukup untuk float, bool, char, string |

---

## Known Limitations

- Switch case dengan ekspresi kompleks di `case` belum ditest penuh
- Fall-through antar case (tanpa break) sudah support tapi belum ditest edge case
- `cin` untuk tipe `string` dengan spasi belum support (hanya single word)
- Evaluator ini khusus percabangan — loop, array, fungsi ada di evaluator terpisah (coming soon)

---

## Definition of Done — Checklist

- [x] `if` statement menghasilkan trace yang benar
- [x] `if-else` chain short-circuit pada TRUE pertama
- [x] `else if` chain panjang (4+ kondisi) bekerja benar
- [x] Nested `if` berapapun level bekerja benar
- [x] Kombinasi nested `if` + `else if` bekerja benar
- [x] `switch-case` dengan `break` bekerja benar
- [x] `default` dieksekusi jika tidak ada case cocok
- [x] `cin` menerima semua tipe: int, float, double, bool, char, string
- [x] InputModal menampilkan placeholder dan input type sesuai tipe variabel
- [x] Step trace akurat — setiap kondisi tercatat sebagai step tersendiri

---

**Step 5 ✅ SELESAI — Evaluator Percabangan Complete, Materi Lain Coming Soon**


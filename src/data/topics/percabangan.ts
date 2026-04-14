import { Topic } from '@/types/module'

export const percabanganTopics: Topic[] = [
  {
    id: 'if',
    title: 'If Statement',
    description: 'Belajar percabangan dasar dengan if statement',
    explanation: `
      <h3 class="font-pixel text-neon-green text-sm mb-3">📖 Apa itu If Statement?</h3>
      <p class="mb-4">
        <strong class="text-neon-blue">If statement</strong> adalah struktur percabangan paling dasar dalam pemrograman.
        Digunakan untuk mengeksekusi blok kode hanya jika suatu kondisi bernilai <strong class="text-neon-green">true</strong>.
      </p>
      
      <h3 class="font-pixel text-neon-green text-sm mb-3">📝 Sintaks Dasar</h3>
      <pre class="bg-pixel-dark p-3 border border-neon-green/30 mb-4 overflow-x-auto">
        <code class="text-neon-green text-sm">
if (kondisi) {
    // blok kode yang akan dijalankan jika kondisi true
}
        </code>
      </pre>
      
      <h3 class="font-pixel text-neon-green text-sm mb-3">💡 Contoh dalam Kehidupan Sehari-hari</h3>
      <p class="mb-2">
        "Jika hujan, maka saya akan membawa payung."
      </p>
      <ul class="list-disc list-inside text-text-secondary mb-4 space-y-1">
        <li><strong>Kondisi:</strong> hujan == true</li>
        <li><strong>Aksi:</strong> membawa payung</li>
      </ul>
      
      <h3 class="font-pixel text-neon-green text-sm mb-3">🎯 Learning Objectives</h3>
      <ul class="list-disc list-inside text-text-secondary space-y-1">
        <li>Memahami konsep percabangan dalam pemrograman</li>
        <li>Mampu menulis if statement dengan benar</li>
        <li>Memahami operator perbandingan (>, <, ==, !=, >=, <=)</li>
        <li>Memprediksi output dari program yang menggunakan if statement</li>
      </ul>
    `,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int nilai = 80;
    
    // TODO: Buat if statement untuk mengecek apakah nilai >= 75
    // Jika true, tampilkan "Selamat! Anda lulus"
    
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int nilai = 80;
    
    if (nilai >= 75) {
        cout << "Selamat! Anda lulus" << endl;
    }
    
    return 0;
}`,
    learningObjectives: [
      'Memahami konsep percabangan dalam pemrograman',
      'Mampu menulis if statement dengan benar',
      'Memahami operator perbandingan',
      'Memprediksi output program dengan if statement',
    ],
  },
  {
    id: 'if-else',
    title: 'If-Else Statement',
    description: 'Belajar percabangan dengan dua kemungkinan',
    explanation: `
      <h3 class="font-pixel text-neon-green text-sm mb-3">📖 Apa itu If-Else Statement?</h3>
      <p class="mb-4">
        <strong class="text-neon-blue">If-else statement</strong> memberikan dua kemungkinan jalur eksekusi.
        Jika kondisi <strong class="text-neon-green">true</strong>, jalankan blok <strong class="text-neon-green">if</strong>.
        Jika kondisi <strong class="text-neon-green">false</strong>, jalankan blok <strong class="text-neon-green">else</strong>.
      </p>
      
      <h3 class="font-pixel text-neon-green text-sm mb-3">📝 Sintaks Dasar</h3>
      <pre class="bg-pixel-dark p-3 border border-neon-green/30 mb-4 overflow-x-auto">
        <code class="text-neon-green text-sm">
if (kondisi) {
    // dijalankan jika kondisi true
} else {
    // dijalankan jika kondisi false
}
        </code>
      </pre>
      
      <h3 class="font-pixel text-neon-green text-sm mb-3">💡 Contoh dalam Kehidupan Sehari-hari</h3>
      <p class="mb-2">
        "Jika nilai ≥ 75, maka lulus. Jika tidak, maka tidak lulus."
      </p>
      
      <h3 class="font-pixel text-neon-green text-sm mb-3">🎯 Learning Objectives</h3>
      <ul class="list-disc list-inside text-text-secondary space-y-1">
        <li>Memahami konsep percabangan dengan dua jalur</li>
        <li>Mampu menulis if-else statement dengan benar</li>
        <li>Memahami perbedaan if dan if-else</li>
      </ul>
    `,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int nilai;
    
    cout << "Masukkan nilai: ";
    cin >> nilai;
    
    // TODO: Buat if-else statement
    // Jika nilai >= 75, tampilkan "LULUS"
    // Jika tidak, tampilkan "TIDAK LULUS"
    
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int nilai;
    
    cout << "Masukkan nilai: ";
    cin >> nilai;
    
    if (nilai >= 75) {
        cout << "LULUS" << endl;
    } else {
        cout << "TIDAK LULUS" << endl;
    }
    
    return 0;
}`,
    learningObjectives: [
      'Memahami konsep percabangan dengan dua jalur',
      'Mampu menulis if-else statement dengan benar',
      'Memahami perbedaan if dan if-else',
    ],
  },
  {
    id: 'else-if',
    title: 'Else-If Chain',
    description: 'Belajar percabangan dengan banyak kondisi',
    explanation: `
      <h3 class="font-pixel text-neon-green text-sm mb-3">📖 Apa itu Else-If Chain?</h3>
      <p class="mb-4">
        <strong class="text-neon-blue">Else-if chain</strong> digunakan ketika ada lebih dari dua kemungkinan kondisi.
        Program akan mengecek kondisi dari atas ke bawah, dan menjalankan blok pertama yang kondisinya <strong class="text-neon-green">true</strong>.
      </p>
      
      <h3 class="font-pixel text-neon-green text-sm mb-3">📝 Sintaks Dasar</h3>
      <pre class="bg-pixel-dark p-3 border border-neon-green/30 mb-4 overflow-x-auto">
        <code class="text-neon-green text-sm">
if (kondisi1) {
    // kondisi1 true
} else if (kondisi2) {
    // kondisi2 true
} else if (kondisi3) {
    // kondisi3 true
} else {
    // semua kondisi false
}
        </code>
      </pre>
      
      <h3 class="font-pixel text-neon-green text-sm mb-3">🎯 Learning Objectives</h3>
      <ul class="list-disc list-inside text-text-secondary space-y-1">
        <li>Memahami cara mengevaluasi banyak kondisi</li>
        <li>Mampu menulis else-if chain dengan benar</li>
        <li>Memahami urutan eksekusi kondisi</li>
      </ul>
    `,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int nilai;
    
    cout << "Masukkan nilai (0-100): ";
    cin >> nilai;
    
    // TODO: Buat else-if chain untuk menentukan grade
    // A: 85-100, B: 70-84, C: 60-69, D: 50-59, E: <50
    
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int nilai;
    
    cout << "Masukkan nilai (0-100): ";
    cin >> nilai;
    
    if (nilai >= 85 && nilai <= 100) {
        cout << "Grade: A" << endl;
    } else if (nilai >= 70) {
        cout << "Grade: B" << endl;
    } else if (nilai >= 60) {
        cout << "Grade: C" << endl;
    } else if (nilai >= 50) {
        cout << "Grade: D" << endl;
    } else {
        cout << "Grade: E" << endl;
    }
    
    return 0;
}`,
    learningObjectives: [
      'Memahami cara mengevaluasi banyak kondisi',
      'Mampu menulis else-if chain dengan benar',
      'Memahami urutan eksekusi kondisi',
    ],
  },
  {
    id: 'nested-if',
    title: 'Nested If',
    description: 'Belajar percabangan di dalam percabangan',
    explanation: `
      <h3 class="font-pixel text-neon-green text-sm mb-3">📖 Apa itu Nested If?</h3>
      <p class="mb-4">
        <strong class="text-neon-blue">Nested if</strong> adalah if statement yang berada di dalam if statement lainnya.
        Digunakan untuk memeriksa kondisi yang lebih kompleks dengan hierarki.
      </p>
      
      <h3 class="font-pixel text-neon-green text-sm mb-3">🎯 Learning Objectives</h3>
      <ul class="list-disc list-inside text-text-secondary space-y-1">
        <li>Memahami konsep percabangan bersarang</li>
        <li>Mampu menulis nested if dengan benar</li>
        <li>Memahami hierarki kondisi dalam program</li>
      </ul>
    `,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int umur;
    bool punyaKTP;
    
    cout << "Masukkan umur: ";
    cin >> umur;
    cout << "Apakah punya KTP? (1=Ya, 0=Tidak): ";
    cin >> punyaKTP;
    
    // TODO: Buat nested if untuk menentukan bisa membuat SIM atau tidak
    // Syarat: umur >= 17 DAN punya KTP
    
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int umur;
    bool punyaKTP;
    
    cout << "Masukkan umur: ";
    cin >> umur;
    cout << "Apakah punya KTP? (1=Ya, 0=Tidak): ";
    cin >> punyaKTP;
    
    if (umur >= 17) {
        if (punyaKTP == true) {
            cout << "Anda bisa membuat SIM" << endl;
        } else {
            cout << "Anda belum bisa membuat SIM karena belum punya KTP" << endl;
        }
    } else {
        cout << "Anda belum bisa membuat SIM karena umur belum mencukupi" << endl;
    }
    
    return 0;
}`,
    learningObjectives: [
      'Memahami konsep percabangan bersarang',
      'Mampu menulis nested if dengan benar',
      'Memahami hierarki kondisi dalam program',
    ],
  },
  {
    id: 'switch',
    title: 'Switch-Case',
    description: 'Belajar percabangan alternatif untuk nilai diskrit',
    explanation: `
      <h3 class="font-pixel text-neon-green text-sm mb-3">📖 Apa itu Switch-Case?</h3>
      <p class="mb-4">
        <strong class="text-neon-blue">Switch-case</strong> adalah alternatif dari else-if chain ketika
        kondisi yang diperiksa adalah nilai diskrit (seperti integer atau karakter).
        Lebih efisien dan mudah dibaca dibandingkan else-if chain yang panjang.
      </p>
      
      <h3 class="font-pixel text-neon-green text-sm mb-3">🎯 Learning Objectives</h3>
      <ul class="list-disc list-inside text-text-secondary space-y-1">
        <li>Memahami kapan menggunakan switch-case</li>
        <li>Mampu menulis switch-case statement dengan benar</li>
        <li>Memahami penggunaan break dan default</li>
      </ul>
    `,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int hari;
    
    cout << "Masukkan nomor hari (1-7): ";
    cin >> hari;
    
    // TODO: Buat switch-case untuk menampilkan nama hari
    // 1=Senin, 2=Selasa, ..., 7=Minggu
    
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int hari;
    
    cout << "Masukkan nomor hari (1-7): ";
    cin >> hari;
    
    switch (hari) {
        case 1:
            cout << "Senin" << endl;
            break;
        case 2:
            cout << "Selasa" << endl;
            break;
        case 3:
            cout << "Rabu" << endl;
            break;
        case 4:
            cout << "Kamis" << endl;
            break;
        case 5:
            cout << "Jumat" << endl;
            break;
        case 6:
            cout << "Sabtu" << endl;
            break;
        case 7:
            cout << "Minggu" << endl;
            break;
        default:
            cout << "Nomor hari tidak valid" << endl;
    }
    
    return 0;
}`,
    learningObjectives: [
      'Memahami kapan menggunakan switch-case',
      'Mampu menulis switch-case statement dengan benar',
      'Memahami penggunaan break dan default',
    ],
  },
]
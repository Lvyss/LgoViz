import { Topic } from '@/types/module'

export const perulanganTopics: Topic[] = [
  {
    id: 'for',
    title: 'For Loop',
    description: 'Belajar perulangan dengan for loop',
    explanation: `
      <h3 class="font-pixel text-neon-green text-sm mb-3">📖 Apa itu For Loop?</h3>
      <p class="mb-4">
        <strong class="text-neon-blue">For loop</strong> adalah struktur perulangan yang digunakan ketika
        kita tahu berapa kali perulangan akan dilakukan. Terdiri dari tiga bagian:
        inisialisasi, kondisi, dan increment/decrement.
      </p>
      
      <h3 class="font-pixel text-neon-green text-sm mb-3">📝 Sintaks Dasar</h3>
      <pre class="bg-pixel-dark p-3 border border-neon-green/30 mb-4 overflow-x-auto">
        <code class="text-neon-green text-sm">
for (inisialisasi; kondisi; increment) {
    // blok kode yang diulang
}
        </code>
      </pre>
      
      <h3 class="font-pixel text-neon-green text-sm mb-3">🎯 Learning Objectives</h3>
      <ul class="list-disc list-inside text-text-secondary space-y-1">
        <li>Memahami konsep perulangan dalam pemrograman</li>
        <li>Mampu menulis for loop dengan benar</li>
        <li>Memahami tiga komponen for loop (inisialisasi, kondisi, increment)</li>
      </ul>
    `,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Buat for loop yang menampilkan angka 1 sampai 10
    
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 10; i++) {
        cout << i << endl;
    }
    
    return 0;
}`,
    learningObjectives: [
      'Memahami konsep perulangan dalam pemrograman',
      'Mampu menulis for loop dengan benar',
      'Memahami tiga komponen for loop',
    ],
  },
  {
    id: 'while',
    title: 'While Loop',
    description: 'Belajar perulangan dengan while loop',
    explanation: `
      <h3 class="font-pixel text-neon-green text-sm mb-3">📖 Apa itu While Loop?</h3>
      <p class="mb-4">
        <strong class="text-neon-blue">While loop</strong> adalah perulangan yang berjalan selama
        kondisi bernilai <strong class="text-neon-green">true</strong>. Kondisi diperiksa
        <strong class="text-neon-yellow">SEBELUM</strong> mengeksekusi blok kode.
      </p>
      
      <h3 class="font-pixel text-neon-green text-sm mb-3">🎯 Learning Objectives</h3>
      <ul class="list-disc list-inside text-text-secondary space-y-1">
        <li>Memahami perbedaan for dan while loop</li>
        <li>Mampu menulis while loop dengan benar</li>
        <li>Memahami risiko infinite loop</li>
      </ul>
    `,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Buat while loop yang menampilkan angka 1 sampai 10
    
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int i = 1;
    while (i <= 10) {
        cout << i << endl;
        i++;
    }
    
    return 0;
}`,
    learningObjectives: [
      'Memahami perbedaan for dan while loop',
      'Mampu menulis while loop dengan benar',
      'Memahami risiko infinite loop',
    ],
  },
  {
    id: 'do-while',
    title: 'Do-While Loop',
    description: 'Belajar perulangan dengan do-while loop',
    explanation: `
      <h3 class="font-pixel text-neon-green text-sm mb-3">📖 Apa itu Do-While Loop?</h3>
      <p class="mb-4">
        <strong class="text-neon-blue">Do-while loop</strong> mirip dengan while loop, tetapi
        kondisi diperiksa <strong class="text-neon-yellow">SETELAH</strong> mengeksekusi blok kode.
        Artinya, blok kode akan dijalankan <strong class="text-neon-green">minimal satu kali</strong>.
      </p>
      
      <h3 class="font-pixel text-neon-green text-sm mb-3">🎯 Learning Objectives</h3>
      <ul class="list-disc list-inside text-text-secondary space-y-1">
        <li>Memahami perbedaan while dan do-while</li>
        <li>Mampu menulis do-while loop dengan benar</li>
        <li>Memahami kapan menggunakan do-while</li>
      </ul>
    `,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Buat do-while loop yang menampilkan angka 1 sampai 10
    
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int i = 1;
    do {
        cout << i << endl;
        i++;
    } while (i <= 10);
    
    return 0;
}`,
    learningObjectives: [
      'Memahami perbedaan while dan do-while',
      'Mampu menulis do-while loop dengan benar',
      'Memahami kapan menggunakan do-while',
    ],
  },
  {
    id: 'nested-loop',
    title: 'Nested Loop',
    description: 'Belajar perulangan di dalam perulangan',
    explanation: `
      <h3 class="font-pixel text-neon-green text-sm mb-3">📖 Apa itu Nested Loop?</h3>
      <p class="mb-4">
        <strong class="text-neon-blue">Nested loop</strong> adalah loop di dalam loop lainnya.
        Biasanya digunakan untuk memproses data dua dimensi (seperti matriks) atau membuat pola.
      </p>
      
      <h3 class="font-pixel text-neon-green text-sm mb-3">🎯 Learning Objectives</h3>
      <ul class="list-disc list-inside text-text-secondary space-y-1">
        <li>Memahami konsep perulangan bersarang</li>
        <li>Mampu menulis nested loop dengan benar</li>
        <li>Memahami kompleksitas waktu dari nested loop</li>
      </ul>
    `,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Buat nested loop untuk membuat segitiga bintang
    // *
    // **
    // ***
    // ****
    // *****
    
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 5; i++) {
        for (int j = 1; j <= i; j++) {
            cout << "*";
        }
        cout << endl;
    }
    
    return 0;
}`,
    learningObjectives: [
      'Memahami konsep perulangan bersarang',
      'Mampu menulis nested loop dengan benar',
      'Memahami kompleksitas waktu dari nested loop',
    ],
  },
  {
    id: 'break-continue',
    title: 'Break & Continue',
    description: 'Belajar mengontrol aliran perulangan',
    explanation: `
      <h3 class="font-pixel text-neon-green text-sm mb-3">📖 Apa itu Break & Continue?</h3>
      <p class="mb-4">
        <strong class="text-neon-blue">Break</strong> digunakan untuk menghentikan perulangan secara paksa.<br/>
        <strong class="text-neon-blue">Continue</strong> digunakan untuk melompati iterasi saat ini dan lanjut ke iterasi berikutnya.
      </p>
      
      <h3 class="font-pixel text-neon-green text-sm mb-3">🎯 Learning Objectives</h3>
      <ul class="list-disc list-inside text-text-secondary space-y-1">
        <li>Memahami fungsi break dan continue</li>
        <li>Mampu menggunakan break untuk menghentikan loop</li>
        <li>Mampu menggunakan continue untuk melewati iterasi</li>
      </ul>
    `,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Buat loop dari 1-10
    // Gunakan break untuk berhenti di angka 5
    // Gunakan continue untuk melewati angka 3
    
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 10; i++) {
        if (i == 3) {
            continue;  // skip angka 3
        }
        if (i == 5) {
            break;     // berhenti di angka 5
        }
        cout << i << endl;
    }
    
    return 0;
}`,
    learningObjectives: [
      'Memahami fungsi break dan continue',
      'Mampu menggunakan break untuk menghentikan loop',
      'Mampu menggunakan continue untuk melewati iterasi',
    ],
  },
]
import { Topic } from '@/types/module'

export const strukturDataTopics: Topic[] = [
  {
    id: 'array',
    title: 'Array',
    description: 'Belajar menyimpan banyak data dalam satu variabel',
    explanation: `
      <h3 class="font-pixel text-neon-green text-sm mb-3">📖 Apa itu Array?</h3>
      <p class="mb-4">
        <strong class="text-neon-blue">Array</strong> adalah struktur data yang digunakan untuk menyimpan
        banyak nilai dengan tipe data yang sama dalam satu variabel. Setiap elemen array memiliki indeks,
        dimulai dari <strong class="text-neon-green">0</strong>.
      </p>
      
      <h3 class="font-pixel text-neon-green text-sm mb-3">🎯 Learning Objectives</h3>
      <ul class="list-disc list-inside text-text-secondary space-y-1">
        <li>Memahami konsep array dalam pemrograman</li>
        <li>Mampu mendeklarasikan dan menginisialisasi array</li>
        <li>Mampu mengakses dan memodifikasi elemen array</li>
      </ul>
    `,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Buat array dengan 5 bilangan bulat
    // Tampilkan semua elemen array menggunakan loop
    
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int angka[5] = {10, 20, 30, 40, 50};
    
    for (int i = 0; i < 5; i++) {
        cout << "Elemen ke-" << i << ": " << angka[i] << endl;
    }
    
    return 0;
}`,
    learningObjectives: [
      'Memahami konsep array dalam pemrograman',
      'Mampu mendeklarasikan dan menginisialisasi array',
      'Mampu mengakses dan memodifikasi elemen array',
    ],
  },
  {
    id: 'stack',
    title: 'Stack',
    description: 'Belajar struktur data LIFO (Last In First Out)',
    explanation: `
      <h3 class="font-pixel text-neon-green text-sm mb-3">📖 Apa itu Stack?</h3>
      <p class="mb-4">
        <strong class="text-neon-blue">Stack</strong> adalah struktur data dengan prinsip
        <strong class="text-neon-green">LIFO (Last In First Out)</strong> — data yang terakhir masuk akan keluar pertama.
        Seperti tumpukan piring: yang terakhir ditaruh adalah yang pertama diambil.
      </p>
      
      <h3 class="font-pixel text-neon-green text-sm mb-3">🎯 Learning Objectives</h3>
      <ul class="list-disc list-inside text-text-secondary space-y-1">
        <li>Memahami konsep stack dan prinsip LIFO</li>
        <li>Mampu melakukan operasi push (menambah) dan pop (menghapus)</li>
        <li>Memahami implementasi stack menggunakan array</li>
      </ul>
    `,
    starterCode: `#include <iostream>
using namespace std;

// Simulasi stack sederhana dengan array
int stack[100];
int top = -1;

void push(int nilai) {
    // TODO: Implementasi push
}

void pop() {
    // TODO: Implementasi pop
}

void tampilkan() {
    // TODO: Tampilkan semua isi stack
}

int main() {
    push(10);
    push(20);
    push(30);
    tampilkan();
    pop();
    tampilkan();
    
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int stack[100];
int top = -1;

void push(int nilai) {
    if (top < 99) {
        top++;
        stack[top] = nilai;
        cout << "Push: " << nilai << endl;
    } else {
        cout << "Stack penuh!" << endl;
    }
}

void pop() {
    if (top >= 0) {
        cout << "Pop: " << stack[top] << endl;
        top--;
    } else {
        cout << "Stack kosong!" << endl;
    }
}

void tampilkan() {
    cout << "Isi stack: ";
    for (int i = 0; i <= top; i++) {
        cout << stack[i] << " ";
    }
    cout << endl;
}

int main() {
    push(10);
    push(20);
    push(30);
    tampilkan();
    pop();
    tampilkan();
    
    return 0;
}`,
    learningObjectives: [
      'Memahami konsep stack dan prinsip LIFO',
      'Mampu melakukan operasi push dan pop',
      'Memahami implementasi stack menggunakan array',
    ],
  },
  {
    id: 'queue',
    title: 'Queue',
    description: 'Belajar struktur data FIFO (First In First Out)',
    explanation: `
      <h3 class="font-pixel text-neon-green text-sm mb-3">📖 Apa itu Queue?</h3>
      <p class="mb-4">
        <strong class="text-neon-blue">Queue</strong> adalah struktur data dengan prinsip
        <strong class="text-neon-green">FIFO (First In First Out)</strong> — data yang pertama masuk akan keluar pertama.
        Seperti antrian: yang datang pertama dilayani pertama.
      </p>
      
      <h3 class="font-pixel text-neon-green text-sm mb-3">🎯 Learning Objectives</h3>
      <ul class="list-disc list-inside text-text-secondary space-y-1">
        <li>Memahami konsep queue dan prinsip FIFO</li>
        <li>Mampu melakukan operasi enqueue (tambah) dan dequeue (hapus)</li>
        <li>Memahami perbedaan stack dan queue</li>
      </ul>
    `,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Implementasi queue sederhana

int main() {
    // Simulasi antrian
    
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int queue[100];
int front = -1;
int rear = -1;

void enqueue(int nilai) {
    if (rear < 99) {
        if (front == -1) front = 0;
        rear++;
        queue[rear] = nilai;
        cout << "Enqueue: " << nilai << endl;
    } else {
        cout << "Queue penuh!" << endl;
    }
}

void dequeue() {
    if (front <= rear && front != -1) {
        cout << "Dequeue: " << queue[front] << endl;
        front++;
    } else {
        cout << "Queue kosong!" << endl;
    }
}

void tampilkan() {
    cout << "Isi queue: ";
    for (int i = front; i <= rear; i++) {
        cout << queue[i] << " ";
    }
    cout << endl;
}

int main() {
    enqueue(10);
    enqueue(20);
    enqueue(30);
    tampilkan();
    dequeue();
    tampilkan();
    
    return 0;
}`,
    learningObjectives: [
      'Memahami konsep queue dan prinsip FIFO',
      'Mampu melakukan operasi enqueue dan dequeue',
      'Memahami perbedaan stack dan queue',
    ],
  },
  {
    id: 'linear-search',
    title: 'Linear Search',
    description: 'Belajar mencari data secara linear',
    explanation: `
      <h3 class="font-pixel text-neon-green text-sm mb-3">📖 Apa itu Linear Search?</h3>
      <p class="mb-4">
        <strong class="text-neon-blue">Linear search</strong> adalah algoritma pencarian paling sederhana.
        Cara kerjanya: memeriksa setiap elemen array satu per satu dari awal hingga akhir
        sampai data yang dicari ditemukan atau sampai akhir array.
      </p>
      
      <h3 class="font-pixel text-neon-green text-sm mb-3">🎯 Learning Objectives</h3>
      <ul class="list-disc list-inside text-text-secondary space-y-1">
        <li>Memahami cara kerja linear search</li>
        <li>Mampu mengimplementasikan linear search dalam kode</li>
        <li>Memahami kompleksitas waktu linear search (O(n))</li>
      </ul>
    `,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int arr[] = {5, 3, 8, 6, 2, 7, 4, 1};
    int cari = 7;
    int ukuran = sizeof(arr) / sizeof(arr[0]);
    
    // TODO: Implementasi linear search untuk mencari nilai 7
    
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int arr[] = {5, 3, 8, 6, 2, 7, 4, 1};
    int cari = 7;
    int ukuran = sizeof(arr) / sizeof(arr[0]);
    int ditemukan = -1;
    
    for (int i = 0; i < ukuran; i++) {
        if (arr[i] == cari) {
            ditemukan = i;
            break;
        }
    }
    
    if (ditemukan != -1) {
        cout << "Nilai " << cari << " ditemukan di indeks " << ditemukan << endl;
    } else {
        cout << "Nilai " << cari << " tidak ditemukan" << endl;
    }
    
    return 0;
}`,
    learningObjectives: [
      'Memahami cara kerja linear search',
      'Mampu mengimplementasikan linear search dalam kode',
      'Memahami kompleksitas waktu linear search (O(n))',
    ],
  },
  {
    id: 'bubble-sort',
    title: 'Bubble Sort',
    description: 'Belajar mengurutkan data dengan bubble sort',
    explanation: `
      <h3 class="font-pixel text-neon-green text-sm mb-3">📖 Apa itu Bubble Sort?</h3>
      <p class="mb-4">
        <strong class="text-neon-blue">Bubble sort</strong> adalah algoritma pengurutan sederhana
        yang bekerja dengan cara berulang kali menukar elemen yang berdekatan jika urutannya salah.
        Disebut bubble karena elemen yang lebih besar "menggelembung" ke posisi yang benar.
      </p>
      
      <h3 class="font-pixel text-neon-green text-sm mb-3">🎯 Learning Objectives</h3>
      <ul class="list-disc list-inside text-text-secondary space-y-1">
        <li>Memahami cara kerja bubble sort</li>
        <li>Mampu mengimplementasikan bubble sort dalam kode</li>
        <li>Memahami kompleksitas waktu bubble sort (O(n²))</li>
      </ul>
    `,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr) / sizeof(arr[0]);
    
    cout << "Array sebelum sorting: ";
    for (int i = 0; i < n; i++) {
        cout << arr[i] << " ";
    }
    cout << endl;
    
    // TODO: Implementasi bubble sort
    
    cout << "Array setelah sorting: ";
    for (int i = 0; i < n; i++) {
        cout << arr[i] << " ";
    }
    cout << endl;
    
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr) / sizeof(arr[0]);
    
    cout << "Array sebelum sorting: ";
    for (int i = 0; i < n; i++) {
        cout << arr[i] << " ";
    }
    cout << endl;
    
    // Bubble sort
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Tukar
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    
    cout << "Array setelah sorting: ";
    for (int i = 0; i < n; i++) {
        cout << arr[i] << " ";
    }
    cout << endl;
    
    return 0;
}`,
    learningObjectives: [
      'Memahami cara kerja bubble sort',
      'Mampu mengimplementasikan bubble sort dalam kode',
      'Memahami kompleksitas waktu bubble sort (O(n²))',
    ],
  },
]
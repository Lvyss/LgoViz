import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "LgoViz - Visualisasi Algoritma C++",
  description: "Media pembelajaran visualisasi algoritma berbasis web untuk siswa SMK RPL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-pixel-dark text-text-primary antialiased scanline-overlay">
        {children}
      </body>
    </html>
  );
}
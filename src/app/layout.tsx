import type { Metadata } from "next";
import { Inter, Playfair_Display, Lora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AstroMap - Mapa Astral com IA",
  description: "Calcule seu mapa astral completo com interpretação por inteligência artificial. Grátis e sem cadastro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${lora.variable} font-sans min-h-screen text-slate-200`}>
        {children}
      </body>
    </html>
  );
}

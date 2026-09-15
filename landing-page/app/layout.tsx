import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Franca Leads Scanner | Gerencie seus leads em Franca, SP",
  description: "Escaneie e gerencie leads em Franca, SP com um sistema profissional de funil de vendas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-body bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
import type { Metadata, Viewport } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { StoreHydrator } from "@/components/shared/store-hydrator";
import { Providers } from "@/components/providers";
import { DevWatermark } from "@/components/shared/dev-watermark";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});
const jetbrains = JetBrains_Mono({ variable: "--font-mono-jet", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "RSPCB JalRakshak — ETP Wastewater Monitoring",
    template: "%s · RSPCB JalRakshak",
  },
  description:
    "An initiative by the Rajasthan State Pollution Control Board (RSPCB) – Balotra. A smart platform for monitoring individual Effluent Treatment Plant (ETP) textile wastewater, water balance, compliance and environmental sustainability across the Balotra cluster.",
  applicationName: "RSPCB JalRakshak",
  keywords: ["RSPCB", "JalRakshak", "ETP", "Effluent Treatment Plant", "Balotra", "wastewater monitoring", "water balance"],
  authors: [{ name: "Rajasthan State Pollution Control Board" }],
};

export const viewport: Viewport = {
  themeColor: "#060b14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full antialiased font-sans", inter.variable, sora.variable, jetbrains.variable)}
    >
      <body className="min-h-full bg-background text-foreground">
        <StoreHydrator />
        <Providers>{children}</Providers>
        <DevWatermark />
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}

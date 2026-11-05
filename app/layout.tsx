import type { Metadata } from "next"
import "./globals.css"
import SyncProvider from "@/components/SyncProvider"

export const metadata: Metadata = {
  metadataBase: new URL("https://mysoftplay.app"),
  title: "softplay — less planning, more playing",
  description: "Family day out planner. Less deciding. More playing.",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  openGraph: {
    title: "softplay — Fun Decision Maker",
    description: "Answer a few questions, spin the wheel, and end the \"what should we do today?\" spiral. Family days out, decided.",
    url: "https://mysoftplay.app",
    siteName: "softplay",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "softplay — Fun Decision Maker",
    description: "Answer a few questions, spin the wheel, and end the \"what should we do today?\" spiral.",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ height: '100%' }}>
      <body style={{ minHeight: '100%' }}>
        <SyncProvider />
        {children}
      </body>
    </html>
  )
}

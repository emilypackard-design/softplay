import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "softplay — less planning, more playing",
  description: "Family day out planner. Less deciding. More playing.",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ height: '100%' }}>
      <body style={{ minHeight: '100%' }}>{children}</body>
    </html>
  )
}

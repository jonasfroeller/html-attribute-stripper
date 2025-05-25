import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HTML Attribute Stripper',
  description: 'Strip HTML attributes from your HTML code',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

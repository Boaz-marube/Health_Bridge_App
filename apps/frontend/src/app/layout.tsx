import './globals.css'

export const metadata = {
  title: 'Health Bridge App',
  description: 'Healthcare management application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
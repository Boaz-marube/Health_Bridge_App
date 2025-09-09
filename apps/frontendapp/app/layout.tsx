import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/app/components/theme/theme-provider";

export const metadata: Metadata = {
  title: 'Health Bridge App',
  description: 'Healthcare management application',
  icons: {
    icon: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="health-bridge-theme"
          disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
       
      </body>
    </html>
  );
}

import type * as React from "react"
import { Inter } from "next/font/google"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Image Gallery",
  description: "A simple image gallery with upload and delete functionality",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`} suppressHydrationWarning ={true}>
        <Header />
        <main className="flex-grow py-8 px-4 sm:px-6">{children}</main>
        <Footer />
      </body>
    </html>
  )
}


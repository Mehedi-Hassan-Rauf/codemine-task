"use client"
import { Collections } from "./Icons"

export default function Header() {
  return (
    <header className="bg-blue-600 text-white">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center py-4 px-4 sm:px-6">
          <Collections className="w-6 h-6 mr-2" />
          <h1 className="text-xl sm:text-2xl font-bold">Image Gallery</h1>
        </div>
      </div>
    </header>
  )
}

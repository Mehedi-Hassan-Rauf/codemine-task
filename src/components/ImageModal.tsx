"use client"

import { useEffect } from "react"
import type { ImageType } from "@/types"
import { Close } from "./Icons"

interface ImageModalProps {
  open: boolean
  image: ImageType | null
  onClose: () => void
}

export default function ImageModal({ open, image, onClose }: ImageModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (open) {
      document.addEventListener("keydown", handleEsc)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open || !image) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div className="bg-white rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{image.title}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100" aria-label="Close">
            <Close className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-auto flex-grow">
          <div className="bg-black flex items-center justify-center h-[60vh]">
            <img
              src={image.url || "/placeholder.svg"}
              alt={image.title}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="p-4">
            <p className="text-gray-700">Uploaded: {new Date(image.created_at).toLocaleDateString()}</p>
            {image.tags && image.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {image.tags.map((tag, index) => (
                  <span key={index} className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

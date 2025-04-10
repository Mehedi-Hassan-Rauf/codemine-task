"use client"

import { useState } from "react"
import type { ImageType } from "@/types"
import { Delete, ZoomIn, BrokenImage } from "./Icons"

interface ImageCardProps {
  image: ImageType
  onClick: () => void
  onDeleteClick: () => void
}

export default function ImageCard({ image, onClick, onDeleteClick }: ImageCardProps) {
  const [loaded, setLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative pt-[75%]">
        {" "}
        {/* 4:3 aspect ratio */}
        {!loaded && <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>}
        {imageError ? (
          <div
            className="absolute inset-0 flex items-center justify-center bg-gray-100 cursor-pointer"
            onClick={onClick}
          >
            <BrokenImage className="w-10 h-10 text-gray-400" />
          </div>
        ) : (
          <img
            src={image.url || "/placeholder.svg"}
            alt={image.title}
            className={`absolute inset-0 w-full h-full object-cover cursor-pointer ${loaded ? "block" : "hidden"}`}
            onClick={onClick}
            onLoad={() => setLoaded(true)}
            onError={() => {
              setImageError(true)
              setLoaded(true)
            }}
          />
        )}
      </div>
      <div className="p-4 flex-grow">
        <h3 className="font-semibold text-lg mb-2 truncate">{image.title}</h3>
        {image.tags && image.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {image.tags.map((tag, index) => (
              <span key={index} className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-full mr-1 mb-1">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="px-4 py-2 border-t border-gray-100 flex justify-between">
        <button
          onClick={onClick}
          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
          aria-label="View image"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={onDeleteClick}
          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
          aria-label="Delete image"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import type { ImageType } from "@/types"
import ImageCard from "./ImageCard"
import ImageModal from "./ImageModal"

interface ImageGridProps {
  images: ImageType[]
  onLoadMore: () => void
  hasMore: boolean
  loading: boolean
  onDeleteClick: (image: ImageType) => void
}

export default function ImageGrid({ images, onLoadMore, hasMore, loading, onDeleteClick }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleImageClick = (image: ImageType) => {
    setSelectedImage(image)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedImage(null)
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((image) => (
          <ImageCard
            key={image.public_id}
            image={image}
            onClick={() => handleImageClick(image)}
            onDeleteClick={() => onDeleteClick(image)}
          />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Load More
          </button>
        </div>
      )}

      <ImageModal open={modalOpen} image={selectedImage} onClose={handleCloseModal} />
    </>
  )
}

"use client"

import { useState, useEffect } from "react"
import ImageGrid from "@/components/ImageGrid"
import UploadButton from "@/components/UploadButton"
import SearchBar from "@/components/SearchBar"
import { fetchImages, deleteImage } from "@/lib/cloudinary-client"
import type { ImageType } from "@/types"
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog"

export default function Home() {
  const [images, setImages] = useState<ImageType[]>([])
  const [filteredImages, setFilteredImages] = useState<ImageType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null)

  const loadImages = async () => {
    try {
      setLoading(true)
      const result = await fetchImages()
      setImages(result.images)
      setFilteredImages(result.images)
    } catch (error) {
      console.error("Error loading images:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadImages()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = images.filter(
        (image) =>
          image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (image.tags && image.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))),
      )
      setFilteredImages(filtered)
    } else {
      setFilteredImages(images)
    }
  }, [searchQuery, images])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleUploadSuccess = () => {
    loadImages()
  }

  const handleDeleteClick = (image: ImageType) => {
    setSelectedImage(image)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedImage) {
      try {
        await deleteImage(selectedImage.public_id)
        setImages(images.filter((img) => img.public_id !== selectedImage.public_id))
        setDeleteDialogOpen(false)
        setSelectedImage(null)
      } catch (error) {
        console.error("Error deleting image:", error)
      }
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setSelectedImage(null)
  }

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Image Gallery</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {images.length > 0 && <SearchBar onSearch={handleSearch} />}
          <UploadButton onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!loading &&
        images.length > 0 &&
        (filteredImages.length > 0 ? (
          <ImageGrid
            images={filteredImages}
            onLoadMore={() => {}}
            hasMore={false}
            loading={loading}
            onDeleteClick={handleDeleteClick}
          />
        ) : (
          <p className="text-center my-8">No images match your search. Try a different search term.</p>
        ))}

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        imageName={selectedImage?.title || ""}
      />
    </div>
  )
}

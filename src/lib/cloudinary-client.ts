import type { ImageType } from "@/types"

// Fetch images from our API route
export async function fetchImages(): Promise<{ images: ImageType[] }> {
  try {
    const response = await fetch("/api/cloudinary")

    if (!response.ok) {
      throw new Error(`Failed to fetch images: ${response.statusText}`)
    }

    // Return exactly what the API returns, no modifications
    return await response.json()
  } catch (error) {
    console.error("Error fetching images:", error)
    return { images: [] }
  }
}

// Upload images via our API route
export async function uploadImages(files: File[], tags: string[] = []): Promise<void> {
  try {
    // Process each file
    await Promise.all(
      files.map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)

        if (tags.length > 0) {
          formData.append("tags", tags.join(","))
        }

        const response = await fetch("/api/cloudinary", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Upload error response:", errorText)
          throw new Error(`Failed to upload image: ${response.statusText}`)
        }

        return await response.json()
      }),
    )
  } catch (error) {
    console.error("Error uploading images:", error)
    throw error // Rethrow to show the actual error
  }
}

// Delete image via our API route
export async function deleteImage(publicId: string): Promise<void> {
  try {
    const response = await fetch("/api/cloudinary", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId }),
    })

    if (!response.ok) {
      throw new Error(`Failed to delete image: ${response.statusText}`)
    }
  } catch (error) {
    console.error("Error deleting image:", error)
    throw new Error("Failed to delete image")
  }
}

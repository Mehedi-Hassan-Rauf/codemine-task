import type { ImageType } from "@/types"

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUD_NAME
const API_KEY = process.env.NEXT_PUBLIC_API_KEY
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET

// Fetch images from Cloudinary
export async function fetchImages(): Promise<{ images: ImageType[] }> {
  try {
    // Create a timestamp for the signature
    const timestamp = Math.round(new Date().getTime() / 1000)

    // Create a signature for the API request
    const signature = await generateSignature(`timestamp=${timestamp}`)

    // Fetch images from Cloudinary Admin API
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image?max_results=100`, {
      headers: {
        Authorization: `Basic ${btoa(`${API_KEY}:${API_SECRET}`)}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch images: ${response.statusText}`)
    }

    const data = await response.json()

    const images: ImageType[] = data.resources.map((resource: any) => ({
      public_id: resource.public_id,
      url: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v${resource.version}/${resource.public_id}.${resource.format}`,
      title: resource.public_id.split("/").pop() || resource.public_id,
      format: resource.format,
      width: resource.width,
      height: resource.height,
      created_at: resource.created_at,
      tags: resource.tags || [],
    }))

    return { images }
  } catch (error) {
    console.error("Error fetching images:", error)
    return { images: [] }
  }
}

// Upload images to Cloudinary
export async function uploadImages(files: File[], tags: string[] = []): Promise<void> {
  try {
    await Promise.all(
      files.map(async (file) => {
        // Create a timestamp for the signature
        const timestamp = Math.round(new Date().getTime() / 1000)

        // Create a FormData object for the upload
        const formData = new FormData()
        formData.append("file", file)
        formData.append("timestamp", timestamp.toString())
        formData.append("api_key", API_KEY || "")

        // Add tags if provided
        if (tags.length > 0) {
          formData.append("tags", tags.join(","))
        }

        // Generate a signature for the upload
        const signature = await generateSignature(`tags=${tags.join(",")}&timestamp=${timestamp}${API_SECRET}`)
        formData.append("signature", signature)

        // Upload to Cloudinary
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload image: ${response.statusText}`)
        }

        return await response.json()
      }),
    )
  } catch (error) {
    console.error("Error uploading images:", error)
    throw new Error("Failed to upload images")
  }
}

// Delete image from Cloudinary
export async function deleteImage(publicId: string): Promise<void> {
  try {
    // Create a timestamp for the signature
    const timestamp = Math.round(new Date().getTime() / 1000)

    // Create a signature for the deletion
    const signature = await generateSignature(`public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`)

    // Create a FormData object for the deletion
    const formData = new FormData()
    formData.append("public_id", publicId)
    formData.append("timestamp", timestamp.toString())
    formData.append("api_key", API_KEY || "")
    formData.append("signature", signature)

    // Delete from Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to delete image: ${response.statusText}`)
    }
  } catch (error) {
    console.error("Error deleting image:", error)
    throw new Error("Failed to delete image")
  }
}

async function generateSignature(paramsToSign: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(paramsToSign)

  const hashBuffer = await crypto.subtle.digest("SHA-1", data)

  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

  return hashHex
}

import { NextResponse } from "next/server"

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUD_NAME
const API_KEY = process.env.NEXT_PUBLIC_API_KEY
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET

// Helper function to generate a signature for Cloudinary API requests using Web Crypto API
async function generateSignature(paramsToSign: string): Promise<string> {
  // Convert the string to an array buffer
  const encoder = new TextEncoder()
  const data = encoder.encode(paramsToSign)

  // Generate SHA-1 hash
  const hashBuffer = await crypto.subtle.digest("SHA-1", data)

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

  return hashHex
}

export async function GET() {
  try {
    // Create a timestamp for the signature
    const timestamp = Math.round(new Date().getTime() / 1000)

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

    // Transform Cloudinary response to our ImageType format
    // Filter out sample images (they usually have "sample" in the public_id)
    const images = data.resources
      ? data.resources
          .filter((resource: any) => {
            // Filter out sample images and default Cloudinary images
            const publicId = resource.public_id.toLowerCase()
            return !publicId.includes("sample") && !publicId.includes("demo") && !publicId.startsWith("cld-sample")
          })
          .map((resource: any) => ({
            public_id: resource.public_id,
            url: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v${resource.version}/${resource.public_id}.${resource.format}`,
            // Extract the original filename from the context metadata if available
            // Otherwise, use the last part of the public_id as a fallback
            title:
              resource.context?.custom?.original_filename ||
              resource.original_filename ||
              resource.public_id.split("/").pop() ||
              resource.public_id,
            format: resource.format,
            width: resource.width,
            height: resource.height,
            created_at: resource.created_at,
            tags: resource.tags || [],
          }))
      : []

    return NextResponse.json({ images })
  } catch (error) {
    console.error("Error fetching images:", error)
    return NextResponse.json({ images: [] }, { status: 200 }) // Return empty array instead of error
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const tags = formData.get("tags") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Get the original filename without extension
    const originalFilename = file.name.split(".").slice(0, -1).join(".") || file.name

    // Create a timestamp for the signature
    const timestamp = Math.round(new Date().getTime() / 1000)

    // Create a FormData object for the upload
    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append("file", file)
    cloudinaryFormData.append("timestamp", timestamp.toString())
    cloudinaryFormData.append("api_key", API_KEY || "")

    // Add the original filename as context metadata
    cloudinaryFormData.append("context", `original_filename=${originalFilename}`)

    // Add use_filename and unique_filename parameters to preserve the original filename
    cloudinaryFormData.append("use_filename", "true")
    cloudinaryFormData.append("unique_filename", "true")

    // Add tags if provided
    if (tags) {
      cloudinaryFormData.append("tags", tags)
    }

    // Generate a signature for the upload
    // Note: The signature string needs to include all parameters in alphabetical order
    let signatureString = `context=original_filename=${originalFilename}`
    if (tags) signatureString += `&tags=${tags}`
    signatureString += `&timestamp=${timestamp}&unique_filename=true&use_filename=true${API_SECRET}`

    const signature = await generateSignature(signatureString)
    cloudinaryFormData.append("signature", signature)

    // Upload to Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: cloudinaryFormData,
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Cloudinary error response:", errorData)
      throw new Error(`Failed to upload image: ${response.statusText}`)
    }

    const result = await response.json()

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { publicId } = await request.json()

    if (!publicId) {
      return NextResponse.json({ error: "No public_id provided" }, { status: 400 })
    }

    // Create a timestamp for the signature
    const timestamp = Math.round(new Date().getTime() / 1000)

    // Generate a signature for the deletion
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

    const result = await response.json()

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error deleting image:", error)
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUD_NAME

export async function GET() {
  try {
    const mockImages = Array.from({ length: 9 }, (_, i) => {
      const id = `image-${i + 1}`
      return {
        public_id: id,
        url: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v1/samples/landscapes/nature-mountains.jpg`,
        title: `Sample Image ${i + 1}`,
        format: "jpg",
        width: 800,
        height: 600,
        created_at: new Date().toISOString(),
        tags: ["sample", "nature", "landscape"],
      }
    })

    return NextResponse.json({ images: mockImages })
  } catch (error) {
    console.error("Error fetching images:", error)
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
  }
}

export async function POST() {
  try {
    return NextResponse.json({
      success: true,
      message: "Images uploaded successfully",
    })
  } catch (error) {
    console.error("Error uploading images:", error)
    return NextResponse.json({ error: "Failed to upload images" }, { status: 500 })
  }
}

export async function DELETE() {
  try {

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting image:", error)
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
  }
}
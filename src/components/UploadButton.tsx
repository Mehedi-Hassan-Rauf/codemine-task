"use client"

import type React from "react"
import { useState, useRef } from "react"
import { CloudUpload, Close, Add } from "./Icons"
import { uploadImages } from "@/lib/cloudinary-client"

interface UploadButtonProps {
  onUploadSuccess: () => void
}

export default function UploadButton({ onUploadSuccess }: UploadButtonProps) {
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    if (!uploading) {
      setOpen(false)
      setFiles([])
      setError(null)
      setTags([])
      setCurrentTag("")
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const fileList = Array.from(event.target.files)
      // Filter for image files only
      const imageFiles = fileList.filter((file) => file.type.startsWith("image/"))
      setFiles((prev) => [...prev, ...imageFiles])
      setError(null)

      // Reset the input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault()
      handleAddTag()
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one file to upload")
      return
    }

    try {
      setUploading(true)
      setError(null)

      await uploadImages(files, tags)

      setOpen(false)
      setFiles([])
      setTags([])
      setCurrentTag("")
      onUploadSuccess()
    } catch (err) {
      console.error("Upload error:", err)
      setError(`Failed to upload images: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleClickOpen}
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center justify-center"
      >
        <CloudUpload className="w-5 h-5 mr-2" />
        Upload
      </button>

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose}></div>

            <div className="relative bg-white rounded-lg max-w-md w-full mx-auto shadow-xl">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-medium">Upload Images</h3>
                <button
                  onClick={handleClose}
                  disabled={uploading}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                  aria-label="Close"
                >
                  <Close className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">{error}</div>}

                <div className="mb-6">
                  <label
                    htmlFor="file-upload"
                    className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-md cursor-pointer ${
                      uploading
                        ? "bg-gray-100 border-gray-300"
                        : "border-blue-300 hover:border-blue-400 bg-blue-50 hover:bg-blue-100"
                    }`}
                  >
                    <div className="space-y-1 text-center">
                      <CloudUpload className="mx-auto h-12 w-12 text-blue-500" />
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600 hover:underline">Select Images</span>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input
                      id="file-upload"
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </label>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (optional)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                        >
                          <span className="sr-only">Remove tag</span>
                          <Close className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add tags"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={uploading}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!currentTag.trim() || uploading}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Add className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {files.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Selected Files ({files.length})</h4>
                    <div className="max-h-40 overflow-y-auto mb-4 border rounded-md">
                      {files.map((file, index) => (
                        <div key={index} className="flex justify-between items-center p-2 border-b last:border-b-0">
                          <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                          <button
                            onClick={() => handleRemoveFile(index)}
                            disabled={uploading}
                            className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                          >
                            <Close className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={uploading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading || files.length === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
                  >
                    {uploading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      "Upload"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

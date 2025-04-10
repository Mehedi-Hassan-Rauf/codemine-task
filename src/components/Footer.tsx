export default function Footer() {
  return (
    <footer className="py-6 px-4 mt-auto bg-gray-100">
      <div className="container mx-auto max-w-6xl">
        <p className="text-center text-sm text-gray-600">
          © {new Date().getFullYear()}{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Simple Image Gallery
          </a>
          {" - Built with Next.js, Tailwind CSS & Cloudinary"}
        </p>
      </div>
    </footer>
  )
}

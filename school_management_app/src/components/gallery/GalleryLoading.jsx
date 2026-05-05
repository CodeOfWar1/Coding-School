export default function GalleryLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#faa853] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading gallery...</p>
      </div>
    </div>
  )
}

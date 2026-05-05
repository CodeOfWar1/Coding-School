import { FaArrowLeft, FaArrowRight, FaCompress, FaDownload, FaExpand, FaShare, FaTimes } from 'react-icons/fa'

export default function GalleryLightbox({
  filteredImages,
  currentImageIndex,
  closeLightbox,
  nextImage,
  prevImage,
  downloadImage,
  shareImage,
  toggleFullscreen,
  isFullscreen,
}) {
  if (!filteredImages.length) return null

  const current = filteredImages[currentImageIndex]

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in"
      onClick={closeLightbox}
      role="presentation"
    >
      <button
        type="button"
        onClick={closeLightbox}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white hover:text-[#faa853] transition-colors z-20 bg-black/40 rounded-full p-2"
        aria-label="Close"
      >
        <FaTimes size={24} className="sm:w-8 sm:h-8" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          prevImage()
        }}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white hover:text-[#faa853] transition-colors z-20 bg-black/50 rounded-full p-2 sm:p-3 hover:bg-black/70"
        aria-label="Previous"
      >
        <FaArrowLeft size={20} className="sm:w-6 sm:h-6" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          nextImage()
        }}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white hover:text-[#faa853] transition-colors z-20 bg-black/50 rounded-full p-2 sm:p-3 hover:bg-black/70"
        aria-label="Next"
      >
        <FaArrowRight size={20} className="sm:w-6 sm:h-6" />
      </button>

      <div
        className="relative w-[94vw] sm:w-auto max-w-[94vw] sm:max-w-[90vw] max-h-[92vh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        <img
          src={current?.src}
          alt={current?.title}
          className="w-full max-w-[94vw] sm:max-w-[90vw] max-h-[74vh] sm:max-h-[85vh] object-contain rounded-lg"
        />

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent p-3 sm:p-6 rounded-b-lg">
          <h3 className="text-white font-bold text-base sm:text-xl mb-1 leading-tight">{current?.title}</h3>
          <p className="text-white/80 text-xs sm:text-sm">
            {current?.category} • {current?.date}
          </p>
        </div>

        <div className="absolute top-3 right-14 sm:top-4 sm:right-20 flex gap-2 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              downloadImage()
            }}
            className="bg-black/50 rounded-full p-2 text-white hover:text-[#faa853] hover:bg-black/70 transition-colors"
            title="Download"
            aria-label="Download"
          >
            <FaDownload size={16} className="sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              shareImage()
            }}
            className="bg-black/50 rounded-full p-2 text-white hover:text-[#faa853] hover:bg-black/70 transition-colors"
            title="Share"
            aria-label="Share"
          >
            <FaShare size={16} className="sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggleFullscreen()
            }}
            className="bg-black/50 rounded-full p-2 text-white hover:text-[#faa853] hover:bg-black/70 transition-colors"
            title="Fullscreen"
            aria-label="Fullscreen"
          >
            {isFullscreen ? <FaCompress size={16} className="sm:w-5 sm:h-5" /> : <FaExpand size={16} className="sm:w-5 sm:h-5" />}
          </button>
        </div>

        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-black/60 rounded-full px-2.5 py-1 text-white text-xs sm:text-sm">
          {currentImageIndex + 1} / {filteredImages.length}
        </div>
      </div>
    </div>
  )
}

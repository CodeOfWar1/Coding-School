import { FaDownload, FaPlayCircle } from 'react-icons/fa'

export default function GalleryGrid({ filteredImages, images, openLightbox, downloadItemAtIndex }) {
  if (filteredImages.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl">
        <p className="text-gray-500 text-lg">No images found in this category</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredImages.map((image, index) => (
          <div
            key={image.id}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="relative h-56 sm:h-64 overflow-hidden">
              {image.mediaType === 'video' ? (
                <div className="relative h-full w-full bg-black">
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    controlsList="nodownload"
                    className="w-full h-full object-contain"
                    src={image.src}
                  >
                    <source src={image.src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/60 text-white text-xs font-semibold flex items-center gap-1">
                    <FaPlayCircle className="text-[#faa853]" />
                    Video
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="relative h-full w-full cursor-pointer overflow-hidden text-left"
                  onClick={() => openLightbox(index)}
                >
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-bold text-lg">{image.title}</h3>
                      <p className="text-white/80 text-sm">{image.category}</p>
                    </div>
                  </div>
                </button>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-[#2d3f5d] mb-1 truncate">{image.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{image.category}</span>
                <span className="text-xs text-gray-400">{image.date}</span>
              </div>

              <div className="mt-3 flex gap-2">
                {image.mediaType !== 'video' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => openLightbox(index)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-[#faa853]/10 text-[#faa853] text-sm font-semibold hover:bg-[#faa853] hover:text-white transition-all duration-300"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadItemAtIndex(index)}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      aria-label="Download"
                    >
                      <FaDownload className="text-sm" />
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-gray-500">Use controls to play video</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length > 0 && (
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            {filteredImages.length === images.length
              ? `✨ You've seen all ${images.length} beautiful moments ✨`
              : `Showing ${filteredImages.length} of ${images.length} photos`}
          </p>
        </div>
      )}
    </>
  )
}

import { forwardRef, useState } from 'react'
import { FaTimes, FaArrowRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useLandingSiteContent } from '../../hooks/useLandingSiteContent'

const Gallery = forwardRef((_, ref) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const { data: site } = useLandingSiteContent()
  const images = site.gallery_items ?? []

  return (
    <section id="gallery" ref={ref} className="py-5 md:py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 md:mb-16">
          <div data-reveal className="scroll-reveal">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#faa853] mb-3">{site.gallery_eyebrow}</p>
            <h2 className="text-3xl md:text-5xl font-black text-[#2d3f5d] mb-4">{site.gallery_heading}</h2>
            <p className="site-body max-w-2xl mx-auto">{site.gallery_subtitle}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((item, idx) => (
            <div
              key={`${item.title}-${idx}`}
              data-reveal
              className={`group relative overflow-hidden rounded-2xl cursor-pointer scroll-reveal ${
                idx % 2 === 0 ? 'scroll-reveal--left' : 'scroll-reveal--right'
              }`}
              onClick={() => setSelectedImage(item)}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2d3f5d]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-white font-bold text-lg">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>

        <div data-reveal className="text-center mt-12 md:mt-16 scroll-reveal">
          <Link
            to="/gallery"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white border-2 border-[#faa853] text-[#faa853] font-semibold hover:bg-[#faa853] hover:text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <span>See Our Full Gallery</span>
            <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-base text-gray-500 mt-3">Explore more memorable moments from our academy</p>
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
          role="presentation"
        >
          <button type="button" className="absolute top-4 right-4 text-white hover:text-[#faa853] transition-colors">
            <FaTimes size={32} />
          </button>
          <img src={selectedImage.image_url} alt={selectedImage.title} className="max-w-full max-h-[90vh] object-contain rounded-lg" />
        </div>
      )}
    </section>
  )
})

Gallery.displayName = 'Gallery'
export default Gallery

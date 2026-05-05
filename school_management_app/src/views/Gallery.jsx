import { useState, useEffect } from 'react'
import { FaTimes, FaArrowLeft, FaArrowRight, FaDownload, FaShare, FaExpand, FaCompress, FaPlayCircle, FaFilter, FaChevronDown } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import RegisterModal from '../components/registration/RegisterModal'

// Function to dynamically import all images from a folder
const importAllImages = () => {
  try {
    const images = {}
    // This will import all images from the gallery folder
    // Make sure to put your images in src/assets/gallery/
    const imageModules = import.meta.glob('../../public/media/gallery/*.{jpg,jpeg,png,webp,gif,JPG,JPEG,PNG,WEBP,GIF}')
    
    Object.entries(imageModules).forEach(([path, loader], index) => {
      const filename = path.split('/').pop()
      const title = filename.replace(/\.[^/.]+$/, '').replace(/-/g, ' ').replace(/_/g, ' ')
      images[filename] = { path, loader, title, filename }
    })
    
    return images
  } catch (error) {
    console.error('Error loading images:', error)
    return {}
  }
}

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [signUp, setSignUp] = useState(false)

  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    setLoading(true)
    const imageMap = importAllImages()
    const imageList = await Promise.all(
      Object.entries(imageMap).map(async ([filename, data], index) => {
        const module = await data.loader()
        return {
          id: index,
          src: module.default,
          title: data.title,
          filename: data.filename,
          category: getCategoryFromFilename(data.filename),
          date: new Date().toLocaleDateString()
        }
      })
    )
    const videoItem = {
      id: 'video-demo',
      src: '/media/gallery/demo.mp4',
      title: 'Academy Demo Video',
      filename: 'demo.mp4',
      category: 'Videos',
      date: new Date().toLocaleDateString(),
      mediaType: 'video',
    }

    setImages([videoItem, ...imageList])
    setLoading(false)
  }

  const getCategoryFromFilename = (filename) => {
    const lower = filename.toLowerCase()
    if (lower.includes('graduation') || lower.includes('choose the right next step')) return 'Graduation'
    if (lower.includes('coding') || lower.includes('code') || lower.includes('program')) return 'Coding'
    if (lower.includes('robot') || lower.includes('robotic')) return 'Robotics'
    if (lower.includes('class') || lower.includes('lesson')) return 'Classes'
    if (lower.includes('event') || lower.includes('workshop')) return 'Events'
    if (lower.includes('social') || lower.includes('community')) return 'Community'
    if (lower.includes('game') || lower.includes('design')) return 'Game Design'
    return 'General'
  }

  const discoveredCategories = [...new Set(images.map((img) => img.category))]
  const categories = [
    'all',
    'General',
    ...discoveredCategories.filter((category) => category !== 'General'),
  ]

  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory)

  useEffect(() => {
    if (!categories.includes(selectedCategory)) {
      setSelectedCategory('all')
    }
  }, [categories, selectedCategory])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [selectedCategory])

  const openLightbox = (index) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    document.body.style.overflow = 'unset'
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % filteredImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length)
  }

  const downloadImage = () => {
    const image = filteredImages[currentImageIndex]
    const link = document.createElement('a')
    link.href = image.src
    link.download = image.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const shareImage = async () => {
    const image = filteredImages[currentImageIndex]
    if (navigator.share) {
      try {
        await navigator.share({
          title: `AnvilTech Gallery - ${image.title}`,
          text: `Check out this amazing moment from AnvilTech Academy!`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      alert('Copy the URL to share this image')
    }
  }

  const toggleFullscreen = () => {
    const elem = document.documentElement
    if (!isFullscreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
        setIsFullscreen(true)
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  useEffect(() => {
    const handleKeydown = (e) => {
      if (!lightboxOpen) return
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [lightboxOpen, currentImageIndex])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#faa853] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RegisterModal open={signUp} onClose={() => setSignUp(false)} />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#2d3f5d] to-[#1a2542] text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <FaArrowLeft className="text-sm" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-black mb-4 animate-fade-in-up">Our Gallery</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl animate-fade-in-up animation-delay-200">
            Explore memorable moments from our coding classes, robotics workshops, and community events
          </p>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        {/* Stats & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-2xl font-black text-[#2d3f5d]">{filteredImages.length}</span>
                <span className="text-gray-500 ml-1">Photos</span>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div>
                <span className="text-2xl font-black text-[#2d3f5d]">{images.length}</span>
                <span className="text-gray-500 ml-1">Total</span>
              </div>
            </div>

            <div className="relative w-full sm:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-[#2d3f5d] to-[#1a2542] text-white shadow-md"
              >
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                  <FaFilter className="text-[#faa853]" />
                  {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                </span>
                <FaChevronDown
                  className={`text-[#faa853] transition-transform duration-300 ${mobileMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {mobileMenuOpen && (
                <div className="absolute z-20 mt-2 w-full rounded-2xl border border-[#2d3f5d]/15 bg-white p-3 shadow-xl animate-fade-in-up">
                  <p className="text-xs font-semibold text-gray-500 mb-2 px-1">Choose what to view</p>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                          selectedCategory === category
                            ? 'bg-[#faa853] text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:flex sm:flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-[#faa853] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Image Grid */}
        {filteredImages.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <p className="text-gray-500 text-lg">No images found in this category</p>
          </div>
        ) : (
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
                    <div 
                      className="relative h-full cursor-pointer overflow-hidden"
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
                    </div>
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
                          onClick={() => openLightbox(index)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-[#faa853]/10 text-[#faa853] text-sm font-semibold hover:bg-[#faa853] hover:text-white transition-all duration-300"
                        >
                          View
                        </button>
                        <button
                          onClick={() => downloadImage()}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
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
        )}

        {/* End Message */}
        {filteredImages.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              {filteredImages.length === images.length 
                ? `✨ You've seen all ${images.length} beautiful moments ✨`
                : `Showing ${filteredImages.length} of ${images.length} photos`}
            </p>
          </div>
        )}
      </div>

      {/* Custom Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white hover:text-[#faa853] transition-colors z-20 bg-black/40 rounded-full p-2"
          >
            <FaTimes size={24} className="sm:w-8 sm:h-8" />
          </button>

          {/* Navigation Buttons */}
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white hover:text-[#faa853] transition-colors z-20 bg-black/50 rounded-full p-2 sm:p-3 hover:bg-black/70"
          >
            <FaArrowLeft size={20} className="sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white hover:text-[#faa853] transition-colors z-20 bg-black/50 rounded-full p-2 sm:p-3 hover:bg-black/70"
          >
            <FaArrowRight size={20} className="sm:w-6 sm:h-6" />
          </button>

          {/* Image Container */}
          <div 
            className="relative w-[94vw] sm:w-auto max-w-[94vw] sm:max-w-[90vw] max-h-[92vh] sm:max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredImages[currentImageIndex]?.src}
              alt={filteredImages[currentImageIndex]?.title}
              className="w-full max-w-[94vw] sm:max-w-[90vw] max-h-[74vh] sm:max-h-[85vh] object-contain rounded-lg"
            />
            
            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent p-3 sm:p-6 rounded-b-lg">
              <h3 className="text-white font-bold text-base sm:text-xl mb-1 leading-tight">
                {filteredImages[currentImageIndex]?.title}
              </h3>
              <p className="text-white/80 text-xs sm:text-sm">
                {filteredImages[currentImageIndex]?.category} • {filteredImages[currentImageIndex]?.date}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-3 right-14 sm:top-4 sm:right-20 flex gap-2 z-20">
              <button
                onClick={(e) => { e.stopPropagation(); downloadImage(); }}
                className="bg-black/50 rounded-full p-2 text-white hover:text-[#faa853] hover:bg-black/70 transition-colors"
                title="Download"
              >
                <FaDownload size={16} className="sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); shareImage(); }}
                className="bg-black/50 rounded-full p-2 text-white hover:text-[#faa853] hover:bg-black/70 transition-colors"
                title="Share"
              >
                <FaShare size={16} className="sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                className="bg-black/50 rounded-full p-2 text-white hover:text-[#faa853] hover:bg-black/70 transition-colors"
                title="Fullscreen"
              >
                {isFullscreen ? <FaCompress size={16} className="sm:w-5 sm:h-5" /> : <FaExpand size={16} className="sm:w-5 sm:h-5" />}
              </button>
            </div>

            {/* Counter */}
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-black/60 rounded-full px-2.5 py-1 text-white text-xs sm:text-sm">
              {currentImageIndex + 1} / {filteredImages.length}
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setSignUp(true)}
        className="md:hidden fixed bottom-5 right-5 z-[70] px-5 py-3 rounded-full bg-[#faa853] text-white font-bold text-sm shadow-lg hover:bg-[#e89235] active:scale-95 transition-all"
      >
        Register
      </button>
    </div>
  )
}
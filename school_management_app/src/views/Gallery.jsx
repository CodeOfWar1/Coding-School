import { useState } from 'react'
import GalleryFilterBar from '../components/gallery/GalleryFilterBar'
import GalleryGrid from '../components/gallery/GalleryGrid'
import GalleryLightbox from '../components/gallery/GalleryLightbox'
import GalleryLoading from '../components/gallery/GalleryLoading'
import GalleryPageHeader from '../components/gallery/GalleryPageHeader'
import Footer from '../components/layout/Footer'
import RegisterModal from '../components/registration/RegisterModal'
import { useGallery } from '../hooks/useGallery'

export default function Gallery() {
  const [signUp, setSignUp] = useState(false)
  const g = useGallery()

  if (g.loading) {
    return <GalleryLoading />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RegisterModal open={signUp} onClose={() => setSignUp(false)} />

      <GalleryPageHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <GalleryFilterBar
          categories={g.categories}
          selectedCategory={g.selectedCategory}
          setSelectedCategory={g.setSelectedCategory}
          filteredCount={g.filteredImages.length}
          totalCount={g.images.length}
          mobileMenuOpen={g.mobileMenuOpen}
          setMobileMenuOpen={g.setMobileMenuOpen}
        />

        <GalleryGrid
          filteredImages={g.filteredImages}
          images={g.images}
          openLightbox={g.openLightbox}
          downloadItemAtIndex={g.downloadItemAtIndex}
        />
      </div>

      {g.lightboxOpen && (
        <GalleryLightbox
          filteredImages={g.filteredImages}
          currentImageIndex={g.currentImageIndex}
          closeLightbox={g.closeLightbox}
          nextImage={g.nextImage}
          prevImage={g.prevImage}
          downloadImage={g.downloadImage}
          shareImage={g.shareImage}
          toggleFullscreen={g.toggleFullscreen}
          isFullscreen={g.isFullscreen}
        />
      )}

      <button
        type="button"
        onClick={() => setSignUp(true)}
        className="md:hidden fixed bottom-5 right-5 z-[70] px-5 py-3 rounded-full bg-[#faa853] text-white font-bold text-sm shadow-lg hover:bg-[#e89235] active:scale-95 transition-all"
      >
        Register
      </button>

      <Footer />
    </div>
  )
}

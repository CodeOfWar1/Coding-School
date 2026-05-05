import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  buildGalleryVideoItem,
  getCategoryFromFilename,
  importAllImages,
} from '../utils/galleryMedia'

export function useGallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const loadImages = useCallback(async () => {
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
          date: new Date().toLocaleDateString(),
        }
      }),
    )
    setImages([buildGalleryVideoItem(), ...imageList])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadImages()
  }, [loadImages])

  const categories = useMemo(() => {
    const discovered = [...new Set(images.map((img) => img.category))]
    return ['all', 'General', ...discovered.filter((category) => category !== 'General')]
  }, [images])

  const filteredImages = useMemo(
    () => (selectedCategory === 'all' ? images : images.filter((img) => img.category === selectedCategory)),
    [images, selectedCategory],
  )

  useEffect(() => {
    if (!categories.includes(selectedCategory)) setSelectedCategory('all')
  }, [categories, selectedCategory])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [selectedCategory])

  const openLightbox = useCallback((index) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
    document.body.style.overflow = 'hidden'
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
    document.body.style.overflow = 'unset'
  }, [])

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % filteredImages.length)
  }, [filteredImages.length])

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length)
  }, [filteredImages.length])

  const downloadItemAtIndex = useCallback((index) => {
    const image = filteredImages[index]
    if (!image) return
    const link = document.createElement('a')
    link.href = image.src
    link.download = image.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [filteredImages])

  const downloadImage = useCallback(() => {
    downloadItemAtIndex(currentImageIndex)
  }, [downloadItemAtIndex, currentImageIndex])

  const shareImage = useCallback(async () => {
    const image = filteredImages[currentImageIndex]
    if (!image) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: `AnvilTech Gallery - ${image.title}`,
          text: 'Check out this amazing moment from AnvilTech Academy!',
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      alert('Copy the URL to share this image')
    }
  }, [filteredImages, currentImageIndex])

  const toggleFullscreen = useCallback(() => {
    const elem = document.documentElement
    if (!isFullscreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
        setIsFullscreen(true)
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [isFullscreen])

  useEffect(() => {
    const handleKeydown = (e) => {
      if (!lightboxOpen) return
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [lightboxOpen, nextImage, prevImage, closeLightbox])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return {
    images,
    loading,
    lightboxOpen,
    currentImageIndex,
    selectedCategory,
    setSelectedCategory,
    isFullscreen,
    mobileMenuOpen,
    setMobileMenuOpen,
    categories,
    filteredImages,
    openLightbox,
    closeLightbox,
    nextImage,
    prevImage,
    downloadImage,
    downloadItemAtIndex,
    shareImage,
    toggleFullscreen,
  }
}

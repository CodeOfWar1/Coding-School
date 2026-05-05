/** Dynamic imports for files in public/media/gallery */
export function importAllImages() {
  try {
    const images = {}
    const imageModules = import.meta.glob('../../public/media/gallery/*.{jpg,jpeg,png,webp,gif,JPG,JPEG,PNG,WEBP,GIF}')

    Object.entries(imageModules).forEach(([path, loader]) => {
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

export function getCategoryFromFilename(filename) {
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

export function buildGalleryVideoItem() {
  return {
    id: 'video-demo',
    src: '/media/gallery/demo.mp4',
    title: 'Academy Demo Video',
    filename: 'demo.mp4',
    category: 'Videos',
    date: new Date().toLocaleDateString(),
    mediaType: 'video',
  }
}

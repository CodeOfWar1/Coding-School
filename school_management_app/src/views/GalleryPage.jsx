import { useEffect, useState } from 'react'
import SiteNavbar from '../components/SiteNavbar'
import ViviFooter from '../components/ViviFooter'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { FOOTER_GALLERY_IMAGES, GALLERY_IMAGES, SCHOOL_MEDIA_IMAGES } from '../content/schoolMedia'

export default function GalleryPage() {
  const revealRef = useScrollReveal({ rootMargin: '0px 0px -8% 0px', threshold: 0.05 })
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  return (
    <div ref={revealRef} className="vivi-page min-h-screen bg-[var(--vivi-light)]">
      <div className="mx-auto w-full max-w-7xl overflow-hidden bg-white shadow-sm">
        <SiteNavbar variant="light" sticky showRegisterPay={false} />

        <header className="vivi-page-header">
          <div className="relative h-[260px]">
            <img src={SCHOOL_MEDIA_IMAGES.hero} alt="Gallery" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[rgba(16,55,65,0.6)]" />
            <div className="absolute inset-0 flex items-center">
              <div className="px-4 sm:px-6">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--anvil-cyan-bright)]">School Moments</p>
                <h1 className="vivi-heading mt-2 text-4xl text-white sm:text-5xl">Full Activity Gallery</h1>
                <p className="mt-2 max-w-2xl text-sm text-white/90">
                  A complete view of classroom activities, robotics labs, project showcases, and community learning moments.
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-6">
          <section className="rounded-2xl border border-[color:color-mix(in_srgb,var(--anvil-royal)_14%,white)] bg-gradient-to-br from-[var(--anvil-card-faint)] via-white to-[var(--vivi-light)] p-6 sm:p-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="vivi-heading text-3xl text-[var(--anvil-red)]">Explore all images</h2>
                <p className="mt-2 text-sm text-[var(--vivi-muted)]">
                  Each image is matched to its named activity section. Click any card to open a larger preview.
                </p>
              </div>
              <p className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--anvil-red)]">
                {GALLERY_IMAGES.length} photos
              </p>
            </div>

            <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
              <div className="grid gap-0 lg:grid-cols-[360px_1fr]">
                <div className="p-5 sm:p-6">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--anvil-royal)]">Featured</p>
                  <h3 className="vivi-heading mt-2 text-2xl text-[var(--anvil-red)]">Demo walkthrough</h3>
                  <p className="mt-2 text-sm text-[var(--vivi-muted)]">
                    A quick look at the platform and learning experience.
                  </p>
                </div>
                <div className="bg-black">
                  <div className="aspect-video w-full">
                    <video
                      className="h-full w-full object-cover"
                      controls
                      controlsList="nodownload noplaybackrate nofullscreen noremoteplayback"
                      disablePictureInPicture
                      disableRemotePlayback
                      playsInline
                      preload="metadata"
                      src="/media/school%20img/demo.mp4"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {['Learning', 'Programs', 'Community', 'Innovation'].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--anvil-red)] ring-1 ring-red-100"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {GALLERY_IMAGES.map((image, idx) => (
                <article
                  key={image.id}
                  className="scroll-reveal scroll-reveal--up group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{ '--reveal-delay': `${idx * 35}ms` }}
                >
                  <button type="button" className="block w-full text-left" onClick={() => setSelectedImage(image)}>
                    <div className="aspect-[4/3] w-full bg-slate-100 p-2">
                      <img
                        src={image.src}
                        alt={image.alt}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full rounded-xl object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-black uppercase tracking-[0.14em] text-[var(--anvil-red)]">{image.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--vivi-muted)]">{image.description}</p>
                    </div>
                  </button>
                </article>
              ))}
            </div>
          </section>
        </main>

        <ViviFooter galleryImages={FOOTER_GALLERY_IMAGES} />
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4">
          <div className="w-full max-w-6xl rounded-2xl bg-white p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--anvil-red)]">{selectedImage.title}</p>
                <p className="mt-1 text-sm text-[var(--vivi-muted)]">{selectedImage.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="mt-4 max-h-[76vh] w-full rounded-xl object-contain bg-slate-100"
            />
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect } from 'react'

/**
 * Home page: adds `.revealed` to `[data-reveal]` when each block enters the viewport (once per element).
 * Pairs with `.scroll-reveal` / `.scroll-reveal--left|right` in `index.css`.
 */
export function useLandingScrollReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll('[data-reveal]')
    if (!nodes.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('revealed')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])
}

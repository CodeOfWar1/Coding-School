import { useEffect } from 'react'

/** Toggle `revealed` on `[data-reveal]` nodes (About page scroll animations). */
export function useAboutScrollReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('revealed')
          else entry.target.classList.remove('revealed')
        })
      },
      { threshold: 0.2, rootMargin: '0px 0px -40px 0px' },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])
}

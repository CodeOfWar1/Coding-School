import { useEffect, useRef } from 'react'

/**
 * Observes elements with class `scroll-reveal` (or `selector`) inside `ref` and adds `is-visible` when in view.
 */
export function useScrollReveal(options = {}) {
  const containerRef = useRef(null)
  const { selector = '.scroll-reveal', rootMargin = '0px 0px -12% 0px', threshold = 0.08, once = true } = options

  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const elements = root.querySelectorAll(selector)
    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          if (once) observer.unobserve(entry.target)
        })
      },
      { root: null, rootMargin, threshold },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [selector, rootMargin, threshold, once])

  return containerRef
}

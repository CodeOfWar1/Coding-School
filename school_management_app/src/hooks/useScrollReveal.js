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
    let scrollDirection = 'down'
    let lastY = window.scrollY
    const onScroll = () => {
      const currentY = window.scrollY
      scrollDirection = currentY >= lastY ? 'down' : 'up'
      lastY = currentY
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('is-from-up', 'is-from-down')
            entry.target.classList.add('is-visible', scrollDirection === 'up' ? 'is-from-up' : 'is-from-down')
            if (once) observer.unobserve(entry.target)
            return
          }
          if (!once) {
            entry.target.classList.remove('is-visible', 'is-from-up', 'is-from-down')
          }
        })
      },
      { root: null, rootMargin, threshold },
    )

    elements.forEach((el) => observer.observe(el))
    return () => {
      window.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [selector, rootMargin, threshold, once])

  return containerRef
}

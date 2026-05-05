import { FaCheckCircle } from 'react-icons/fa'
import { GLANCE_STATS, WHY_FAMILY_ITEMS } from './aboutConstants'

export default function AboutClosingSections() {
  return (
    <>
      <section data-reveal className="bg-gradient-to-br from-[#2d3f5d] via-[#263553] to-[#1a2542] rounded-2xl shadow-sm p-6 md:p-8 scroll-reveal">
        <h3 className="text-2xl md:text-3xl font-black text-white mb-4">Our Online Community</h3>
        <p className="text-white/85 leading-relaxed mb-5">
          Beyond the classroom, Anvil Coding Academy nurtures an active online community where learners stay connected, share ideas, and continue building together.
        </p>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/10 border border-white/15 p-4">
            <p className="text-[#faa853] font-bold text-sm mb-1">Peer Collaboration</p>
            <p className="text-white/85 text-sm">Students ask questions, exchange tips, and solve challenges together in a supportive digital space.</p>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/15 p-4">
            <p className="text-[#faa853] font-bold text-sm mb-1">Showcase Culture</p>
            <p className="text-white/85 text-sm">Learners present projects online, receive feedback, and celebrate wins as a community.</p>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/15 p-4">
            <p className="text-[#faa853] font-bold text-sm mb-1">Continuous Growth</p>
            <p className="text-white/85 text-sm">The online community keeps students engaged between sessions and encourages lifelong learning habits.</p>
          </div>
        </div>
      </section>

      <section
        data-reveal
        className="rounded-2xl border border-[#2d3f5d]/10 bg-gradient-to-br from-white via-[#f8fbff] to-[#fff8ef] shadow-md p-6 md:p-8 scroll-reveal"
      >
        <div className="mb-6 md:mb-8 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#faa853] mb-2">Why us</p>
          <h3 className="text-2xl md:text-3xl font-black text-[#2d3f5d] mb-2">Why Families Choose Us</h3>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Practical teaching, small groups, and a community that keeps learners supported between classes.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {WHY_FAMILY_ITEMS.map((item, index) => {
            const isLast = index === WHY_FAMILY_ITEMS.length - 1
            const fromLeft = index % 2 === 0
            return (
              <div
                key={item}
                data-reveal
                className={`group relative overflow-hidden rounded-2xl border border-[#2d3f5d]/10 bg-white/90 p-4 md:p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#faa853]/35 hover:shadow-lg scroll-reveal ${fromLeft ? 'scroll-reveal--left' : 'scroll-reveal--right'} ${isLast ? 'md:col-span-2' : ''}`}
              >
                <div
                  className="pointer-events-none absolute inset-y-3 left-0 w-1 rounded-full bg-gradient-to-b from-[#faa853] to-[#2d3f5d] opacity-80"
                  aria-hidden
                />
                <div className="relative flex gap-4 pl-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#faa853] to-[#e89235] text-white shadow-md ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-105">
                    <FaCheckCircle className="text-lg" aria-hidden />
                  </div>
                  <p className="text-gray-700 text-sm md:text-[15px] leading-relaxed pt-0.5 min-w-0">{item}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section
        data-reveal
        className="rounded-2xl border border-[#2d3f5d]/10 bg-gradient-to-br from-white via-[#f8fbff] to-[#fff8ef] shadow-md p-6 md:p-8 scroll-reveal"
      >
        <div className="mb-6 md:mb-8 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#faa853] mb-2">Snapshot</p>
          <h3 className="text-2xl md:text-3xl font-black text-[#2d3f5d] mb-2">At A Glance</h3>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Quick facts about our campus, who we serve, and how we operate.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {GLANCE_STATS.map((row, index) => {
            const Icon = row.Icon
            const fromLeft = index % 2 === 0
            return (
              <div
                key={row.label}
                data-reveal
                className={`group relative overflow-hidden rounded-2xl border border-[#2d3f5d]/10 bg-white/90 p-5 md:p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#faa853]/35 hover:shadow-lg scroll-reveal ${fromLeft ? 'scroll-reveal--left' : 'scroll-reveal--right'}`}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#2d3f5d] to-[#1a2542] text-[#faa853] shadow-md ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105">
                  <Icon className="text-lg" aria-hidden />
                </div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#faa853] font-bold">{row.label}</p>
                <p className="text-[#2d3f5d] font-semibold text-sm md:text-base leading-snug mt-2">{row.value}</p>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}

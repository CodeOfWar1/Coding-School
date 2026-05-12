import { FaUsers } from 'react-icons/fa'
import { PROFILE_INTRO, SCHOOL_PROFILE } from '../../content/siteProfile'
import { SCHOOL_MEDIA_IMAGES } from '../../content/schoolMedia'

export default function AboutWhoWeAreCard() {
  return (
    <section
      data-reveal
      className="scroll-reveal scroll-reveal--about-hero overflow-hidden rounded-2xl border border-[#2d3f5d]/12 bg-gradient-to-br from-white via-[#f8fbff] to-[#fff8ef] shadow-[0_22px_55px_-14px_rgba(45,63,93,0.22)] ring-1 ring-white/60"
    >
      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-0 md:items-stretch md:min-h-0">
        <div className="relative h-72 sm:h-80 md:h-full md:min-h-[26rem] lg:min-h-[30rem] w-full shrink-0 overflow-hidden bg-[#dfe6f0] ring-1 ring-inset ring-black/[0.04]">
          <img
            src={SCHOOL_MEDIA_IMAGES.hero}
            alt="Students learning at Anvil Coding Academy"
            className="absolute inset-0 h-full w-full object-cover object-[center_22%]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#1a2542]/55 via-transparent to-[#1a2542]/25" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#1a2542]/65 to-transparent" />
          <div className="pointer-events-none absolute inset-y-8 right-0 hidden w-px bg-gradient-to-b from-transparent via-white/35 to-transparent md:block" />
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/85 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#2d3f5d] shadow-lg backdrop-blur-md">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#faa853] shadow-sm shadow-[#faa853]/50" aria-hidden />
            Extracurricular tech school
          </span>
        </div>
        <div className="relative flex min-h-0 flex-col justify-center border-t border-[#2d3f5d]/10 p-6 md:min-h-[26rem] md:border-l md:border-t-0 md:p-9 lg:min-h-[30rem] lg:p-10">
          <div className="pointer-events-none absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-[#faa853]/12 blur-3xl" />
          <div className="pointer-events-none absolute -top-12 right-12 h-40 w-40 rounded-full bg-[#2d3f5d]/[0.06] blur-2xl" />
          <header className="relative mb-6 flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2d3f5d] to-[#1a2542] text-[#faa853] shadow-lg ring-2 ring-white/70">
              <FaUsers className="text-xl" aria-hidden />
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#faa853]">Who we are</p>
              <div className="mt-2 h-0.5 w-10 rounded-full bg-gradient-to-r from-[#faa853] to-[#f28c38]" aria-hidden />
              <h2 className="mt-3 text-2xl font-black leading-tight text-[#2d3f5d] md:text-[1.65rem]">{SCHOOL_PROFILE.name}</h2>
            </div>
          </header>
          <div className="relative mb-8 max-w-prose text-[15px] leading-7 text-gray-700 md:text-base">
            <p className="font-semibold text-[#2d3f5d]">{PROFILE_INTRO.welcomeLine}</p>
            <div className="mt-6 space-y-6 border-t border-[#2d3f5d]/10 pt-6">
              {PROFILE_INTRO.sections.map((block) => (
                <section key={block.id} aria-labelledby={`profile-intro-${block.id}`}>
                  <h3
                    id={`profile-intro-${block.id}`}
                    className="text-[11px] font-black uppercase tracking-[0.14em] text-[#faa853]"
                  >
                    {block.title}
                  </h3>
                  <p className="mt-2.5 text-gray-700 leading-relaxed">{block.body}</p>
                </section>
              ))}
            </div>
          </div>
          <div className="relative grid grid-cols-2 gap-3 md:gap-4">
            <div className="rounded-2xl border border-[#2d3f5d]/10 bg-white/75 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-[#faa853]/30 hover:shadow-md">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#faa853]">Age group</p>
              <p className="mt-1.5 text-base font-bold text-[#2d3f5d]">5–19 years</p>
            </div>
            <div className="rounded-2xl border border-[#2d3f5d]/10 bg-white/75 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-[#faa853]/30 hover:shadow-md">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#faa853]">Learning style</p>
              <p className="mt-1.5 text-base font-bold leading-snug text-[#2d3f5d]">Hands-on & projects</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

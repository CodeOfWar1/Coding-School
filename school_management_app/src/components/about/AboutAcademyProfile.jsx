import {
  FaAward,
  FaBolt,
  FaBookOpen,
  FaChalkboardTeacher,
  FaHandshake,
  FaLaptopCode,
  FaLightbulb,
  FaRocket,
  FaSchool,
  FaUsers,
} from 'react-icons/fa'
import {
  ACADEMIC_OFFERINGS_TABLE,
  CLIENT2_COURSES,
  COMMUNITY_PARTNERSHIPS,
  COMMUNITY_PARTNERSHIPS_CLOSING,
  FACULTY_AND_ENVIRONMENT,
  MILESTONES,
  MISSION_VISION_VALUES,
  OVERVIEW_FACTS,
  PARTNERSHIP_OBJECTIVES,
  SIGNATURE_PROGRAMS,
  STUDENT_SUCCESS,
  VALUE_DIFFERENTIATORS,
} from '../../content/siteProfile'
import { COURSE_CARD_ICONS } from './aboutConstants'

function revealSide(index) {
  return index % 2 === 0 ? 'scroll-reveal--left' : 'scroll-reveal--right'
}

function SectionShell({
  id,
  kicker,
  title,
  children,
  className = '',
  sectionReveal = true,
  headerClassName = '',
}) {
  return (
    <section
      id={id}
      {...(sectionReveal ? { 'data-reveal': true } : {})}
      className={`rounded-2xl border border-[#2d3f5d]/10 bg-white shadow-sm p-6 md:p-8 ${sectionReveal ? 'scroll-reveal' : ''} ${className}`.trim()}
    >
      <header className={`mb-6 md:mb-8 ${headerClassName}`.trim()}>
        {kicker ? (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#faa853] mb-2">{kicker}</p>
        ) : null}
        {title ? <h2 className="text-2xl md:text-3xl font-black text-[#2d3f5d]">{title}</h2> : null}
      </header>
      {children}
    </section>
  )
}

/** Shared: scroll-reveal + index-based horizontal motion */
function RevealWrap({ index, className = '', children }) {
  return (
    <article data-reveal className={`scroll-reveal ${revealSide(index)} ${className}`.trim()}>
      {children}
    </article>
  )
}

/** Bold gradient cap + clean white body */
function CardCap({ index, icon: Icon, label, children, className = '' }) {
  return (
    <RevealWrap
      index={index}
      className={`group overflow-hidden rounded-2xl border border-[#2d3f5d]/10 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${className}`.trim()}
    >
      <div className="h-1.5 bg-gradient-to-r from-[#faa853] via-[#f28c38] to-[#2d3f5d]" aria-hidden />
      <div className="relative p-5 md:p-6">
        {Icon ? (
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#2d3f5d] text-[#faa853] shadow-inner ring-2 ring-[#faa853]/30 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
              <Icon className="text-lg" aria-hidden />
            </span>
            {label ? (
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[#2d3f5d]">{label}</span>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </RevealWrap>
  )
}

/** Soft glow blob + crisp border */
function CardBlob({ index, icon: Icon, label, children, className = '' }) {
  return (
    <RevealWrap
      index={index}
      className={`group relative overflow-hidden rounded-3xl border border-[#2d3f5d]/12 bg-white p-5 md:p-6 shadow-md transition-all duration-300 hover:border-[#faa853]/40 hover:shadow-xl ${className}`.trim()}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-[#faa853]/25 to-[#2d3f5d]/10 blur-2xl transition-opacity duration-500 group-hover:opacity-90"
        aria-hidden
      />
      <div className="relative">
        {Icon ? (
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#fff8ef] to-[#ffe4c4] text-[#2d3f5d] ring-2 ring-[#faa853]/40">
              <Icon className="text-base" aria-hidden />
            </span>
            {label ? <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#faa853]">{label}</span> : null}
          </div>
        ) : null}
        {children}
      </div>
    </RevealWrap>
  )
}

/** Vertical accent on the right + cool gray panel */
function CardStripeEdge({ index, icon: Icon, label, children, className = '' }) {
  return (
    <RevealWrap
      index={index}
      className={`group relative overflow-hidden rounded-2xl border border-[#2d3f5d]/8 bg-gradient-to-l from-[#eef2f8] to-white pl-5 pr-6 py-5 md:pl-6 md:pr-8 md:py-6 shadow-sm transition-all duration-300 hover:shadow-md ${className}`.trim()}
    >
      <div
        className="pointer-events-none absolute inset-y-3 right-0 w-1.5 rounded-l-full bg-gradient-to-b from-[#2d3f5d] via-[#faa853] to-[#2d3f5d] opacity-90"
        aria-hidden
      />
      <div className="relative pr-2">
        {Icon ? (
          <div className="mb-3 flex items-center gap-2">
            <Icon className="text-lg text-[#2d3f5d]" aria-hidden />
            {label ? <span className="font-bold text-[#2d3f5d] text-sm">{label}</span> : null}
          </div>
        ) : null}
        {children}
      </div>
    </RevealWrap>
  )
}

/** Warm paper tone — brochure feel */
function CardWarm({ index, icon: Icon, label, children, className = '' }) {
  return (
    <RevealWrap
      index={index}
      className={`group relative overflow-hidden rounded-2xl border border-[#faa853]/25 bg-gradient-to-br from-[#fffbf5] via-[#fff8ef] to-[#ffeedd] p-5 md:p-6 shadow-[0_12px_40px_-18px_rgba(250,168,83,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#faa853]/45 ${className}`.trim()}
    >
      <div className="absolute left-4 top-4 h-8 w-1 rounded-full bg-[#2d3f5d]/80 opacity-40 group-hover:opacity-70" aria-hidden />
      <div className="relative pl-3">
        {Icon ? (
          <div className="mb-3 flex items-center gap-3">
            <span className="rounded-lg bg-white/80 px-2 py-1 text-[#2d3f5d] shadow-sm ring-1 ring-[#2d3f5d]/10">
              <Icon className="text-base" aria-hidden />
            </span>
            {label ? (
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#2d3f5d]/90">{label}</span>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </RevealWrap>
  )
}

/** Dashed frame — editorial */
function CardDashed({ index, icon: Icon, label, children, className = '' }) {
  return (
    <RevealWrap
      index={index}
      className={`rounded-2xl border-2 border-dashed border-[#2d3f5d]/20 bg-white/90 p-5 md:p-6 transition-all duration-300 hover:border-[#faa853]/50 hover:bg-white ${className}`.trim()}
    >
      {Icon ? (
        <div className="mb-3 flex items-center gap-2 border-b border-[#2d3f5d]/10 pb-2">
          <Icon className="text-[#faa853]" aria-hidden />
          {label ? <span className="text-sm font-bold text-[#2d3f5d]">{label}</span> : null}
        </div>
      ) : null}
      {children}
    </RevealWrap>
  )
}

/** Frosted glass */
function CardGlass({ index, icon: Icon, label, children, className = '' }) {
  return (
    <RevealWrap
      index={index}
      className={`overflow-hidden rounded-2xl border border-white/60 bg-white/55 p-5 md:p-6 shadow-md backdrop-blur-md ring-1 ring-[#2d3f5d]/10 transition-all duration-300 hover:bg-white/75 hover:ring-[#faa853]/25 ${className}`.trim()}
    >
      {Icon ? (
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-[#2d3f5d] shadow-sm">
            <Icon className="text-sm" aria-hidden />
          </span>
          {label ? <span className="text-xs font-bold uppercase tracking-wider text-[#2d3f5d]">{label}</span> : null}
        </div>
      ) : null}
      {children}
    </RevealWrap>
  )
}

/** Navy header strip + white body */
function CardSplitHeader({ index, icon: Icon, label, children, className = '' }) {
  return (
    <RevealWrap
      index={index}
      className={`group overflow-hidden rounded-2xl border border-[#2d3f5d]/15 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${className}`.trim()}
    >
      <div className="flex items-center gap-3 bg-gradient-to-r from-[#2d3f5d] to-[#1a2542] px-5 py-3.5 text-white">
        {Icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-[#faa853]">
            <Icon className="text-base" aria-hidden />
          </span>
        ) : null}
        {label ? <span className="text-xs font-black uppercase tracking-[0.16em] text-[#faa853]">{label}</span> : null}
      </div>
      <div className="border-t border-[#2d3f5d]/10 bg-white p-5 md:p-6">{children}</div>
    </RevealWrap>
  )
}

/** Left rail — use sparingly (matches course DNA) */
function CardRail({ index, icon: Icon, label, children, className = '' }) {
  return (
    <RevealWrap
      index={index}
      className={`group relative overflow-hidden rounded-2xl border border-[#2d3f5d]/10 bg-gradient-to-br from-white via-[#fcfdff] to-[#eef4fb] p-5 md:p-6 shadow-md transition-all duration-300 hover:border-[#faa853]/35 ${className}`.trim()}
    >
      <div
        className="pointer-events-none absolute inset-y-4 left-0 w-[3px] rounded-full bg-gradient-to-b from-[#faa853] via-[#f28c38] to-[#2d3f5d]"
        aria-hidden
      />
      <div className="relative pl-4 sm:pl-5">
        {Icon ? (
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2d3f5d] to-[#1a2542] text-[#faa853] shadow-md ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105">
              <Icon className="text-lg" aria-hidden />
            </span>
            {label ? (
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#faa853]">{label}</span>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </RevealWrap>
  )
}

function CardNavyQuote({ index, children, className = '' }) {
  return (
    <RevealWrap
      index={index}
      className={`relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#2d3f5d] via-[#263553] to-[#1a2542] p-6 md:p-8 text-white shadow-xl ring-1 ring-white/10 transition-all duration-300 hover:ring-[#faa853]/30 ${className}`.trim()}
    >
      <div
        className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-[#faa853]/10 blur-3xl"
        aria-hidden
      />
      <div className="relative border-l-2 border-[#faa853] pl-4">{children}</div>
    </RevealWrap>
  )
}

const whyVariants = [CardBlob, CardCap, CardDashed, CardWarm, CardStripeEdge, CardGlass]

export default function AboutAcademyProfile() {
  const [a1, a2, ...projectExamples] = STUDENT_SUCCESS.achievements

  return (
    <div className="space-y-8 md:space-y-10">
      <SectionShell
        id="profile-introduction"
        kicker="Programs"
        title="Our courses"
        sectionReveal={false}
        className="bg-gradient-to-br from-white via-[#f8fbff] to-[#fff8ef] shadow-md"
      >
        <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 md:mb-8 max-w-3xl">
          Structured tracks from digital foundations to advanced builds—each course blends guided lessons with
          hands-on projects.
        </p>
        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {CLIENT2_COURSES.map((course, index) => {
            const Icon = COURSE_CARD_ICONS[index] ?? FaLaptopCode
            return (
              <article
                key={course.title}
                data-reveal
                className={`group relative overflow-hidden rounded-2xl border border-[#2d3f5d]/10 bg-white/90 shadow-sm scroll-reveal transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#faa853]/35 hover:shadow-lg ${index % 2 === 0 ? 'scroll-reveal--left' : 'scroll-reveal--right'}`}
              >
                <div
                  className="pointer-events-none absolute inset-y-3 left-0 w-1 rounded-full bg-gradient-to-b from-[#faa853] via-[#f28c38] to-[#2d3f5d] opacity-90"
                  aria-hidden
                />
                <div className="relative p-5 md:p-6 pl-6 md:pl-7">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2d3f5d] to-[#1a2542] text-[#faa853] shadow-md ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg">
                      <Icon className="text-xl" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-lg bg-[#faa853]/15 px-2 text-xs font-black tabular-nums text-[#2d3f5d]">
                          {index + 1}
                        </span>
                        <h4 className="text-base md:text-lg font-bold text-[#2d3f5d] leading-snug">{course.title}</h4>
                      </div>
                      <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed">{course.text}</p>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </SectionShell>

      <SectionShell id="profile-overview" kicker="Overview" title="Founding & purpose" sectionReveal={false}>
        <div className="grid gap-5 md:grid-cols-2">
          <CardSplitHeader index={0} icon={FaSchool} label="Origins">
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              Established on {OVERVIEW_FACTS.foundedWhere.replace(' — ', ', in ')}, Anvil Coding Academy was born from
              a vision to {OVERVIEW_FACTS.visionShort.charAt(0).toLowerCase()}
              {OVERVIEW_FACTS.visionShort.slice(1)}
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed text-sm md:text-base">
              Founded by {OVERVIEW_FACTS.founders.charAt(0).toLowerCase()}
              {OVERVIEW_FACTS.founders.slice(1)}, the academy addresses Zambia’s digital skills gap by providing
              world-class programming education to students aged{' '}
              {OVERVIEW_FACTS.audience.replace(/^Students aged /i, '')}.
            </p>
          </CardSplitHeader>
          <CardBlob index={1} icon={FaRocket} label="Key milestones">
            <ul className="space-y-4">
              {MILESTONES.map((m) => (
                <li key={m.year} className="flex gap-3 border-b border-[#2d3f5d]/8 pb-3 last:border-0 last:pb-0">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#faa853] ring-2 ring-[#faa853]/30" />
                  <div>
                    <p className="font-bold text-[#2d3f5d] text-sm">{m.year}</p>
                    <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed mt-0.5">{m.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardBlob>
          <CardWarm index={2} icon={FaBookOpen} label="Campus & infrastructure" className="md:col-span-2">
            <p className="text-gray-700 mb-4 text-sm md:text-base">
              <span className="font-semibold text-[#2d3f5d]">{OVERVIEW_FACTS.facilitySqFt}</span> facility featuring:
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {OVERVIEW_FACTS.facilityPoints.map((pt) => (
                <li
                  key={pt}
                  className="flex gap-2 rounded-xl border border-[#2d3f5d]/10 bg-white/70 px-3 py-2.5 text-sm text-gray-600 shadow-sm"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2d3f5d]" aria-hidden />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </CardWarm>
        </div>
      </SectionShell>

      <SectionShell
        id="profile-mission"
        kicker="Mission, vision & core values"
        title="Mission & vision"
        sectionReveal={false}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <CardRail index={0} icon={FaLightbulb} label="Mission">
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">{MISSION_VISION_VALUES.mission}</p>
          </CardRail>
          <CardGlass index={1} icon={FaBolt} label="Vision">
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">{MISSION_VISION_VALUES.vision}</p>
          </CardGlass>
          <CardCap index={2} icon={FaAward} label="Core values" className="md:col-span-2">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MISSION_VISION_VALUES.values.map((v) => (
                <li
                  key={v.title}
                  className="rounded-xl border border-[#2d3f5d]/10 bg-[#f8fbff]/90 px-4 py-3 transition-colors hover:border-[#faa853]/40"
                >
                  <span className="font-bold text-[#faa853]">{v.title}</span>
                  <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{v.text}</p>
                </li>
              ))}
            </ul>
          </CardCap>
        </div>
      </SectionShell>

      <SectionShell id="profile-academic" kicker="Academic offerings" title="Signature programs" sectionReveal={false}>
        <div className="grid gap-5 md:grid-cols-3">
          {SIGNATURE_PROGRAMS.map((p, i) => {
            const V = [CardStripeEdge, CardWarm, CardBlob][i % 3]
            return (
              <V key={p.title} index={i} icon={FaChalkboardTeacher} label={p.title}>
                <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed">{p.text}</p>
              </V>
            )
          })}
        </div>
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-bold text-[#2d3f5d]">Program tracks by age</h3>
          <CardDashed index={4} icon={FaUsers} label="Age bands">
            <div className="overflow-x-auto rounded-xl border border-[#2d3f5d]/10 bg-white/90">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#2d3f5d] text-white">
                  <tr>
                    <th className="px-4 py-3 font-bold">Age band</th>
                    <th className="px-4 py-3 font-bold">Focus</th>
                    <th className="px-4 py-3 font-bold">Skills</th>
                  </tr>
                </thead>
                <tbody>
                  {ACADEMIC_OFFERINGS_TABLE.map((row) => (
                    <tr key={row.age} className="border-t border-gray-200">
                      <td className="px-4 py-3 font-semibold text-[#2d3f5d] whitespace-nowrap">{row.age}</td>
                      <td className="px-4 py-3 text-gray-700">{row.focus}</td>
                      <td className="px-4 py-3 text-gray-600">{row.skills}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardDashed>
        </div>
      </SectionShell>

      <SectionShell
        id="profile-differentiators"
        kicker="Unique differentiators"
        title={VALUE_DIFFERENTIATORS.headline}
        sectionReveal={false}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {VALUE_DIFFERENTIATORS.why.map((line, i) => {
            const V = whyVariants[i % whyVariants.length]
            return (
              <V key={line} index={i} icon={FaLightbulb}>
                <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed">{line}</p>
              </V>
            )
          })}
        </div>
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-bold text-[#2d3f5d]">{VALUE_DIFFERENTIATORS.trendsTitle}</h3>
          <CardSplitHeader index={VALUE_DIFFERENTIATORS.why.length} icon={FaBolt} label="Staying current">
            <ul className="space-y-3 text-gray-600 text-sm md:text-[15px]">
              {VALUE_DIFFERENTIATORS.trends.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-[#faa853] font-bold">→</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </CardSplitHeader>
        </div>
      </SectionShell>

      <SectionShell
        id="profile-faculty"
        kicker="Faculty & learning environment"
        title="Faculty excellence"
        sectionReveal={false}
      >
        <div className="grid gap-5 md:grid-cols-2">
          {FACULTY_AND_ENVIRONMENT.faculty.map((row, i) =>
            i === 0 ? (
              <CardCap key={row.label} index={i} icon={FaChalkboardTeacher} label={row.label}>
                <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed">{row.text}</p>
              </CardCap>
            ) : (
              <CardStripeEdge key={row.label} index={i} icon={FaChalkboardTeacher} label={row.label}>
                <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed">{row.text}</p>
              </CardStripeEdge>
            ),
          )}
        </div>
        <h3 className="mt-8 mb-4 text-lg font-bold text-[#2d3f5d]">State-of-the-art facilities</h3>
        <div className="grid gap-5 md:grid-cols-3">
          {FACULTY_AND_ENVIRONMENT.facilities.map((row, i) => {
            const V = [CardGlass, CardWarm, CardBlob][i % 3]
            return (
              <V key={row.label} index={i + 2} icon={FaSchool} label={row.label}>
                <p className="text-gray-600 text-sm leading-relaxed">{row.text}</p>
              </V>
            )
          })}
        </div>
      </SectionShell>

      <SectionShell
        id="profile-outcomes"
        kicker="Student success & outcomes"
        title={STUDENT_SUCCESS.achievementsTitle}
        sectionReveal={false}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <CardWarm index={0} icon={FaAward} label="Highlights">
            <ul className="space-y-2 text-gray-600 text-sm md:text-[15px]">
              <li>{a1}</li>
              <li>{a2}</li>
            </ul>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600 text-sm md:text-[15px]">
              {projectExamples.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </CardWarm>
          <CardRail index={1} icon={FaRocket} label={STUDENT_SUCCESS.progressTitle}>
            <ul className="space-y-3 text-gray-600 text-sm md:text-[15px]">
              {STUDENT_SUCCESS.progress.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-[#faa853] font-bold">·</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </CardRail>
        </div>
      </SectionShell>

      <SectionShell
        id="profile-community"
        kicker="Community engagement & partnerships"
        title="Partnerships"
        sectionReveal={false}
        className="bg-gradient-to-br from-white via-[#f8fbff] to-[#fff8ef]"
      >
        <CardGlass index={0} icon={FaHandshake} label="Together">
          <p className="text-gray-600 leading-relaxed text-sm md:text-base">
            Anvil Coding Academy proudly collaborates with leading educational and community organizations to amplify
            our impact.
          </p>
        </CardGlass>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {COMMUNITY_PARTNERSHIPS.map((p, i) => {
            const V = [CardCap, CardBlob, CardDashed, CardStripeEdge][i % 4]
            return (
              <V key={p.name} index={i + 1} icon={FaUsers} label={p.name}>
                <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed">{p.text}</p>
              </V>
            )
          })}
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <CardWarm index={COMMUNITY_PARTNERSHIPS.length + 1} icon={FaLightbulb} label="Shared objectives">
            <ul className="list-disc space-y-2 pl-5 text-gray-600 text-sm md:text-[15px]">
              {PARTNERSHIP_OBJECTIVES.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </CardWarm>
          <CardNavyQuote index={COMMUNITY_PARTNERSHIPS.length + 2}>
            <p className="text-sm md:text-base leading-relaxed text-white/90">{COMMUNITY_PARTNERSHIPS_CLOSING}</p>
          </CardNavyQuote>
        </div>
      </SectionShell>
    </div>
  )
}

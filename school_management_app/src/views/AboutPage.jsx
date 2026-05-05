import { FaArrowLeft, FaBullseye, FaEye, FaCheckCircle } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { SCHOOL_PROFILE, MISSION_VISION_VALUES, WHY_CHOOSE_ANVIL, OVERVIEW_FACTS } from '../content/siteProfile'
import { SCHOOL_MEDIA_IMAGES } from '../content/schoolMedia'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#2d3f5d] to-[#1a2542] text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
            <FaArrowLeft className="text-sm" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-black mb-4 animate-fade-in-up">About Us</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl animate-fade-in-up animation-delay-200">
            Learn more about {SCHOOL_PROFILE.name}, our mission, and the learning environment we are building for students.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-8">
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <img src={SCHOOL_MEDIA_IMAGES.hero} alt="Students learning at Anvil Coding Academy" className="w-full h-full object-cover min-h-[260px]" />
            <div className="p-6 md:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#faa853] mb-3">Who We Are</p>
              <h2 className="text-2xl md:text-3xl font-black text-[#2d3f5d] mb-4">{SCHOOL_PROFILE.name}</h2>
              <p className="text-gray-600 leading-relaxed mb-4">{SCHOOL_PROFILE.aboutLead}</p>
              <p className="text-gray-600 leading-relaxed">{SCHOOL_PROFILE.aboutBody}</p>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <article className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-[#2d3f5d]/10">
            <div className="w-12 h-12 rounded-full bg-[#faa853]/15 text-[#faa853] flex items-center justify-center mb-4">
              <FaBullseye />
            </div>
            <h3 className="text-2xl font-black text-[#2d3f5d] mb-3">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">{MISSION_VISION_VALUES.mission}</p>
          </article>

          <article className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-[#2d3f5d]/10">
            <div className="w-12 h-12 rounded-full bg-[#faa853]/15 text-[#faa853] flex items-center justify-center mb-4">
              <FaEye />
            </div>
            <h3 className="text-2xl font-black text-[#2d3f5d] mb-3">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed">{MISSION_VISION_VALUES.vision}</p>
          </article>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h3 className="text-2xl md:text-3xl font-black text-[#2d3f5d] mb-6">Why Families Choose Us</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {WHY_CHOOSE_ANVIL.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl bg-[#f8fafc] p-4">
                <FaCheckCircle className="text-[#faa853] mt-0.5" />
                <p className="text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h3 className="text-2xl md:text-3xl font-black text-[#2d3f5d] mb-6">At A Glance</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-xs uppercase tracking-wider text-[#faa853] font-bold">Founded</p>
              <p className="text-[#2d3f5d] font-semibold mt-1">{OVERVIEW_FACTS.foundedWhere}</p>
            </div>
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-xs uppercase tracking-wider text-[#faa853] font-bold">Audience</p>
              <p className="text-[#2d3f5d] font-semibold mt-1">{OVERVIEW_FACTS.audience}</p>
            </div>
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-xs uppercase tracking-wider text-[#faa853] font-bold">Facility</p>
              <p className="text-[#2d3f5d] font-semibold mt-1">{OVERVIEW_FACTS.facilitySqFt}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

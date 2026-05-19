import { forwardRef, useState } from 'react'
import { MdOutlineEmail, MdPhone, MdLocationOn, MdKeyboardArrowDown } from 'react-icons/md'
import { useLandingSiteContent } from '../../hooks/useLandingSiteContent'
import { SCHOOL_PROFILE } from '../../content/siteProfile'

const Contact = forwardRef((_, ref) => {
  const [interestMenuOpen, setInterestMenuOpen] = useState(false)
  const [selectedInterest, setSelectedInterest] = useState('')
  const { data: site } = useLandingSiteContent()

  const email = site.contact_email_display?.trim() || SCHOOL_PROFILE.contact.email
  const phoneLabel = site.contact_phone_display?.trim() || SCHOOL_PROFILE.contact.phone
  const phoneDigits = phoneLabel.replace(/\D/g, '')
  const telHref = phoneDigits ? (phoneDigits.startsWith('260') ? `tel:+${phoneDigits}` : `tel:${phoneDigits}`) : `tel:${SCHOOL_PROFILE.contact.phone.replace(/\D/g, '')}`

  const interestOptions = [
    'Events',
    'Director',
    'Administrator',
    'Partnerships',
    'Job Interviews',
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Thanks! We will contact you shortly.')
  }

  return (
    <section id="contact" ref={ref} className="py-16 md:py-24 bg-[#faa853]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div data-reveal className="text-white text-base scroll-reveal scroll-reveal--left">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Ready to Start?</h2>
            <p className="text-base leading-relaxed text-white/90 mb-8 max-w-xl">
              Join us in shaping the next generation of tech innovators. Limited spots available!
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 group hover:translate-x-2 transition-transform">
                <MdOutlineEmail className="text-2xl" />
                <a href={`mailto:${encodeURIComponent(email)}`} className="text-base underline-offset-4 hover:underline">
                  {email}
                </a>
              </div>
              <div className="flex items-center gap-3 group hover:translate-x-2 transition-transform">
                <MdPhone className="text-2xl" />
                <a href={telHref} className="text-base underline-offset-4 hover:underline">
                  {phoneLabel}
                </a>
              </div>
              <div className="flex items-center gap-3 group hover:translate-x-2 transition-transform">
                <MdLocationOn className="text-2xl" />
                <a
                  href="https://maps.google.com/?q=Ibex+hill+American+embassy+road%2C+plot+100%2F735%2C+Lusaka%2C+Zambia"
                  target="_blank"
                  rel="noreferrer"
                  className="text-base underline-offset-4 hover:underline"
                >
                  Ibex hill American embassy road, plot 100/735, Lusaka, Zambia
                </a>
              </div>
              <div className="flex items-center gap-3 group hover:translate-x-2 transition-transform">
                <MdOutlineEmail className="text-2xl" />
                <a
                  href="https://instagram.com/anvilcodingschool"
                  target="_blank"
                  rel="noreferrer"
                  className="text-base underline-offset-4 hover:underline"
                >
                  anvilcodingschool
                </a>
              </div>
            </div>
          </div>

          <div data-reveal className="bg-white rounded-2xl p-6 md:p-8 shadow-xl scroll-reveal scroll-reveal--right">
            <h3 className="text-xl md:text-2xl font-bold text-[#2d3f5d] mb-4">Book an Appointment</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-base">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#faa853] transition-all"
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#faa853] transition-all"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#faa853] transition-all"
                required
              />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setInterestMenuOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-[#1f3157] text-white font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-[#faa853] transition-all"
                >
                  <span>{selectedInterest || 'Area of Interest'}</span>
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <MdKeyboardArrowDown
                      className={`text-2xl text-[#faa853] transition-transform ${interestMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </span>
                </button>

                {interestMenuOpen && (
                  <div className="absolute z-20 mt-2 w-full rounded-2xl border border-gray-200 bg-[#f7f7f9] shadow-xl p-3">
                    <p className="text-base font-semibold text-gray-500 mb-2 px-1">Choose what to view</p>
                    <div className="grid grid-cols-2 gap-2">
                      {interestOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setSelectedInterest(option)
                            setInterestMenuOpen(false)
                          }}
                          className={`w-full text-center px-3 py-2.5 rounded-xl text-base font-semibold transition-colors ${selectedInterest === option
                              ? 'bg-[#f2a24b] text-white'
                              : 'bg-[#e8e9ed] text-[#2d3f5d] hover:bg-[#dfe1e7]'
                            }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#faa853] text-white font-semibold hover:bg-[#faa853]/90 transition-all"
              >
                Schedule Consultation
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
})

Contact.displayName = 'Contact'
export default Contact
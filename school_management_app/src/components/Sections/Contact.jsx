import { forwardRef } from 'react'
import { MdOutlineEmail, MdPhone, MdLocationOn } from 'react-icons/md'

const Contact = forwardRef((_, ref) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Thanks! We will contact you shortly.')
  }

  return (
    <section id="contact" ref={ref} className="py-16 md:py-24 bg-[#faa853]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="text-white animate-fade-in-left">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Ready to Start?</h2>
            <p className="text-base md:text-lg text-white/90 mb-8">
              Join us in shaping the next generation of tech innovators. Limited spots available!
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 group hover:translate-x-2 transition-transform">
                <MdOutlineEmail className="text-2xl" />
                <a href="mailto:admission@anvilcodingacademy.com" className="underline-offset-4 hover:underline">
                  admission@anvilcodingacademy.com
                </a>
              </div>
              <div className="flex items-center gap-3 group hover:translate-x-2 transition-transform">
                <MdPhone className="text-2xl" />
                <a href="tel:773823113" className="underline-offset-4 hover:underline">
                  773823113
                </a>
              </div>
              <div className="flex items-center gap-3 group hover:translate-x-2 transition-transform">
                <MdLocationOn className="text-2xl" />
                <a
                  href="https://maps.google.com/?q=Ibex+hill+American+embassy+road%2C+plot+100%2F735%2C+Lusaka%2C+Zambia"
                  target="_blank"
                  rel="noreferrer"
                  className="underline-offset-4 hover:underline"
                >
                  Ibex hill American embassy road, plot 100/735, Lusaka, Zambia
                </a>
              </div>
              <div className="flex items-center gap-3 group hover:translate-x-2 transition-transform">
                <MdPhone className="text-2xl" />
                <a href="tel:+260773823113" className="underline-offset-4 hover:underline">
                  +260 773823113
                </a>
              </div>
              <div className="flex items-center gap-3 group hover:translate-x-2 transition-transform">
                <MdOutlineEmail className="text-2xl" />
                <a
                  href="https://instagram.com/anvilcodingschool"
                  target="_blank"
                  rel="noreferrer"
                  className="underline-offset-4 hover:underline"
                >
                  anvilcodingschool
                </a>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl animate-fade-in-right">
            <h3 className="text-xl md:text-2xl font-bold text-[#2d3f5d] mb-4">Book an Appointment</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#faa853] transition-all">
                <option>Select Program Interest</option>
                <option>Digital Literacy</option>
                <option>Python Programming</option>
                <option>Robotics</option>
                <option>Web Development</option>
                <option>Game Design</option>
              </select>
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
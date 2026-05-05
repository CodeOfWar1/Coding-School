import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'

export default function Footer() {
  const openExternal = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <footer className="bg-[#2d3f5d] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-black mb-4">Anvil<span className="text-[#faa853]">Coding</span>Acardemy</h3>
            <p className="text-gray-300 text-sm">Empowering the next generation of tech innovators through quality education.</p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#home" className="hover:text-[#faa853] transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-[#faa853] transition-colors">About</a></li>
              <li><a href="#classes" className="hover:text-[#faa853] transition-colors">Classes</a></li>
              <li><a href="#contact" className="hover:text-[#faa853] transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a
                  href="https://maps.google.com/?q=Ibex+hill+American+embassy+road%2C+plot+100%2F735%2C+Lusaka%2C+Zambia"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#faa853] transition-colors"
                >
                  Ibex hill American embassy road, plot 100/735, Lusaka, Zambia
                </a>
              </li>
              <li><a href="tel:773823113" className="hover:text-[#faa853] transition-colors">773823113</a></li>
              <li><a href="tel:+260773823113" className="hover:text-[#faa853] transition-colors">+260 773823113</a></li>
              <li><a href="mailto:admission@anvilcodingacademy.com" className="hover:text-[#faa853] transition-colors">admission@anvilcodingacademy.com</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => openExternal('https://www.facebook.com/team334/')}
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#faa853] transition-all cursor-pointer"
              >
                <FaFacebook />
              </button>
              <button
                type="button"
                onClick={() => openExternal('https://x.com/anvilcodingschool')}
                aria-label="X (Twitter)"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#faa853] transition-all cursor-pointer"
              >
                <FaTwitter />
              </button>
              <button
                type="button"
                onClick={() => openExternal('https://instagram.com/anvilcodingschool')}
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#faa853] transition-all cursor-pointer"
              >
                <FaInstagram />
              </button>
              <button
                type="button"
                onClick={() => openExternal('https://www.linkedin.com/company/anvilcodingschool')}
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#faa853] transition-all cursor-pointer"
              >
                <FaLinkedin />
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-gray-300">
          <p>&copy; 2024 AnvilCoding Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
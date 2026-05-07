import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-secondary text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-black mb-4">Anvil<span className="text-primary">Coding</span>Acardemy</h3>
            <p className="text-gray-300 text-base">Empowering the next generation of tech innovators through quality education.</p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-base text-gray-300">
              <li><a href="#home" className="hover:text-primary transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-primary transition-colors">About</a></li>
              <li><a href="#classes" className="hover:text-primary transition-colors">Classes</a></li>
              <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-base text-gray-300">
              <li>
                <a
                  href="https://maps.google.com/?q=Ibex+hill+American+embassy+road%2C+plot+100%2F735%2C+Lusaka%2C+Zambia"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Ibex hill American embassy road, plot 100/735, Lusaka, Zambia
                </a>
              </li>
              <li><a href="tel:773823113" className="hover:text-primary transition-colors">773823113</a></li>
              <li><a href="tel:+260773823113" className="hover:text-primary transition-colors">+260 773823113</a></li>
              <li><a href="mailto:admission@anvilcodingacademy.com" className="hover:text-primary transition-colors">admission@anvilcodingacademy.com</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/team334/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-all cursor-pointer"
              >
                <FaFacebook />
              </a>
              <a
                href="https://x.com/anvilcodingschool"
                target="_blank"
                rel="noreferrer"
                aria-label="X (Twitter)"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-all cursor-pointer"
              >
                <FaTwitter />
              </a>
              <a
                href="https://instagram.com/anvilcodingschool"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-all cursor-pointer"
              >
                <FaInstagram />
              </a>
              <a
                href="https://www.linkedin.com/company/anvilcodingschool"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-all cursor-pointer"
              >
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-base text-gray-300">
          <p>&copy; 2024 AnvilCoding Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
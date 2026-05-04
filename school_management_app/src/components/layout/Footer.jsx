import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'

export default function Footer() {
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
              <li>Lusaka, Zambia</li>
              <li>+260 123 456 789</li>
              <li>info@anvilcodind.com</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#faa853] transition-all">
                <FaFacebook />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#faa853] transition-all">
                <FaTwitter />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#faa853] transition-all">
                <FaInstagram />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#faa853] transition-all">
                <FaLinkedin />
              </a>
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
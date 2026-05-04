import { useState } from 'react'
import { FaStar, FaQuoteLeft } from 'react-icons/fa'

const INITIAL_TESTIMONIALS = [
  {
    name: 'Sarah Johnson',
    role: 'Parent',
    text: 'Clear progress tracking and supportive tutors. My child is excited to learn every single day.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'Student',
    text: 'I built my first game and learned how to debug. Now I want to build more and pursue a career in tech.',
    rating: 5
  },
  {
    name: 'David Rodriguez',
    role: 'Guardian',
    text: 'Great environment and practical learning. The portfolio projects my child has created are truly impressive.',
    rating: 5
  },
]

export default function Testimonials() {
  const [feedbackList, setFeedbackList] = useState(INITIAL_TESTIMONIALS)
  const [feedbackForm, setFeedbackForm] = useState({ name: '', message: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    const name = feedbackForm.name.trim()
    const message = feedbackForm.message.trim()
    if (!name || !message) return
    setFeedbackList((prev) => [{ name, role: 'Parent', text: message, rating: 5 }, ...prev].slice(0, 8))
    setFeedbackForm({ name: '', message: '' })
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#faa853] mb-3 animate-fade-in">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-[#2d3f5d] mb-4 animate-slide-in-up">
            What Our Community Says
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in animation-delay-200">
            Real stories from parents, students, and guardians
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12">
          {feedbackList.map((testimonial, idx) => (
            <div
              key={idx}
              className="bg-gray-50 rounded-2xl p-6 md:p-8 transition-all duration-500 hover:-translate-y-2 animate-fade-in-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <FaQuoteLeft className="text-3xl text-[#faa853]/30 mb-4" />
              <p className="text-gray-600 leading-relaxed mb-4 italic">"{testimonial.text}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#2d3f5d]">{testimonial.name}</p>
                  <p className="text-sm text-[#faa853]">{testimonial.role}</p>
                </div>
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-[#faa853] text-sm" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto bg-gray-50 rounded-2xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-[#2d3f5d] mb-4 text-center">Share Your Experience</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={feedbackForm.name}
              onChange={(e) => setFeedbackForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#faa853] transition-all"
              required
            />
            <textarea
              placeholder="Share your experience..."
              rows="3"
              value={feedbackForm.message}
              onChange={(e) => setFeedbackForm(p => ({ ...p, message: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#faa853] transition-all"
              required
            />
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-[#faa853] text-white font-semibold hover:bg-[#faa853]/90 transition-all"
            >
              Submit Feedback
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
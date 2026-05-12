export default function AboutClosingSections() {
  return (
    <section
      data-reveal
      className="bg-gradient-to-br from-[#2d3f5d] via-[#263553] to-[#1a2542] rounded-2xl shadow-sm p-6 md:p-8 scroll-reveal"
    >
      <h3 className="text-2xl md:text-3xl font-black text-white mb-4">Our online community</h3>
      <p className="text-white/85 leading-relaxed mb-5">
        Beyond the classroom, Anvil Coding Academy nurtures an active online community where learners stay connected,
        share ideas, and continue building together.
      </p>
      <div className="grid md:grid-cols-3 gap-3">
        <div className="rounded-xl bg-white/10 border border-white/15 p-4">
          <p className="text-[#faa853] font-bold text-sm mb-1">Peer collaboration</p>
          <p className="text-white/85 text-sm">
            Students ask questions, exchange tips, and solve challenges together in a supportive digital space.
          </p>
        </div>
        <div className="rounded-xl bg-white/10 border border-white/15 p-4">
          <p className="text-[#faa853] font-bold text-sm mb-1">Showcase culture</p>
          <p className="text-white/85 text-sm">
            Learners present projects online, receive feedback, and celebrate wins as a community.
          </p>
        </div>
        <div className="rounded-xl bg-white/10 border border-white/15 p-4">
          <p className="text-[#faa853] font-bold text-sm mb-1">Continuous growth</p>
          <p className="text-white/85 text-sm">
            The online community keeps students engaged between sessions and encourages lifelong learning habits.
          </p>
        </div>
      </div>
    </section>
  )
}

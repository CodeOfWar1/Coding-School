export default function StatCards({ cards }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <div key={c.title} className={`rounded p-4 text-white ${c.color}`}>
          <p className="text-4xl font-bold">{c.value}</p>
          <p className="text-sm">{c.title}</p>
        </div>
      ))}
    </div>
  )
}


const COLORS = {
  active: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-700',
  completed: 'bg-blue-100 text-blue-700',
  archived: 'bg-yellow-100 text-yellow-800',
}

export default function StatusBadge({ status }) {
  const cls = COLORS[status] ?? 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize ${cls}`}>
      {status ?? 'unknown'}
    </span>
  )
}
export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString() : '—'

export const formatDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString() : '—'

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '—'
  return `K${Number(amount).toFixed(2)}`
}

export function Row({ label, value }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-medium text-[#2d3f5d] break-words">{value}</p>
    </div>
  )
}

export default Row
export default function TeacherSectionPicker({
  sections,
  selectedSectionId,
  onSelect,
  label = 'Active class',
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-[#2d3f5d] mb-1">{label}</label>
      <select
        value={selectedSectionId || ''}
        onChange={(e) => onSelect(e.target.value || null)}
        className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#faa853] focus:ring-2 focus:ring-[#faa853]/25 outline-none"
      >
        <option value="">Select a class…</option>
        {sections.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
            {s.course?.course_name ? ` — ${s.course.course_name}` : ''}
          </option>
        ))}
      </select>
    </div>
  )
}

import { FaBook, FaUsers, FaClipboardList, FaPen } from 'react-icons/fa'

export default function TeacherOverview({ stats, onNavigate }) {
  const cards = [
    {
      label: 'Assigned classes',
      value: stats.classCount,
      icon: <FaBook className="text-2xl text-[#faa853]" />,
      action: () => onNavigate('classes'),
    },
    {
      label: 'Pupils in class',
      value: stats.pupilCount,
      icon: <FaUsers className="text-2xl text-[#faa853]" />,
      action: () => onNavigate('roster'),
    },
    {
      label: 'Assignments',
      value: stats.taskCount,
      icon: <FaClipboardList className="text-2xl text-[#faa853]" />,
      action: () => onNavigate('tasks'),
    },
    {
      label: 'Awaiting grades',
      value: stats.pendingGrades,
      icon: <FaPen className="text-2xl text-amber-600" />,
      action: () => onNavigate('grading'),
    },
  ]

  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-sm">
        View admin-assigned classes and pupils, create coding tasks with points and pass/fail grading.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={card.action}
            className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-[#faa853]/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">{card.icon}</div>
            <p className="text-2xl font-bold text-[#2d3f5d]">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

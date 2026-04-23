/** Distinct visual identity per role — used in admin Users & elsewhere. */
export const ROLE_META = {
  student: {
    label: 'Students',
    singular: 'Student',
    description: 'Course access, assignments, grades',
    chip: 'border-blue-300/80 bg-blue-50 text-blue-950 ring-blue-500/25',
    row: 'border-l-4 border-l-blue-500 bg-blue-50/35',
    header: 'from-blue-600 to-blue-700',
    dot: 'bg-blue-500',
    pie: '#2563eb',
  },
  parent: {
    label: 'Parents',
    singular: 'Parent',
    description: 'Child progress, payments, receipts',
    chip: 'border-emerald-300/80 bg-emerald-50 text-emerald-950 ring-emerald-500/25',
    row: 'border-l-4 border-l-emerald-500 bg-emerald-50/35',
    header: 'from-emerald-600 to-emerald-700',
    dot: 'bg-emerald-500',
    pie: '#059669',
  },
  finance: {
    label: 'Finance',
    singular: 'Finance',
    description: 'Payments, verification, reporting',
    chip: 'border-amber-300/80 bg-amber-50 text-amber-950 ring-amber-500/25',
    row: 'border-l-4 border-l-amber-500 bg-amber-50/35',
    header: 'from-amber-500 to-amber-600',
    dot: 'bg-amber-500',
    pie: '#d97706',
  },
  admin: {
    label: 'Administrators',
    singular: 'Admin',
    description: 'Users, tasks, grading, system content',
    chip: 'border-violet-300/80 bg-violet-50 text-violet-950 ring-violet-500/25',
    row: 'border-l-4 border-l-violet-500 bg-violet-50/35',
    header: 'from-violet-600 to-violet-700',
    dot: 'bg-violet-500',
    pie: '#7c3aed',
  },
}

export const ROLE_ORDER = ['admin', 'finance', 'student', 'parent']

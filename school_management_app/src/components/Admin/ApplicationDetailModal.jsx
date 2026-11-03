import { useState } from 'react'
import {
  FaBook,
  FaTimes,
  FaUserCheck,
  FaTimesCircle,
  FaUser,
  FaEnvelope,
  FaWallet,
  FaHistory,
} from 'react-icons/fa'

const TABS = [
  { key: 'child', label: 'Child info', icon: <FaUser /> },
  { key: 'parent', label: 'Parent info', icon: <FaUser /> },
  { key: 'course', label: 'Course applied for', icon: <FaBook /> },
  { key: 'payments', label: 'Payments history', icon: <FaWallet /> },
]

/* ---------- Shared row renderer ---------- */

function Row({ label, value }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="flex items-start gap-2">
      <div className="w-full">
        <p className="text-gray-500">{label}</p>
        <p className="font-medium text-[#2d3f5d] break-words">{value}</p>
      </div>
    </div>
  )
}

function ProfileGrid({ profile, heading }) {
  if (!profile) {
    return <p className="text-sm text-gray-500">No record found.</p>
  }

  const {
    full_name,
    first_name,
    last_name,
    email,
    phone,
    role,
    date_of_birth,
    gender,
    home_address,
    bio,
    avatar_url,
    emergency_contact_name,
    emergency_contact_phone,
    can_use_photos,
    created_at,
    updated_at,
  } = profile

  const displayName =
    full_name?.trim() ||
    [first_name, last_name].filter(Boolean).join(' ').trim() ||
    null

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-[#2d3f5d] mb-4 flex items-center gap-2">
        <FaUser className="text-[#faa853]" />
        {heading}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <Row label="Full name" value={displayName} />
        <Row label="First name" value={first_name} />
        <Row label="Last name" value={last_name} />
        <Row label="Email" value={email} />
        <Row label="Phone" value={phone} />
        <Row label="Role" value={role} />
        <Row label="Gender" value={gender} />
        <Row
          label="Date of birth"
          value={date_of_birth ? new Date(date_of_birth).toLocaleDateString() : null}
        />
        <Row label="Home address" value={home_address} />
        <Row label="Bio" value={bio} />
        <Row label="Avatar URL" value={avatar_url} />
        <Row label="Emergency contact name" value={emergency_contact_name} />
        <Row label="Emergency contact phone" value={emergency_contact_phone} />
        <Row
          label="Can use photos"
          value={can_use_photos === null || can_use_photos === undefined
            ? null
            : can_use_photos ? 'Yes' : 'No'}
        />
        <Row
          label="Created at"
          value={created_at ? new Date(created_at).toLocaleString() : null}
        />
        <Row
          label="Updated at"
          value={updated_at ? new Date(updated_at).toLocaleString() : null}
        />
      </div>
    </div>
  )
}

function ChildInfo({ app }) {
  return <ProfileGrid profile={app.child} heading="Child Information" />
}

function ParentInfo({ app }) {
  return <ProfileGrid profile={app.parent} heading="Parent Information" />
}

function CourseInfo({ app }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-[#2d3f5d] mb-4 flex items-center gap-2">
        <FaBook className="text-[#faa853]" />
        Course Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Course:</span>{' '}
          <span className="font-medium text-[#2d3f5d]">{app.course?.course_name}</span>
        </div>
        <div>
          <span className="text-gray-500">Lesson Type:</span>{' '}
          <span className="font-medium text-[#2d3f5d] capitalize">
            {app.lesson_type?.replace('_', ' ')}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Payment Plan:</span>{' '}
          <span className="font-medium text-[#2d3f5d]">{app.payment_plan}</span>
        </div>
        <div>
          <span className="text-gray-500">Total Fee:</span>{' '}
          <span className="font-medium text-[#faa853]">K{app.course?.tuition_fee}</span>
        </div>
      </div>
    </div>
  )
}

function PaymentsInfo({ app, payments }) {
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalFee = app?.course?.tuition_fee || 0
  const remaining = totalFee - totalPaid

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-[#2d3f5d] mb-4 flex items-center gap-2">
          <FaWallet className="text-[#faa853]" />
          Payment Summary
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Paid</span>
            <span className="font-semibold text-green-600">K{totalPaid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Remaining Balance</span>
            <span className={`font-semibold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
              K{remaining.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {payments.length > 0 && (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <h3 className="font-semibold p-4 bg-gray-50 border-b flex items-center gap-2">
            <FaHistory className="text-[#faa853]" />
            Payment History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-600">Date</th>
                  <th className="px-4 py-2 text-left text-gray-600">Amount</th>
                  <th className="px-4 py-2 text-left text-gray-600">Method</th>
                  <th className="px-4 py-2 text-left text-gray-600">Reference</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-600">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-green-600 font-medium">
                      K{p.amount?.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-gray-600 capitalize">{p.payment_method}</td>
                    <td className="px-4 py-2 text-gray-500 text-xs">{p.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- Modal shell ---------- */

export default function ApplicationDetailModal({
  app,
  payments,
  processingId,
  onClose,
  onApprove,
  onReject,
}) {
  const [tab, setTab] = useState('child')

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-5 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#faa853]/10 flex items-center justify-center">
                <FaBook className="text-[#faa853] text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#2d3f5d]">Application Details</h2>
                <p className="text-sm text-gray-500">{app.course?.course_name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-5 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                tab === t.key
                  ? 'border-[#faa853] text-[#faa853]'
                  : 'border-transparent text-gray-500 hover:text-[#2d3f5d]'
              }`}
            >
              <span className="text-xs">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-5">
          {tab === 'child' && <ChildInfo app={app} />}
          {tab === 'parent' && <ParentInfo app={app} />}
          {tab === 'course' && <CourseInfo app={app} />}
          {tab === 'payments' && <PaymentsInfo app={app} payments={payments} />}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-5">
          {app.status === 'awaiting_approval' && (
            <>
              <button
                onClick={() => onApprove(app)}
                disabled={processingId === app.id}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaUserCheck /> Approve Application
              </button>
              <button
                onClick={() => onReject(app)}
                disabled={processingId === app.id}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaTimesCircle /> Reject Application
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-[#2d3f5d] rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
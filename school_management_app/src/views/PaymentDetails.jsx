import { useCallback, useEffect, useState } from 'react'
import {
  FaArrowLeft,
  FaSpinner,
  FaReceipt,
  FaUser,
  FaBook,
  FaClock,
  FaMoneyBillWave,
} from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import PaymentReceipt from './PaymentReciept'

function money(n) {
  return `K${Number(n || 0).toFixed(2)}`
}

function date(iso) {
  return iso ? new Date(iso).toLocaleString() : '—'
}

export default function PaymentDetail({ paymentId, onBack }) {
  const [payment, setPayment] = useState(null)
  const [siblings, setSiblings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const { data: p, error: pErr } = await supabase
        .from('payments')
        .select(`
          *,
          course:course_id (id, course_name, course_code, tuition_fee),
          application:application_id (
            id, course_id, child_id,
            child:child_id (id, full_name, first_name, last_name, email)
          )
        `)
        .eq('id', paymentId)
        .single()
      if (pErr) throw pErr
      setPayment(p)

      if (p?.application_id) {
        const { data } = await supabase
          .from('payments')
          .select('id, amount, created_at, status, reference')
          .eq('application_id', p.application_id)
          .order('created_at', { ascending: false })
        setSiblings(data || [])
      }
    } catch (e) {
      console.error('[ParentPaymentDetail] load failed:', e)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [paymentId])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <FaSpinner className="animate-spin text-[#faa853] text-3xl" />
      </div>
    )
  }

  if (error || !payment) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-sm text-red-700">
        Could not load payment.{' '}
        <button onClick={onBack} className="underline">
          Back
        </button>
      </div>
    )
  }

  const course = payment.course
  const child = payment.application?.child
  const tuition = Number(course?.tuition_fee || 0)
  const paidForCourse = siblings
    .filter((x) => x.status !== 'failed' && x.status !== 'cancelled')
    .reduce((s, x) => s + Number(x.amount || 0), 0)
  const balance = Math.max(tuition - paidForCourse, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <FaArrowLeft />
          </button>
          <div>
            <p className="text-xs text-gray-500">Payment</p>
            <h1 className="text-xl font-semibold text-[#2d3f5d]">
              {money(payment.amount)}
            </h1>
          </div>
        </div>
        <button
          onClick={() => setShowReceipt(true)}
          className="px-4 py-2 bg-[#faa853] text-white rounded-lg text-sm font-medium hover:bg-[#e89235] flex items-center gap-2"
        >
          <FaReceipt /> Download receipt
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">Tuition</p>
          <p className="text-lg font-semibold text-[#2d3f5d]">
            {money(tuition)}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">Total paid</p>
          <p className="text-lg font-semibold text-green-700">
            {money(paidForCourse)}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">Remaining balance</p>
          <p
            className={`text-lg font-semibold ${
              balance > 0 ? 'text-red-600' : 'text-green-700'
            }`}
          >
            {money(balance)}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Section title="Student" icon={<FaUser className="text-[#faa853]" />}>
            <p className="font-medium text-[#2d3f5d]">
              {child?.full_name ||
                `${child?.first_name ?? ''} ${
                  child?.last_name ?? ''
                }`.trim() ||
                '—'}
            </p>
            {child?.email && (
              <p className="text-sm text-gray-600">{child.email}</p>
            )}
          </Section>

          <Section title="Course" icon={<FaBook className="text-[#faa853]" />}>
            <p className="font-medium text-[#2d3f5d]">
              {course?.course_name || '—'}
            </p>
            <p className="text-sm text-gray-500">{course?.course_code}</p>
          </Section>

          <Section
            title="Payment"
            icon={<FaMoneyBillWave className="text-[#faa853]" />}
          >
            <p className="text-sm text-gray-600">
              <span className="text-gray-500">Reference:</span>{' '}
              {payment.reference || '—'}
            </p>
            <p className="text-sm text-gray-600">
              <span className="text-gray-500">Method:</span>{' '}
              {payment.payment_method || '—'}
            </p>
            <p className="text-sm text-gray-600">
              <span className="text-gray-500">Plan:</span>{' '}
              {payment.payment_plan || '—'}
            </p>
            <p className="text-sm text-gray-600">
              <span className="text-gray-500">Status:</span>{' '}
              <span className="capitalize">{payment.status || '—'}</span>
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <FaClock className="text-xs text-gray-400" />
              {date(payment.created_at)}
            </p>
          </Section>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
          <p className="text-sm font-semibold text-[#2d3f5d]">
            Payments for this course ({siblings.length})
          </p>
        </div>
        {siblings.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No other payments.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {siblings.map((x) => (
              <li
                key={x.id}
                className={`px-4 py-2 flex items-center justify-between text-sm ${
                  x.id === payment.id ? 'bg-[#faa853]/5' : ''
                }`}
              >
                <div>
                  <p className="font-medium text-[#2d3f5d]">
                    {money(x.amount)}
                    {x.id === payment.id && (
                      <span className="ml-2 text-xs text-[#faa853]">
                        (this payment)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">{date(x.created_at)}</p>
                </div>
                <span className="text-xs text-gray-500 capitalize">
                  {x.status || '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showReceipt && (
        <PaymentReceipt
          payment={payment}
          course={course}
          parent={null}
          child={child}
          tuition={tuition}
          paidForCourse={paidForCourse}
          balance={balance}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  )
}

function Section({ title, icon, children }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1">
        {icon} {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  )
}
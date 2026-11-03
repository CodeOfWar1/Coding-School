import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FaMoneyBillWave,
  FaSpinner,
  FaSearch,
  FaArrowRight,
} from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import PaymentDetail from './PaymentDetails'

function money(n) {
  return `K${Number(n || 0).toFixed(2)}`
}

function formatDate(iso) {
  return iso ? new Date(iso).toLocaleDateString() : '—'
}

export default function ParentPayments() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [search, setSearch] = useState('')
  const [openPaymentId, setOpenPaymentId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('not-signed-in')

      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          course:course_id (id, course_name, course_code, tuition_fee),
          application:application_id (
            id, child_id,
            child:child_id (id, full_name, first_name, last_name, email)
          )
        `)
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setRows(data || [])
    } catch (e) {
      console.error('[ParentPayments] load failed:', e)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter((p) => {
      const child = p.application?.child
      const course = p.course
      return [
        child?.full_name,
        child?.first_name,
        child?.last_name,
        course?.course_name,
        course?.course_code,
        p.reference,
        p.transaction_id,
      ]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    })
  }, [rows, search])

  // Group by application (per child + course) to compute balance
  const balanceSummary = useMemo(() => {
    const map = new Map()
    for (const p of rows) {
      const appId = p.application_id
      if (!appId) continue
      const app = p.application
      const course = p.course
      const key = appId
      if (!map.has(key)) {
        map.set(key, {
          applicationId: appId,
          child: app?.child,
          course,
          tuition: Number(course?.tuition_fee || 0),
          paid: 0,
        })
      }
      const bucket = map.get(key)
      if (p.status !== 'failed' && p.status !== 'cancelled') {
        bucket.paid += Number(p.amount || 0)
      }
    }
    return [...map.values()]
      .map((b) => ({ ...b, balance: Math.max(b.tuition - b.paid, 0) }))
      .sort((a, b) => b.balance - a.balance)
  }, [rows])

  if (openPaymentId) {
    return (
      <PaymentDetail
        paymentId={openPaymentId}
        onBack={() => {
          setOpenPaymentId(null)
          load()
        }}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <FaSpinner className="animate-spin text-[#faa853] text-3xl" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-sm text-red-700">
        Could not load your payments.{' '}
        <button onClick={load} className="underline">
          Try again
        </button>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500">
        <FaMoneyBillWave className="text-4xl text-gray-300 mx-auto mb-3" />
        <p>No payments yet.</p>
        <p className="text-sm mt-1">
          Payments will appear here once you pay for a course.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#2d3f5d] flex items-center gap-2">
            <FaMoneyBillWave className="text-[#faa853]" />
            Payments
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            All your payments · {rows.length} total
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, course, reference…"
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#faa853] outline-none"
          />
        </div>
      </div>

      {/* Outstanding balance per child + course */}
      {balanceSummary.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#2d3f5d] mb-2">
            Outstanding balance
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {balanceSummary.map((b) => {
              const childName =
                b.child?.full_name ||
                `${b.child?.first_name ?? ''} ${
                  b.child?.last_name ?? ''
                }`.trim() ||
                'Student'
              return (
                <div
                  key={b.applicationId}
                  className="bg-white border border-gray-200 rounded-xl p-4"
                >
                  <p className="font-medium text-[#2d3f5d] truncate">
                    {childName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {b.course?.course_name || 'Course'}
                  </p>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Tuition</p>
                      <p className="font-medium text-[#2d3f5d]">
                        {money(b.tuition)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Paid</p>
                      <p className="font-medium text-green-700">
                        {money(b.paid)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Balance</p>
                      <p
                        className={`font-medium ${
                          b.balance > 0 ? 'text-red-600' : 'text-green-700'
                        }`}
                      >
                        {money(b.balance)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Payments list */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">
                  Course
                </th>
                <th className="px-4 py-3 text-right text-gray-600 font-medium">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">
                  Reference
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const child = p.application?.child
                const course = p.course
                return (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#2d3f5d]">
                      {child?.full_name ||
                        `${child?.first_name ?? ''} ${
                          child?.last_name ?? ''
                        }`.trim() ||
                        '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {course?.course_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#2d3f5d]">
                      {money(p.amount)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[160px]">
                      {p.reference || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setOpenPaymentId(p.id)}
                        className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-1 ml-auto"
                      >
                        View <FaArrowRight className="text-xs" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-500">
            No payments match your search.
          </p>
        )}
      </div>
    </div>
  )
}
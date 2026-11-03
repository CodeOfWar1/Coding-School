import { useRef } from 'react'
import { FaDownload, FaTimes, FaCheckCircle } from 'react-icons/fa'

function money(n) {
  return `K${Number(n || 0).toFixed(2)}`
}

function date(iso) {
  return iso ? new Date(iso).toLocaleDateString() : '—'
}

export default function PaymentReceipt({
  payment,
  course,
  parent,
  child,
  tuition,
  paidForCourse,
  balance,
  onClose,
}) {
  const receiptRef = useRef(null)

  const parentName =
    parent?.full_name ||
    `${parent?.first_name ?? ''} ${parent?.last_name ?? ''}`.trim() ||
    null
  const childName =
    child?.full_name ||
    `${child?.first_name ?? ''} ${child?.last_name ?? ''}`.trim() ||
    '—'

  function handleDownload() {
    const node = receiptRef.current
    if (!node) return

    const win = window.open('', '_blank', 'width=900,height=1200')
    if (!win) return
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Receipt - ${payment.reference || payment.id}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px; color: #2d3f5d; background: #fff; }
            .receipt { max-width: 720px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #faa853; padding-bottom: 16px; margin-bottom: 24px; }
            .brand { font-weight: 700; font-size: 20px; color: #2d3f5d; }
            .brand-sub { color: #6b7280; font-size: 12px; margin-top: 2px; }
            .receipt-no { text-align: right; font-size: 12px; color: #6b7280; }
            .receipt-no strong { color: #2d3f5d; display: block; font-size: 14px; }
            h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin: 24px 0 8px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
            .row .label { color: #6b7280; }
            .row .value { color: #2d3f5d; font-weight: 500; }
            .amount { font-size: 20px; font-weight: 700; color: #16a34a; }
            .balance { font-size: 16px; font-weight: 700; color: #dc2626; }
            .balance.paid { color: #16a34a; }
            .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
            .paid-stamp { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; background: #f0fdf4; color: #16a34a; font-size: 12px; font-weight: 600; margin-top: 24px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div>
                <div class="brand">AnvilCodingAcademy</div>
                <div class="brand-sub">Official Payment Receipt</div>
              </div>
              <div class="receipt-no">
                Receipt No.
                <strong>${payment.reference || payment.id.slice(0, 8).toUpperCase()}</strong>
                Date: ${date(payment.created_at)}
              </div>
            </div>

            <div class="grid">
              ${
                parentName
                  ? `<div>
                      <h2>Parent</h2>
                      <div class="row"><span class="label">Name</span><span class="value">${parentName}</span></div>
                      <div class="row"><span class="label">Email</span><span class="value">${parent?.email || '—'}</span></div>
                      <div class="row"><span class="label">Phone</span><span class="value">${parent?.phone || '—'}</span></div>
                    </div>`
                  : '<div></div>'
              }
              <div>
                <h2>Student</h2>
                <div class="row"><span class="label">Name</span><span class="value">${childName}</span></div>
                <div class="row"><span class="label">Course</span><span class="value">${course?.course_name || '—'}</span></div>
                <div class="row"><span class="label">Code</span><span class="value">${course?.course_code || '—'}</span></div>
              </div>
            </div>

            <h2>Payment</h2>
            <div class="row"><span class="label">Amount Paid</span><span class="value amount">${money(payment.amount)}</span></div>
            <div class="row"><span class="label">Total Paid for Course</span><span class="value">${money(paidForCourse)}</span></div>
            <div class="row"><span class="label">Course Fee</span><span class="value">${money(tuition)}</span></div>
            <div class="row"><span class="label">Remaining Balance</span><span class="value balance ${balance > 0 ? '' : 'paid'}">${money(balance)}</span></div>

            <div class="paid-stamp">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
              Payment received
            </div>

            <div class="footer">
              Thank you for your payment. This receipt was generated on
              ${new Date().toLocaleString()}.
            </div>
          </div>
        </body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 300)
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <p className="text-sm font-semibold text-[#2d3f5d]">Receipt</p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="text-sm text-[#faa853] hover:underline flex items-center gap-1"
            >
              <FaDownload /> Download PDF
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="p-8" ref={receiptRef}>
          <div className="flex items-start justify-between border-b-2 border-[#faa853] pb-4 mb-6">
            <div>
              <p className="font-bold text-xl text-[#2d3f5d]">
                AnvilCodingAcademy
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Official Payment Receipt
              </p>
            </div>
            <div className="text-right text-xs text-gray-500">
              <p>Receipt No.</p>
              <p className="font-semibold text-sm text-[#2d3f5d]">
                {payment.reference || payment.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="mt-1">Date: {date(payment.created_at)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {parentName && (
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                  Parent
                </p>
                <p className="text-sm text-[#2d3f5d]">
                  <span className="text-gray-500">Name: </span>
                  {parentName}
                </p>
                <p className="text-sm text-[#2d3f5d]">
                  <span className="text-gray-500">Email: </span>
                  {parent?.email || '—'}
                </p>
                <p className="text-sm text-[#2d3f5d]">
                  <span className="text-gray-500">Phone: </span>
                  {parent?.phone || '—'}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                Student
              </p>
              <p className="text-sm text-[#2d3f5d]">
                <span className="text-gray-500">Name: </span>
                {childName}
              </p>
              <p className="text-sm text-[#2d3f5d]">
                <span className="text-gray-500">Course: </span>
                {course?.course_name || '—'}
              </p>
              <p className="text-sm text-[#2d3f5d]">
                <span className="text-gray-500">Code: </span>
                {course?.course_code || '—'}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount Paid</span>
              <span className="font-bold text-green-700">
                {money(payment.amount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Paid for Course</span>
              <span className="text-[#2d3f5d]">{money(paidForCourse)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Course Fee</span>
              <span className="text-[#2d3f5d]">{money(tuition)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-500">
                Remaining Balance
              </span>
              <span
                className={`font-bold ${
                  balance > 0 ? 'text-red-600' : 'text-green-700'
                }`}
              >
                {money(balance)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1 text-xs text-green-700 mt-4">
            <FaCheckCircle /> Payment received
          </div>

          <p className="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-gray-100">
            Thank you for your payment. This receipt was generated on{' '}
            {new Date().toLocaleString()}.
          </p>
        </div>
      </div>
    </div>
  )
}
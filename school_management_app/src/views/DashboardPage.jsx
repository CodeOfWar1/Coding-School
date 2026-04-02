import { useAuth } from '../state/AuthContext'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { Bar, Doughnut, Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

function Card({ title, items }) {
  return (
    <section className="rounded bg-white p-4 shadow">
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </section>
  )
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const dark = user?.role === 'hod'

  const pieData = {
    labels: ['Students', 'Teachers', 'Parents'],
    datasets: [{ data: [26, 2, 3], backgroundColor: ['#f26c59', '#1db954', '#2383ff'] }],
  }
  const barData = {
    labels: ['Software QA', 'Architecture'],
    datasets: [
      { label: 'Present', data: [7, 1], backgroundColor: '#4aa3df' },
      { label: 'Absent', data: [1, 0], backgroundColor: '#b6bcc9' },
    ],
  }
  const donutData = {
    labels: ['Program-1', 'Program-2'],
    datasets: [{ data: [68, 32], backgroundColor: ['#16b8e6', '#d4d8e2'] }],
  }

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
      <header className={`${dark ? 'bg-slate-800' : 'bg-white'} border-b`}>
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-4">
          <h1 className="text-3xl font-semibold">Нүүр</h1>
          <div className="flex items-center gap-3">
            <span className="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-700">DEMO</span>
            <span className="rounded bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
              {user?.role}
            </span>
            <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={logout}>
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto grid max-w-[1500px] grid-cols-12 gap-5 p-4">
        <aside className={`col-span-12 rounded-lg p-3 lg:col-span-2 ${dark ? 'bg-slate-800' : 'bg-white'}`}>
          <p className="mb-3 text-lg font-bold">Сургуулийн нэр</p>
          <ul className="space-y-2 text-sm">
            {['Нүүр', 'Багш', 'Сурагч', 'Эцэг эх', 'Анги', 'Хичээл', 'Мэдэгдэл', 'Зар мэдээлэл'].map((m) => (
              <li key={m} className="rounded bg-blue-600 px-3 py-2 text-white">
                {m}
              </li>
            ))}
          </ul>
        </aside>
        <section className="col-span-12 space-y-5 lg:col-span-10">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              { color: 'bg-sky-500', n: 26, t: 'Нийт сурагчид' },
              { color: 'bg-green-600', n: 2, t: 'Нийт багш нар' },
              { color: 'bg-amber-500', n: 6, t: 'Нийт анги' },
              { color: 'bg-red-500', n: 3, t: 'Нийт хичээл' },
            ].map((c) => (
              <div key={c.t} className={`rounded p-4 text-white ${c.color}`}>
                <p className="text-4xl font-bold">{c.n}</p>
                <p>{c.t}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <div className={`rounded-lg p-4 ${dark ? 'bg-slate-800' : 'bg-white'}`}>
              <h2 className="mb-3 text-xl font-semibold">Багш, сурагч болон эцэг эхийн график</h2>
              <div className="mx-auto max-w-md">
                <Pie data={pieData} />
              </div>
            </div>
            <div className={`rounded-lg p-4 ${dark ? 'bg-slate-800' : 'bg-white'}`}>
              <h2 className="mb-3 text-xl font-semibold">Нэг анги дахь бүх хичээл</h2>
              <div className="mx-auto max-w-md">
                <Doughnut data={donutData} />
              </div>
            </div>
          </div>
          <div className={`rounded-lg p-4 ${dark ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className="mb-3 text-xl font-semibold">Ирцийн статистик</h2>
            <Bar data={barData} />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Staff Modules" items={['Take attendance', 'Update attendance', 'Add results', 'Apply leave', 'Profile & notifications']} />
            <Card title="Student/Parent Modules" items={['Attendance & results', 'Feedback and news comments', 'Notifications', 'Profile management']} />
          </div>
        </section>
      </main>
    </div>
  )
}

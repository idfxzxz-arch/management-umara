import { motion } from 'framer-motion'
import { BellRing, CheckCircle2, Clock3, Medal, ShieldCheck, Users } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, Radar, RadarChart, PolarAngleAxis, PolarGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { taxServiceDefinitions } from '../constants/taxServices'
import { useAppData } from '../hooks/useAppData'

const colors = ['#15803d', '#0f766e', '#475569', '#d97706']

export function DashboardPage() {
  const { data } = useAppData()
  if (!data) return null

  const activeTaxWorks = data.taxWorks.filter((work) => work.status !== 'Selesai')
  const completedTaxWorks = data.taxWorks.filter((work) => work.status === 'Selesai')
  const picCount = new Set(data.taxWorks.map((work) => work.pic).filter(Boolean)).size
  const averageAttendance = data.users.length
    ? Math.round(data.users.reduce((sum, user) => sum + user.attendanceRate, 0) / data.users.length)
    : 0
  const taxCategoryChart = taxServiceDefinitions.map((group) => ({
    category: group.category.replace('Aktivasi ', ''),
    layanan: group.services.length,
    point: group.services.reduce((sum, service) => sum + service.basePoints, 0),
    aktif: data.taxWorks.filter((work) => work.category === group.category && work.status !== 'Selesai').length,
  }))

  const stats = [
    { label: 'Total Client', value: data.clients.length, icon: Users },
    { label: 'PIC Aktif', value: picCount, icon: Users },
    { label: 'Layanan Pajak', value: taxServiceDefinitions.reduce((sum, group) => sum + group.services.length, 0), icon: ShieldCheck },
    { label: 'Pajak Berjalan', value: activeTaxWorks.length, icon: Clock3 },
    { label: 'Pajak Selesai', value: completedTaxWorks.length, icon: CheckCircle2 },
    { label: 'Task Selesai', value: data.tasks.filter((task) => task.status === 'done').length, icon: CheckCircle2 },
    { label: 'Kehadiran', value: `${averageAttendance}%`, icon: BellRing },
    { label: 'Point', value: data.users.reduce((sum, user) => sum + user.points, 0), icon: Medal },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-white/70 bg-white/72 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
        <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Dashboard Operasional</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ringkasan operasional UMARA TAX hari ini.</p>
        </div>
        <Badge tone="green">0 reminder deadline minggu ini</Badge>
        </div>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
            <Card className="group p-4 transition hover:-translate-y-0.5 hover:shadow-[0_20px_55px_rgba(15,23,42,0.10)]">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-green-100 text-green-700 ring-1 ring-green-700/10 transition group-hover:bg-green-700 group-hover:text-white dark:bg-green-500/15 dark:text-green-200"><stat.icon className="h-5 w-5" /></div>
              </div>
              <p className="mt-3 text-2xl font-bold">{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Pekerjaan Selesai">
          <LineChart data={data.analytics}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Line type="monotone" dataKey="done" stroke="#15803d" strokeWidth={2} /></LineChart>
        </ChartCard>
        <ChartCard title="Kategori Layanan Pajak">
          <BarChart data={taxCategoryChart}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="category" tick={{ fontSize: 12 }} /><YAxis /><Tooltip /><Bar dataKey="layanan" fill="#0f766e" radius={[4, 4, 0, 0]} /></BarChart>
        </ChartCard>
        <ChartCard title="Status Pajak">
          <PieChart><Pie data={[{ name: 'Selesai', value: completedTaxWorks.length }, { name: 'Berjalan', value: data.taxWorks.filter((work) => work.status === 'Berjalan').length }, { name: 'Review', value: data.taxWorks.filter((work) => work.status === 'Review').length }, { name: 'Draft', value: data.taxWorks.filter((work) => work.status === 'Draft').length }]} dataKey="value" nameKey="name" outerRadius={90}>{colors.map((color) => <Cell key={color} fill={color} />)}</Pie><Tooltip /></PieChart>
        </ChartCard>
        <ChartCard title="Point Staff">
          <AreaChart data={data.analytics}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Area type="monotone" dataKey="points" stroke="#15803d" fill="#15803d" fillOpacity={0.18} /></AreaChart>
        </ChartCard>
        <ChartCard title="Radar Operasional">
          <RadarChart data={[{ item: 'Client', score: data.clients.length }, { item: 'PIC', score: picCount }, { item: 'Pajak', score: data.taxWorks.length }, { item: 'Absensi', score: data.attendance.length }, { item: 'Point', score: data.users.reduce((sum, user) => sum + user.points, 0) }]}><PolarGrid /><PolarAngleAxis dataKey="item" /><Radar dataKey="score" stroke="#15803d" fill="#15803d" fillOpacity={0.18} /></RadarChart>
        </ChartCard>
      </section>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold">{title}</h2>
        <span className="h-2 w-2 rounded-full bg-green-600" />
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </Card>
  )
}

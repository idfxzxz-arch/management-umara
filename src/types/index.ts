export type Role = 'developer' | 'manager' | 'staff' | 'staff_magang'
export type UserStatus = 'active' | 'inactive'
export type TaskStatus = 'todo' | 'progress' | 'review' | 'done'
export type TaxCategory =
  | 'Aktivasi Coretax'
  | 'SP2DK/Pemeriksaan'
  | 'SPT Masa'
  | 'SPT Tahunan'

export type User = {
  id: string
  name: string
  email: string
  password?: string
  role: Role
  phone: string
  avatar: string
  status: UserStatus
  is_first_login: boolean
  password_changed_at: string | null
  created_at: string
  updated_at: string
  points: number
  attendanceRate: number
}

export type AnalyticsPoint = {
  month: string
  clients: number
  done: number
  running: number
  points: number
}

export type Client = {
  id: string
  name: string
  npwp: string
  type: 'OP' | 'Badan'
  status: 'Aktif' | 'Prospek' | 'Nonaktif'
  pic: string
  email: string
}

export type Task = {
  id: string
  title: string
  client: string
  pic: string
  deadline: string
  status: TaskStatus
  points: number
  notes: string
}

export type TaxWork = {
  id: string
  category: TaxCategory
  service: string
  client: string
  pic: string
  deadline: string
  status: 'Draft' | 'Berjalan' | 'Review' | 'Selesai'
  attachment: string
  notes: string
}

export type Attendance = {
  id: string
  staff: string
  date: string
  checkIn: string
  checkOut: string
  status: 'Hadir' | 'Terlambat' | 'Izin' | 'Remote'
}

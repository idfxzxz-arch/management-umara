import type { AnalyticsPoint, Attendance, Client, TaxWork, Task, User } from '../types'
import { getTaxServicePoint } from '../constants/taxServices'
import { supabase } from './supabase'

type AppData = {
  analytics: AnalyticsPoint[]
  attendance: Attendance[]
  clients: Client[]
  reportTypes: string[]
  tasks: Task[]
  taxWorks: TaxWork[]
  users: User[]
}

export const emptyAppData: AppData = {
  analytics: [],
  attendance: [],
  clients: [],
  reportTypes: ['Pajak', 'Staff', 'Absensi', 'Client', 'Point', 'Task'],
  tasks: [],
  taxWorks: [],
  users: [],
}

export async function fetchAppData(): Promise<AppData> {
  if (!supabase) return emptyAppData

  const [usersResult, clientsResult, tasksResult, attendanceResult, taxResult] = await Promise.all([
    supabase.from('users').select('*').order('created_at', { ascending: false }),
    supabase.from('clients').select('*').order('created_at', { ascending: false }),
    supabase.from('tasks').select('*').order('deadline', { ascending: true }),
    supabase.from('attendance').select('*').order('date', { ascending: false }),
    supabase.from('tax').select('*').order('deadline', { ascending: true }),
  ])

  const firstError = [usersResult, clientsResult, tasksResult, attendanceResult, taxResult].find((result) => result.error)?.error
  if (firstError) throw firstError

  const users = (usersResult.data ?? []).map(toUser)
  const tasks = (tasksResult.data ?? []).map(toTask)

  return {
    analytics: buildAnalytics(clientsResult.data ?? [], tasks, users),
    attendance: (attendanceResult.data ?? []).map(toAttendance),
    clients: (clientsResult.data ?? []).map(toClient),
    reportTypes: emptyAppData.reportTypes,
    tasks,
    taxWorks: (taxResult.data ?? []).map(toTaxWork),
    users,
  }
}

export async function fetchUserProfile(email: string): Promise<User | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle()
  if (error) {
    if (error.code === 'PGRST205' || error.message.includes("Could not find the table 'public.users'")) {
      throw new Error('Tabel public.users belum dibuat di Supabase. Jalankan supabase/schema.sql di SQL Editor.')
    }
    throw error
  }
  return data ? toUser(data) : null
}

export async function updateUserFirstLogin(id: string) {
  if (!supabase) return
  const changedAt = new Date().toISOString()
  const { error } = await supabase
    .from('users')
    .update({ is_first_login: false, password_changed_at: changedAt, updated_at: changedAt })
    .eq('id', id)
  if (error) throw error
}

export async function createClient(values: Omit<Client, 'id'>) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
  const { error } = await supabase.from('clients').insert({
    name: values.name,
    npwp: values.npwp,
    type: values.type,
    status: values.status,
    pic: values.pic,
    email: values.email,
  })
  if (error) throw error
}

export async function updateClient(id: string, values: Omit<Client, 'id'>) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
  const { error } = await supabase.from('clients').update({
    name: values.name,
    npwp: values.npwp,
    type: values.type,
    status: values.status,
    pic: values.pic,
    email: values.email,
    updated_at: new Date().toISOString(),
  }).eq('id', id)
  if (error) throw error
}

export async function deleteClient(id: string) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw error
}

export async function createTask(values: Omit<Task, 'id'>) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
  const { error } = await supabase.from('tasks').insert(toTaskRow(values))
  if (error) throw error
  if (values.status === 'done') await awardPointsToPic(values.pic, values.points)
}

export async function updateTask(id: string, values: Omit<Task, 'id'>, previousStatus?: Task['status']) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
  const { error } = await supabase.from('tasks').update({ ...toTaskRow(values), updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
  if (previousStatus !== 'done' && values.status === 'done') await awardPointsToPic(values.pic, values.points)
}

export async function deleteTask(id: string) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function createTaxWork(values: Omit<TaxWork, 'id'>) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
  const { error } = await supabase.from('tax').insert(toTaxRow(values))
  if (error) throw error
  if (values.status === 'Selesai') await awardPointsToPic(values.pic, getTaxServicePoint(values.category, values.service))
}

export async function updateTaxWork(id: string, values: Omit<TaxWork, 'id'>, previousStatus?: TaxWork['status']) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
  const { error } = await supabase.from('tax').update({ ...toTaxRow(values), updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
  if (previousStatus !== 'Selesai' && values.status === 'Selesai') {
    await awardPointsToPic(values.pic, getTaxServicePoint(values.category, values.service))
  }
}

export async function deleteTaxWork(id: string) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
  const { error } = await supabase.from('tax').delete().eq('id', id)
  if (error) throw error
}

export async function createAttendance(values: Omit<Attendance, 'id'>) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
  const { error } = await supabase.from('attendance').insert(toAttendanceRow(values))
  if (error) throw error
}

export async function updateAttendance(id: string, values: Omit<Attendance, 'id'>) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
  const { error } = await supabase.from('attendance').update({ ...toAttendanceRow(values), updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export async function deleteAttendance(id: string) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
  const { error } = await supabase.from('attendance').delete().eq('id', id)
  if (error) throw error
}

export async function updateUserPoints(id: string, points: number) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
  const { error } = await supabase.from('users').update({ points, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

async function awardPointsToPic(pic: string, points: number) {
  if (!supabase || !pic || points <= 0) return
  const { data, error } = await supabase.from('users').select('id,points').eq('name', pic).maybeSingle()
  if (error) throw error
  if (!data) return
  const { error: updateError } = await supabase
    .from('users')
    .update({ points: Number(data.points ?? 0) + points, updated_at: new Date().toISOString() })
    .eq('id', data.id)
  if (updateError) throw updateError
}

function toTaskRow(values: Omit<Task, 'id'>) {
  return {
    title: values.title,
    client: values.client,
    pic: values.pic,
    deadline: values.deadline,
    status: values.status,
    points: values.points,
    notes: values.notes,
  }
}

function toTaxRow(values: Omit<TaxWork, 'id'>) {
  return {
    category: values.category,
    service: values.service,
    client: values.client,
    pic: values.pic,
    deadline: values.deadline,
    status: values.status,
    attachment: values.attachment,
    notes: values.notes,
  }
}

function toAttendanceRow(values: Omit<Attendance, 'id'>) {
  return {
    staff: values.staff,
    date: values.date,
    check_in: values.checkIn || null,
    check_out: values.checkOut || null,
    status: values.status,
  }
}

function toUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    role: String(row.role ?? 'staff') as User['role'],
    phone: String(row.phone ?? ''),
    avatar: String(row.avatar ?? initials(String(row.name ?? row.email ?? 'U'))),
    status: String(row.status ?? 'active') as User['status'],
    is_first_login: Boolean(row.is_first_login),
    password_changed_at: row.password_changed_at ? String(row.password_changed_at) : null,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
    points: Number(row.points ?? 0),
    attendanceRate: Number(row.attendance_rate ?? row.attendanceRate ?? 0),
  }
}

function toClient(row: Record<string, unknown>): Client {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    npwp: String(row.npwp ?? ''),
    type: String(row.type ?? 'Badan') as Client['type'],
    status: String(row.status ?? 'Aktif') as Client['status'],
    pic: String(row.pic ?? ''),
    email: String(row.email ?? ''),
  }
}

function toTask(row: Record<string, unknown>): Task {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    client: String(row.client ?? ''),
    pic: String(row.pic ?? ''),
    deadline: String(row.deadline ?? ''),
    status: String(row.status ?? 'todo') as Task['status'],
    points: Number(row.points ?? 0),
    notes: String(row.notes ?? ''),
  }
}

function toAttendance(row: Record<string, unknown>): Attendance {
  return {
    id: String(row.id),
    staff: String(row.staff ?? ''),
    date: String(row.date ?? ''),
    checkIn: String(row.check_in ?? row.checkIn ?? ''),
    checkOut: String(row.check_out ?? row.checkOut ?? ''),
    status: String(row.status ?? 'Hadir') as Attendance['status'],
  }
}

function toTaxWork(row: Record<string, unknown>): TaxWork {
  return {
    id: String(row.id),
    category: String(row.category ?? 'SPT Masa') as TaxWork['category'],
    service: String(row.service ?? ''),
    client: String(row.client ?? ''),
    pic: String(row.pic ?? ''),
    deadline: String(row.deadline ?? ''),
    status: String(row.status ?? 'Draft') as TaxWork['status'],
    attachment: String(row.attachment ?? ''),
    notes: String(row.notes ?? ''),
  }
}

function buildAnalytics(clients: Record<string, unknown>[], tasks: Task[], users: User[]): AnalyticsPoint[] {
  if (!clients.length && !tasks.length && !users.length) return []

  const done = tasks.filter((task) => task.status === 'done').length
  const running = tasks.filter((task) => task.status !== 'done').length
  const points = users.reduce((total, user) => total + user.points, 0)

  return [{
    month: new Date().toLocaleString('id-ID', { month: 'short' }),
    clients: clients.length,
    done,
    running,
    points,
  }]
}

function initials(value: string) {
  return value
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

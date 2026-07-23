import { CalendarDays, Clock } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAppData } from "../hooks/useAppData";
import {
  createAttendance,
  deleteAttendance,
  updateAttendance,
} from "../services/database";
import { useAuth } from "../hooks/useAuth";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getEmptyAttendance(staff = "") {
  return {
    staff,
    date: getToday(),
    checkIn: "08:00",
    checkOut: "17:00",
    status: "Hadir",
  };
}

export function AttendancePage() {
  const { data } = useAppData();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(getEmptyAttendance());
  const attendance = data?.attendance ?? [];
  const attendanceChart = attendance.map((row) => ({
    staff: row.staff,
    jam: calculateWorkHours(row.checkIn, row.checkOut),
  }));
  const totalHours = attendanceChart.reduce((total, row) => total + row.jam, 0);
  const averageHours = attendanceChart.length
    ? totalHours / attendanceChart.length
    : 0;

  async function refresh(message) {
    await queryClient.invalidateQueries({ queryKey: ["umara-dashboard"] });
    toast.success(message);
  }

  async function submit(event) {
    event.preventDefault();
    try {
      if (!form.staff.trim()) return toast.error("Nama staff wajib diisi");
      if (editing) {
        await updateAttendance(editing.id, form);
        setEditing(null);
        await refresh("Absensi diperbarui");
      } else {
        await createAttendance(form);
        await refresh("Absensi ditambahkan");
      }
      setForm(getEmptyAttendance());
      setShowForm(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Absensi gagal disimpan",
      );
    }
  }

  function startEdit(row) {
    setEditing(row);
    setForm({
      staff: row.staff,
      date: row.date,
      checkIn: row.checkIn,
      checkOut: row.checkOut,
      status: row.status,
    });
    setShowForm(true);
  }

  async function quickAttendance(type) {
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    const staff = user?.name || user?.email || "";
    const today = getToday();
    try {
      if (!staff) {
        toast.error("Profil staff belum terbaca. Gunakan Input Manual.");
        return;
      }
      const existing = attendance.find(
        (row) => row.staff === staff && row.date === today,
      );
      if (type === "in") {
        if (existing) {
          await updateAttendance(existing.id, {
            ...existing,
            checkIn: existing.checkIn || time,
            status: existing.status,
          });
          await refresh("Check in hari ini sudah tercatat");
          return;
        }
        await createAttendance({
          staff,
          date: today,
          checkIn: time,
          checkOut: "",
          status: time > "08:00" ? "Terlambat" : "Hadir",
        });
        await refresh("Check in tersimpan");
        return;
      }
      if (!existing) {
        toast.error("Belum ada check in hari ini");
        return;
      }
      await updateAttendance(existing.id, {
        staff: existing.staff,
        date: existing.date,
        checkIn: existing.checkIn || time,
        checkOut: time,
        status: existing.status,
      });
      await refresh("Check out tersimpan");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Absensi gagal diproses",
      );
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">Absensi</h1>
            <Badge tone="green">Realtime aktif</Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Jam masuk, jam pulang, durasi kerja, dan status kehadiran staff.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void quickAttendance("in")}>
            <Clock className="h-4 w-4" />
            Check In
          </Button>
          <Button
            variant="secondary"
            onClick={() => void quickAttendance("out")}
          >
            Check Out
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setShowForm((value) => !value);
              setEditing(null);
              setForm(getEmptyAttendance(user?.name || user?.email || ""));
            }}
          >
            Input Manual
          </Button>
        </div>
      </div>
      {showForm && (
        <Card className="p-4">
          <form
            className="grid gap-3 md:grid-cols-2"
            onSubmit={(event) => void submit(event)}
          >
            <Input
              placeholder="Nama staff"
              value={form.staff}
              onChange={(event) =>
                setForm({ ...form, staff: event.target.value })
              }
            />
            <Input
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm({ ...form, date: event.target.value })
              }
            />
            <Input
              type="time"
              value={form.checkIn}
              onChange={(event) =>
                setForm({ ...form, checkIn: event.target.value })
              }
            />
            <Input
              type="time"
              value={form.checkOut}
              onChange={(event) =>
                setForm({ ...form, checkOut: event.target.value })
              }
            />
            <select
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950"
              value={form.status}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value })
              }
            >
              <option value="Hadir">Hadir</option>
              <option value="Terlambat">Terlambat</option>
              <option value="Izin">Izin</option>
              <option value="Remote">Remote</option>
            </select>
            <div className="flex gap-2">
              <Button>{editing ? "Update Absensi" : "Simpan Absensi"}</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                  setForm(getEmptyAttendance());
                }}
              >
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-slate-500">Total Jam Tercatat</p>
          <p className="mt-2 text-2xl font-bold">{totalHours.toFixed(1)} jam</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Rata-rata Jam/Staf</p>
          <p className="mt-2 text-2xl font-bold">
            {averageHours.toFixed(1)} jam
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Terlambat/Izin/Remote</p>
          <p className="mt-2 text-2xl font-bold">
            {attendance.filter((row) => row.status !== "Hadir").length}
          </p>
        </Card>
      </section>
      <Card className="p-4">
        <div className="mb-4 flex items-center gap-2 font-bold">
          <CalendarDays className="h-5 w-5 text-green-700" />
          Kalender Juli 2026
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {Array.from({ length: 31 }, (_, index) => (
            <div
              key={index}
              className="rounded-md bg-slate-50 p-3 dark:bg-white/5"
            >
              {index + 1}
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4">
        <h2 className="mb-4 font-bold">Grafik Jam Kerja Staff</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="staff" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="jam" fill="#0f766e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-500 dark:bg-white/5">
            <tr>
              <th className="p-3">Staff</th>
              <th>Tanggal</th>
              <th>Masuk</th>
              <th>Pulang</th>
              <th>Durasi</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/10">
            {attendance.map((row) => (
              <tr key={row.id}>
                <td className="p-3 font-semibold">{row.staff}</td>
                <td>{row.date}</td>
                <td>{row.checkIn}</td>
                <td>{row.checkOut}</td>
                <td>
                  {calculateWorkHours(row.checkIn, row.checkOut).toFixed(1)} jam
                </td>
                <td>
                  <Badge
                    tone={
                      row.status === "Hadir"
                        ? "green"
                        : row.status === "Terlambat"
                          ? "amber"
                          : "blue"
                    }
                  >
                    {row.status}
                  </Badge>
                </td>
                <td>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => startEdit(row)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        void deleteAttendance(row.id).then(() =>
                          refresh("Absensi dihapus"),
                        )
                      }
                    >
                      Hapus
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function calculateWorkHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const [inHour = 0, inMinute = 0] = checkIn.split(":").map(Number);
  const [outHour = 0, outMinute = 0] = checkOut.split(":").map(Number);
  const minutes = outHour * 60 + outMinute - (inHour * 60 + inMinute);
  return Math.max(minutes / 60, 0);
}

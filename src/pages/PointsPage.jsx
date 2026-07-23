import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAppData } from "../hooks/useAppData";
import { updateUserPoints } from "../services/database";

export function PointsPage() {
  const { data } = useAppData();
  const queryClient = useQueryClient();
  const [draftPoints, setDraftPoints] = useState({});
  const ranked = [...(data?.users ?? [])].sort((a, b) => b.points - a.points);
  const totalPoints = ranked.reduce((sum, user) => sum + user.points, 0);
  const topStaff = ranked[0];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Point, Ranking & Badge</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Point mencatat keunggulan staff dari pekerjaan pajak dan task yang
          selesai.
        </p>
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-slate-500">Total Point Staff</p>
          <p className="mt-2 text-2xl font-bold">{totalPoints}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Staff Terunggul</p>
          <p className="mt-2 text-xl font-bold">{topStaff?.name ?? "-"}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Rata-rata Point</p>
          <p className="mt-2 text-2xl font-bold">
            {ranked.length ? Math.round(totalPoints / ranked.length) : 0}
          </p>
        </Card>
      </section>
      <Card className="p-4">
        <h2 className="mb-4 font-bold">Grafik Keunggulan Staff</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ranked}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="points" fill="#15803d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ranked.map((user, index) => (
          <Card key={user.id} className="p-4">
            <Badge tone={index === 0 ? "green" : "slate"}>
              Ranking #{index + 1}
            </Badge>
            <h2 className="mt-3 font-bold">{user.name}</h2>
            <p className="mt-2 text-3xl font-bold text-green-700">
              {user.points}
            </p>
            <p className="text-sm text-slate-500">
              {user.points > 800
                ? "Badge: Elite"
                : user.points > 600
                  ? "Badge: Pro"
                  : "Badge: Rising"}
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Role: {user.role.replace("_", " ")}
            </p>
            <div className="mt-4 flex gap-2">
              <Input
                type="number"
                value={draftPoints[user.id] ?? user.points}
                onChange={(event) =>
                  setDraftPoints({
                    ...draftPoints,
                    [user.id]: Number(event.target.value),
                  })
                }
              />
              <Button
                variant="secondary"
                onClick={() =>
                  void updateUserPoints(
                    user.id,
                    draftPoints[user.id] ?? user.points,
                  ).then(async () => {
                    await queryClient.invalidateQueries({
                      queryKey: ["umara-dashboard"],
                    });
                    toast.success("Point diperbarui");
                  })
                }
              >
                Simpan
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

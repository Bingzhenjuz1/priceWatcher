import { AlertList } from "@/components/AlertList";
import { listAlerts } from "@/lib/watch/watchService";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const alerts = await listAlerts();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-ink">提醒中心</h1>
      <AlertList alerts={alerts} />
    </div>
  );
}

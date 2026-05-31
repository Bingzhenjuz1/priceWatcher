import { AlertList } from "@/components/AlertList";
import { listAlerts } from "@/lib/watch/watchService";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const alerts = await listAlerts();
  const alertItems = alerts.map((alert) => ({
    ...alert,
    triggeredAt: alert.triggeredAt.toISOString(),
    readAt: alert.readAt?.toISOString() ?? null
  }));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-ink">提醒中心</h1>
      <AlertList alerts={alertItems} />
    </div>
  );
}

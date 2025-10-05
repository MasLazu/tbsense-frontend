import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

const kpis = [
  {
    label: "Active sensors",
    value: "128",
    delta: "+12.4% vs last week",
  },
  {
    label: "Alerts resolved",
    value: "84",
    delta: "92% success rate",
  },
  {
    label: "Samples processed",
    value: "3.2K",
    delta: "+8.1% vs target",
  },
  {
    label: "Downtime",
    value: "14m",
    delta: "-32% week over week",
  },
];

const insights = [
  {
    title: "Data streams are stable",
    description:
      "All ingestion pipelines are running within acceptable thresholds.",
  },
  {
    title: "Two sensors require calibration",
    description:
      "Devices TB-204 and TB-218 drifted outside the expected baseline overnight.",
  },
  {
    title: "AI model retraining scheduled",
    description:
      "Next automated retraining window opens in 6 hours with fresh labels.",
  },
];

const activity = [
  {
    title: "Operator check-in complete",
    time: "2h ago",
  },
  {
    title: "New sensor cluster added in Jakarta",
    time: "5h ago",
  },
  {
    title: "Auto-mitigation run #342 finished",
    time: "Yesterday",
  },
];

export const Route = createFileRoute("/dashboard/overview/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">
            Keep tabs on network health, data quality, and automation activity
            across the TB Sense platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Export
          </Button>
          <Button size="sm">New report</Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
          >
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <h3 className="mt-2 text-2xl font-semibold">{item.value}</h3>
            <p className="text-xs text-muted-foreground">{item.delta}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-7">
        <div className="col-span-full space-y-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm lg:col-span-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Pipeline health
            </h2>
            <p className="text-sm text-muted-foreground">
              Automated diagnostics surfaced the following highlights in the
              last 24 hours.
            </p>
          </div>
          <ul className="space-y-3">
            {insights.map((item) => (
              <li
                key={item.title}
                className="rounded-md border border-dashed bg-background/50 p-3"
              >
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-full space-y-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm lg:col-span-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Recent activity
            </h2>
            <p className="text-sm text-muted-foreground">
              A quick timeline of operator actions and automated responses.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {activity.map((item) => (
              <li
                key={item.title}
                className="flex items-start justify-between gap-3 text-foreground"
              >
                <span className="font-medium">{item.title}</span>
                <span className="text-xs text-muted-foreground">
                  {item.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

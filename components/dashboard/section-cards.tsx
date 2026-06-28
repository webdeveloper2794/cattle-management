import { Activity, ClipboardList, HeartPulse, Weight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type DashboardStats = {
  totalCattle: number;
  activeCattle: number;
  healthAlerts: number;
  meatCattle: number;
  dairyCattle: number;
  breedingCattle: number;
  weightRecords: number;
};

export function SectionCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Cattle</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalCattle}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <ClipboardList />
              Herd
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 font-medium">Complete herd records</div>
          <div className="text-muted-foreground">
            {stats.meatCattle} meat · {stats.dairyCattle} dairy ·{" "}
            {stats.breedingCattle} breeding
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Cattle</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.activeCattle}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Activity />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 font-medium">Currently in the herd</div>
          <div className="text-muted-foreground">
            Excludes sold, deceased, and transferred cattle
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Health Alerts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.healthAlerts}
          </CardTitle>
          <CardAction>
            <Badge variant={stats.healthAlerts > 0 ? "destructive" : "outline"}>
              <HeartPulse />
              Review
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 font-medium">
            Sick or needs checkup records
          </div>
          <div className="text-muted-foreground">
            Useful for daily care prioritization
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Weight Records</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.weightRecords}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Weight />
              Tracking
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 font-medium">Growth history captured</div>
          <div className="text-muted-foreground">
            Especially important for meat cattle
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

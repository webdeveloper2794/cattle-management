"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { PurposeChartPoint, WeightActivityPoint } from "@/types";

export type { PurposeChartPoint, WeightActivityPoint };

const chartConfig = {
  count: {
    label: "Cattle",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function PurposeChart({ data }: { data: PurposeChartPoint[] }) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Cattle by Purpose</CardTitle>
        <CardDescription>
          Herd composition across dairy, meat, and breeding cattle
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="purpose"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function ChartAreaInteractive({
  data,
}: {
  data: WeightActivityPoint[];
}) {
  const purposeData = data.map((point) => ({
    purpose: point.month,
    count: point.records,
  }));

  return <PurposeChart data={purposeData} />;
}

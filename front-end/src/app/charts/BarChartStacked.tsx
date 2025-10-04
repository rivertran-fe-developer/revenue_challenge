"use client";
import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMemo } from "react";

export type ChartBarStackedProps = {
  data: {
    day: string;
    current: number;
    previous: number;
    posCurrent: number;
    eatclubCurrent: number;
    labourCurrent: number;
    posPrevious?: number;
    eatclubPrevious?: number;
    labourPrevious?: number;
  }[];
  showComparison?: boolean;
  showPosRevenue?: boolean;
  showEatclubRevenue?: boolean;
  showLabourCosts?: boolean;
};

const chartConfig = {
  posRevenue: {
    label: "POS Revenue (Current)",
    color: "var(--chart-1)",
  },
  eatclubRevenue: {
    label: "Eatclub Revenue (Current)",
    color: "var(--chart-2)",
  },
  labourCosts: {
    label: "Labour Costs (Current)",
    color: "var(--chart-3)",
  },
  directRevenuePrevious: {
    label: "Direct Revenue (Previous)",
    color: "var(--chart-4)",
  },
  totalRevenuePrevious: {
    label: "Total Revenue (Previous)",
    color: "var(--chart-5)",
  },
  labourCostsPrevious: {
    label: "Labour Costs (Previous)",
    color: "var(--chart-6)",
  },
} satisfies ChartConfig;

const TOOLTIP_NAME_MAP = {
  posRevenue: "POS Revenue (Current)",
  eatclubRevenue: "Eatclub Revenue (Current)",
  labourCosts: "Labour Costs (Current)",
  directRevenuePrevious: "Direct Revenue (Previous)",
  labourCostsPrevious: "Labour Costs (Previous)",
} as const;

const formatYAxisTick = (value: number): string => {
  return `${(value / 1000).toFixed(1)}k`;
};

export function ChartBarStacked({
  data,
  showComparison = false,
  showPosRevenue,
  showEatclubRevenue,
  showLabourCosts,
}: ChartBarStackedProps) {
  const chartData = data.map((item) => ({
    day: item.day,
    posRevenue: item.posCurrent,
    eatclubRevenue: item.eatclubCurrent,
    labourCosts: item.labourCurrent,
    directRevenuePrevious: showComparison
      ? (item.posPrevious || 0) + (item.eatclubPrevious || 0)
      : 0,
    labourCostsPrevious: showComparison ? item.labourPrevious || 0 : 0,
    totalCurrent: item.current,
    totalPrevious: showComparison ? item.previous : undefined,
  }));


  // Calculate dynamic Y-axis domain
  const yAxisDomain = useMemo(() => {
    const allValues = chartData.flatMap((item) => [
      showPosRevenue ? item.posRevenue : 0,
      showEatclubRevenue ? item.eatclubRevenue : 0,
      showLabourCosts ? item.labourCosts : 0,
      showComparison ? item.directRevenuePrevious : 0,
      showComparison ? item.labourCostsPrevious : 0,
    ]);

    const maxValue = Math.max(...allValues);
    const roundedMax = Math.ceil(maxValue / 1000) * 1000;
    
    return [0, roundedMax * 1.1];
  }, [chartData, showComparison, showPosRevenue, showEatclubRevenue, showLabourCosts]);

  return (
    <>
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={formatYAxisTick}
              domain={yAxisDomain}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelKey="day"
                  indicator="dot"
                  hideLabel={false}
                  hideIndicator={false}
                  className="min-w-[200px]"
                  formatter={(value, name) => {
                    const formattedValue = new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                    }).format(Number(value));

                    const readableName =
                      name in TOOLTIP_NAME_MAP
                        ? TOOLTIP_NAME_MAP[name as keyof typeof TOOLTIP_NAME_MAP]
                        : name;

                    return (
                      <div className="flex justify-between gap-8 min-w-[250px]">
                        <span>{readableName}</span>
                        <span className="font-semibold">{formattedValue}</span>
                      </div>
                    );
                  }}
                />
              }
            />

            {showPosRevenue && (
              <Bar
                dataKey="posRevenue"
                stackId="current"
                fill="var(--color-posRevenue)"
                radius={[0, 0, 0, 0]}
              />
            )}

            {showEatclubRevenue && (
              <Bar
                dataKey="eatclubRevenue"
                stackId="current"
                fill="var(--color-eatclubRevenue)"
                radius={[4, 4, 0, 0]}
              />
            )}

            {showLabourCosts && (
              <Bar
                dataKey="labourCosts"
                fill="var(--color-labourCosts)"
                radius={[4, 4, 4, 4]}
              />
            )}

            {showComparison && (
              <>
                <Bar
                  dataKey="directRevenuePrevious"
                  fill="var(--color-directRevenuePrevious)"
                  radius={[4, 4, 4, 4]}
                  opacity={0.7}
                />
                <Bar
                  dataKey="labourCostsPrevious"
                  fill="var(--color-labourCostsPrevious)"
                  radius={[4, 4, 4, 4]}
                  opacity={0.7}
                />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Custom Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 text-sm flex-wrap">
        {showPosRevenue && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--chart-1)]"></div>
            <span>POS Revenue{showComparison ? " (Current)" : ""}</span>
          </div>
        )}
        {showEatclubRevenue && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--chart-2)]"></div>
            <span>Eatclub Revenue{showComparison ? " (Current)" : ""}</span>
          </div>
        )}
        {showLabourCosts && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--chart-3)]"></div>
            <span>Labour Costs{showComparison ? " (Current)" : ""}</span>
          </div>
        )}

        {/* Previous period legends */}
        {showComparison && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--chart-4)]"></div>
              <span>Direct Revenue (Previous)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--chart-5)]"></div>
              <span>Total Revenue (Previous)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--chart-6)]"></div>
              <span>Labour Costs (Previous)</span>
            </div>
          </>
        )}

        <div className="h-4 w-px bg-gray-300"></div>

        {/* Event impact legends */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-green-600" />
          </div>
          <span>Positive Event Impact</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-red-600 rotate-[10deg] scale-y-[-1]" />
          </div>
          <span>Negative Event Impact</span>
        </div>
      </div>
    </>
  );
}

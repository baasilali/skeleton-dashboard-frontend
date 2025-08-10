"use client";

import * as React from "react";
import { Label, Legend, Pie, PieChart, Sector } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const description = "An interactive pie chart";

// Normalize arbitrary labels to CSS variable-friendly keys
function toVarKey(label: string) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-");
}

interface InteractivePieChartProps {
  /** Title shown in the card header */
  title?: React.ReactNode;
  /** Data points for the pie chart */
  data: Array<{ leadSource: string; count: number }>;
  /** Label for the all-data option in the select dropdown */
  allLabel?: string;
}

export function InteractivePieChart({ title, data, allLabel = "Select Option" }: InteractivePieChartProps) {
  const id = "pie-interactive";
  const ALL_OPTION = "__ALL__";

  const sources = React.useMemo(() => data.map((d) => d.leadSource), [data]);
  const [activeSource, setActiveSource] = React.useState<string>(ALL_OPTION);

  React.useEffect(() => {
    // Keep activeSource in sync if incoming data changes, but preserve ALL_OPTION
    if (activeSource !== ALL_OPTION && !sources.includes(activeSource) && sources.length > 0) {
      setActiveSource(sources[0]);
    }
    if (sources.length === 0) {
      setActiveSource(ALL_OPTION);
    }
  }, [sources, activeSource]);

  const activeIndex = React.useMemo(() => {
    if (activeSource === ALL_OPTION) return undefined;
    const idx = sources.findIndex((s) => s === activeSource);
    return idx >= 0 ? idx : undefined;
  }, [sources, activeSource]);

  // Build chart config and computed data with fills
  const { chartConfig, computedData } = React.useMemo(() => {
    const configEntries: Array<[string, { label: string; color: string }]> = [];
    const computed = data.map((d, idx) => {
      const key = toVarKey(d.leadSource);
      // rotate through palette vars --chart-1..--chart-12
      const paletteVar = `var(--chart-${(idx % 12) + 1})`;
      configEntries.push([key, { label: d.leadSource, color: paletteVar }]);
      return {
        leadSource: d.leadSource,
        count: d.count,
        fill: `var(--color-${key})`,
      };
    });
    const config = Object.fromEntries(configEntries) satisfies ChartConfig;
    return { chartConfig: config, computedData: computed };
  }, [data]);

  const totalCount = React.useMemo(
    () => computedData.reduce((sum, d) => sum + (Number(d.count) || 0), 0),
    [computedData]
  );

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>{title}</CardTitle>
        </div>
        <Select value={activeSource} onValueChange={setActiveSource}>
          <SelectTrigger
            className="ml-auto h-7 w-[180px] rounded-lg pl-2.5"
            aria-label={allLabel}
          >
            <SelectValue placeholder={allLabel} />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            <SelectItem key={ALL_OPTION} value={ALL_OPTION} className="rounded-lg [&_span]:flex">
              <div className="flex items-center gap-2 text-xs">
                <span className="flex h-3 w-3 shrink-0 rounded-xs bg-muted" />
                {allLabel}
              </div>
            </SelectItem>
            {sources.map((src) => {
              const key = toVarKey(src);
              const config = chartConfig[key as keyof typeof chartConfig];

              if (!config) return null;

              return (
                <SelectItem
                  key={src}
                  value={src}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{ backgroundColor: `var(--color-${key})` }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[350px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={computedData}
              dataKey="count"
              nameKey="leadSource"
              innerRadius={60}
              strokeWidth={5}
              {...(typeof activeIndex === "number"
                ? {
                    activeIndex,
                    activeShape: ({
                      outerRadius = 0,
                      ...props
                    }: PieSectorDataItem) => (
                      <g>
                        <Sector {...props} outerRadius={outerRadius + 5} />
                        <Sector
                          {...props}
                          outerRadius={outerRadius + 25}
                          innerRadius={outerRadius + 12}
                        />
                      </g>
                    ),
                  }
                : {})}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const displayCount =
                      typeof activeIndex === "number"
                        ? computedData[activeIndex]?.count ?? 0
                        : totalCount;
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {Number(displayCount).toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Clients
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            <Legend/>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

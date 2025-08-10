import React from "react";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";

export interface MetricCardProps {
  description: string;
  /** Pre-formatted value to display */
  value: React.ReactNode;
  /** Percentage delta to previous period (optional) */
  delta?: number;
}

/** Small utility to format the delta percentage consistent across pages */
function formatDelta(v?: number) {
  if (v === undefined) return "--";
  if (!isFinite(v)) return "∞%";
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}

const DeltaBadge: React.FC<{ value?: number; className?: string }> = ({ value, className }) => {
  if (value === undefined) return null;
  return (
    <Badge
      variant="outline"
      className={`flex gap-1 rounded-lg text-xs ${className ?? ""}`.trim()}
    >
      {value < 0 ? (
        <TrendingDownIcon className="size-3" />
      ) : (
        <TrendingUpIcon className="size-3" />
      )}
      {formatDelta(value)}
    </Badge>
  );
};

export const MetricCardBold: React.FC<MetricCardProps> = ({
  description,
  value,
  delta,
}) => {
  return (
    <Card className="@container/card bg-primary text-primary-foreground">
      <CardHeader className="relative">
        <CardDescription className="text-primary-foreground">{description}</CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {value}
        </CardTitle>
        {delta !== undefined && (
          <div className="absolute right-4 top-4">
            <DeltaBadge className="bg-primary-foreground text-primary border-primary-foreground" value={delta} />
          </div>
        )}
      </CardHeader>
    </Card>
  );
}; 
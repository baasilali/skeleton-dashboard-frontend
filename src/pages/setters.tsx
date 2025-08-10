import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// Icons removed from this file; handled inside MetricCard component

import {
  DashboardFiltersProvider,
  useDashboardFilters,
} from "@/contexts/select-filters";

import { DateRangePicker } from "@/components/ui/date-range-picker";
import { FilterSelect } from "../components/filter-select";
import {
  calculateKPIs,
  getFilterValues,
  getCloseRateTrendChartData,
  getDealStatusBreakdownChartData,
  getCloserCommission,
  getSetterCommission,
  getShowRateTrendChartData,
  getSetterTableData,
} from "@/lib/eoc/data";
import { MetricCardBold } from "@/components/metric-card-bold";
import { MetricCard } from "@/components/metric-card";
import { InteractivePieChart } from "@/components/charts/pie-chart";
import React from "react";
import { InteractiveLineChart } from "@/components/charts/line-chart";
import { SetterCloserTable } from "@/components/tables/setter-closer-table";

function FilterSelects() {
  const { filters, setFilter } = useDashboardFilters();
  const { platforms, coaches, closers, setters } = getFilterValues();

  return (
    <div className="flex gap-2 px-4">
      <div>
        <DateRangePicker
          onUpdate={({ range }) => {
            setFilter("dateFrom", range.from);
            setFilter("dateTo", range.to ?? range.from);
          }}
          // no default dates
          align="start"
          locale="en-US"
          showCompare={false}
        />
      </div>
      <div>
        <FilterSelect
          value={filters.platform ?? ""}
          onValueChange={(v) => {
            if (v === "__reset") {
              setFilter("platform", "");
            } else {
              setFilter("platform", v);
            }
          }}
          placeholder="Select Platform"
          label="Platform"
          options={platforms.map((p) => ({
            value: p,
            label: p,
          }))}
        />
      </div>
      <div>
        <FilterSelect
          value={filters.coach ?? ""}
          onValueChange={(v) => {
            if (v === "__reset") {
              setFilter("coach", "");
            } else {
              setFilter("coach", v);
            }
          }}
          placeholder="Select Coach"
          label="Coach"
          options={coaches.map((p) => ({
            value: p,
            label: p,
          }))}
        />
      </div>
      <div>
        <FilterSelect
          value={filters.closer ?? ""}
          onValueChange={(v) => {
            if (v === "__reset") {
              setFilter("closer", "");
            } else {
              setFilter("closer", v);
            }
          }}
          placeholder="Select Closer"
          label="Closer"
          options={closers.map((p) => ({
            value: p,
            label: p,
          }))}
        />
      </div>
      <div>
        <FilterSelect
          value={filters.setter ?? ""}
          onValueChange={(v) => {
            if (v === "__reset") {
              setFilter("setter", "");
            } else {
              setFilter("setter", v);
            }
          }}
          placeholder="Select Setter"
          label="Setter"
          options={setters.map((p) => ({
            value: p,
            label: p,
          }))}
        />
      </div>
    </div>
  );
}

function SettersBody() {
  const { filters } = useDashboardFilters();
  const kpis = React.useMemo(() => calculateKPIs(filters), [filters]);

  const showRateTrendData = React.useMemo(
    () => getShowRateTrendChartData(filters),
    [filters]
  );

  const outcomeData = React.useMemo(
    () => getDealStatusBreakdownChartData(filters),
    [filters]
  );

  const setterCommission = React.useMemo(
    () => getSetterCommission(filters),
    [filters]
  );

  const setterTableData = React.useMemo(
    () => getSetterTableData(filters),
    [filters]
  );
  
  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  // DeltaBadge functionality is now handled inside MetricCard, so local helpers removed.

  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <FilterSelects />
          <div className="flex flex-1 flex-col gap-4 p-4 mt-4">
            <div className="flex flex-1 flex-col gap-4">
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                Key Metrics
              </h3>
              <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                <MetricCardBold
                  description="Cash Collected"
                  value={currency.format(kpis.cashCollected)}
                  delta={12}
                />
                <MetricCard
                  description="Revenue Generated"
                  value={currency.format(kpis.revenueGenerated)}
                  delta={12}
                />
              </div>
              <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <MetricCard
                  description="Setter Commission"
                  value={currency.format(setterCommission)}
                  delta={12}
                />
                <MetricCard
                  description="Avg Cash / Call"
                  value={currency.format(kpis.avgCashPerCall)}
                  delta={12}
                />
                <MetricCard
                  description="Avg Cash / Close"
                  value={currency.format(kpis.avgCashPerClose)}
                  delta={12}
                />
              </div>
              <div className="grid auto-rows-min gap-4 md:grid-cols-5">
                <MetricCard
                  description="Close Rate"
                  value={`${kpis.closeRate.toFixed(0)}%`}
                  delta={5}
                />
                <MetricCard
                  description="Show Rate"
                  value={`${kpis.showRate.toFixed(0)}%`}
                  delta={12}
                />
                <MetricCard
                  description="Calls Due"
                  value={`${kpis.callsDue}`}
                  delta={12}
                />
                <MetricCard
                  description="Calls Taken"
                  value={`${kpis.callsTaken}`}
                  delta={12}
                />
                <MetricCard
                  description="Calls Closed"
                  value={`${kpis.callsClosed}`}
                  delta={12}
                />
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-4 mt-4">
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                Performance
              </h3>
              <div className="grid auto-rows-min gap-4 md:grid-cols-1">
                <InteractiveLineChart title="Show Rate Trend" data={showRateTrendData} />
              </div>
              <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                <SetterCloserTable data={setterTableData} title="Setter Performance" />
                <InteractivePieChart title={"Deal Status Breakdown"} allLabel="Select Status" data={outcomeData} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default function Setters() {
  return (
    <DashboardFiltersProvider>
      <SettersBody />
    </DashboardFiltersProvider>
  );
}

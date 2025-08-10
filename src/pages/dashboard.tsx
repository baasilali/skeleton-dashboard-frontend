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
import { getCashCollectedChartData, calculateKPIs, getLeadSourceBreakdownChartData, getTableData, getFilterValues } from "@/lib/eoc/data";
import { MetricCardBold } from "@/components/metric-card-bold";
import { MetricCard } from "@/components/metric-card";
import { DateChart } from "@/components/charts/date-chart";
import { InteractivePieChart } from "@/components/charts/pie-chart";
import { DataTable } from "@/components/tables/prospect-table";
import React from "react";

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

function DashboardBody() {
  const { filters } = useDashboardFilters();
  const kpis = React.useMemo(() => calculateKPIs(filters), [filters]);
  const cashCollectedData = React.useMemo(
    () => getCashCollectedChartData(filters),
    [filters]
  );
  const leadSourceData = React.useMemo(
    () => getLeadSourceBreakdownChartData(filters),
    [filters]
  );
  const tableData = React.useMemo(() => getTableData(filters), [filters]);
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
							<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Key Metrics</h3>
              <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                <MetricCardBold description="Cash Collected" value={currency.format(kpis.cashCollected)} delta={12} />
                <MetricCard description="Revenue Generated" value={currency.format(kpis.revenueGenerated)} delta={12} />
              </div>
              <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                <MetricCard description="Avg Cash / Call" value={currency.format(kpis.avgCashPerCall)} delta={12} />
                <MetricCard description="Avg Cash / Close" value={currency.format(kpis.avgCashPerClose)} delta={12} />
              </div>
              <div className="grid auto-rows-min gap-4 md:grid-cols-5">
                <MetricCard description="Close Rate" value={`${kpis.closeRate.toFixed(0)}%`} delta={5} />
                <MetricCard description="Show Rate" value={`${kpis.showRate.toFixed(0)}%`} delta={12} />
                <MetricCard description="Calls Due" value={`${kpis.callsDue}`} delta={12} />
                <MetricCard description="Calls Taken" value={`${kpis.callsTaken}`} delta={12} />
                <MetricCard description="Calls Closed" value={`${kpis.callsClosed}`} delta={12} />
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-4 mt-4">
							<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Performance</h3>
              <div className="grid auto-rows-min gap-4 md:grid-cols-1">
                <DateChart title={"Cash Collected"} data={cashCollectedData} />
              </div>
              <div className="grid auto-rows-min gap-4 md:grid-cols-1">
                <InteractivePieChart title={"Lead Source Breakdown"} data={leadSourceData} />
              </div>
              <div className="grid auto-rows-min gap-4 md:grid-cols-1">
                <DataTable title={"Calls"} data={tableData} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default function Dashboard() {
  return (
    <DashboardFiltersProvider>
      <DashboardBody />
    </DashboardFiltersProvider>
  );
}

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
import { MetricCardBold } from "@/components/metric-card-bold";
import { MetricCard } from "@/components/metric-card";
import React from "react";
import { getApplicantSourceChartData, getCashOnHandChartData, getFilterValues, getLeadTrendData, getTopPlatform, getTotalLeads } from "@/lib/leads/data";
import { InteractiveLineChart } from "@/components/charts/line-chart";
import { SideBarChart } from "@/components/charts/side-bar-chart";
import { InteractivePieChart } from "@/components/charts/pie-chart";

function FilterSelects() {
  const { filters, setFilter } = useDashboardFilters();
  const { platforms, funnels, coaches } = getFilterValues();

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
          value={filters.funnel ?? ""}
          onValueChange={(v) => {
            if (v === "__reset") {
              setFilter("funnel", "");
            } else {
              setFilter("funnel", v);
            }
          }}
          placeholder="Select Funnel"
          label="Funnel"
          options={funnels.map((p) => ({
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
    </div>
  );
}

function LeadsBody() {
  const { filters } = useDashboardFilters();
  const leadTrendData = React.useMemo(
    () => getLeadTrendData(filters),
    [filters]
  );
  const totalLeads = React.useMemo(
    () => getTotalLeads(filters),
    [filters]
  );
  const topPlatform = React.useMemo(
    () => getTopPlatform(filters),
    [filters]
  );
  const cashOnHandChartData = React.useMemo(
    () => getCashOnHandChartData(filters),
    [filters]
  );
  const applicantSourceChartData = React.useMemo(
    () => getApplicantSourceChartData(filters),
    [filters]
  );

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
                  description="Total Leads"
                  value={totalLeads}
                  delta={12}
                />
                <MetricCard
                  description="Top Platform"
                  value={topPlatform}
                  delta={12}
                />
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-4 mt-4">
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                Performance
              </h3>
              <div className="grid auto-rows-min gap-4 md:grid-cols-1">
                <InteractiveLineChart title="Leads Trend" data={leadTrendData} />
              </div>
              <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                <SideBarChart title={"Cash on Hand"} data={cashOnHandChartData} />
                <InteractivePieChart title={"Applicant Source"} data={applicantSourceChartData} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default function Leads() {
  return (
    <DashboardFiltersProvider>
      <LeadsBody />
    </DashboardFiltersProvider>
  );
}

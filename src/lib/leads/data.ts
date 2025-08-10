import { leads_data } from "../../dummy/leads-data";
import { parseBackendDate } from "../utils";

export type DataFilters = {
  platform?: string;
  funnel?: string;
  coach?: string;
  closer?: string;
  setter?: string;
  dateFrom?: Date;
  dateTo?: Date;
};

export type LeadTrend = {
  date: string;
  closeRate: number;
};

export type CashOnHandChartData = {
  browser: string; // category label consumed by SideBarChart's YAxis
  visitors: number; // count consumed by SideBarChart's XAxis and Bar
}

export function getFilterValues(): {
  platforms: string[];
  funnels: string[];
  coaches: string[];
} {
  const platformSet = new Set<string>();
  const funnelSet = new Set<string>();
  const coachSet = new Set<string>();

  for (const row of leads_data) {
    const platform = String(row["Source"] || "").trim();
    const coach = String(row["Coach"] || "").trim();
    const funnel = String(row["Funnel"] || "").trim();

    if (platform) platformSet.add(platform);
    if (funnel) funnelSet.add(funnel);
    if (coach) coachSet.add(coach);
  }

  const toSortedArray = (s: Set<string>) =>
    Array.from(s).sort((a, b) => a.localeCompare(b));

  return {
    platforms: toSortedArray(platformSet),
    funnels: toSortedArray(funnelSet),
    coaches: toSortedArray(coachSet),
  };
}

export function getLeadTrendData(filters: DataFilters = {}): LeadTrend[] {
  const rows = filterData(leads_data, filters);
  const dateToCount = new Map<string, number>();

  for (const row of rows) {
    const rawTimestamp = String(row["Timestamp"] || "").trim();
    if (!rawTimestamp) continue;

    // Keep the original date portion exactly as provided (e.g., M/D/YYYY)
    const dateKey = rawTimestamp.split(" ")[0] || "";
    if (!dateKey) continue;

    // Validate the date using parseBackendDate to avoid invalid entries
    const parsed = parseBackendDate(dateKey);
    if (!parsed) continue;

    if (!dateToCount.has(dateKey)) {
      dateToCount.set(dateKey, 0);
    }
    dateToCount.set(dateKey, (dateToCount.get(dateKey) || 0) + 1);
  }

  return Array.from(dateToCount.entries())
    .map(([date, total]) => ({ date, closeRate: total }))
    .sort((a, b) => {
      const da = parseBackendDate(a.date)?.getTime() ?? 0;
      const db = parseBackendDate(b.date)?.getTime() ?? 0;
      return da - db;
    });
}

export function filterData<T extends Record<string, any>>(
  rows: T[],
  filters: DataFilters
): T[] {
  const normalize = (v: unknown) =>
    String(v ?? "")
      .trim()
      .toLowerCase();

  return rows.filter((row) => {
    // Date filters using the raw backend "Timestamp" value
    const rawTs = String(row["Timestamp"] ?? "").trim();
    if (!rawTs) return false;
    const ts = rawTs ? parseBackendDate(rawTs) : null;

    if (filters.dateFrom && ts && ts < filters.dateFrom) return false;
    if (filters.dateTo && ts && ts > filters.dateTo) return false;

    if (
      filters.platform &&
      normalize(row["Source"]) !== normalize(filters.platform)
    ) {
      return false;
    }

    // Funnel
    if (
      filters.funnel &&
      normalize(row["Funnel"]) !== normalize(filters.funnel)
    ) {
      return false;
    }

    // Coach Name
    if (
      filters.coach &&
      normalize(row["Coach"]) !== normalize(filters.coach)
    ) {
      return false;
    }

    return true;
  });
}

export function getTotalLeads(filters: DataFilters = {}): number {
  const rows = filterData(leads_data, filters);
  return rows.length;
}

export function getTopPlatform(filters: DataFilters = {}): string {
  const rows = filterData(leads_data, filters);
  const sourceToCount = new Map<string, number>();

  for (const row of rows) {
    const source = String(row["Source"] || "").trim();
    if (!source) continue;
    if (!sourceToCount.has(source)) {
      sourceToCount.set(source, 0);
    }
    sourceToCount.set(source, (sourceToCount.get(source) || 0) + 1);
  }

  let topSource = "";
  let topCount = -1;
  for (const [source, count] of sourceToCount.entries()) {
    if (count > topCount) {
      topSource = source;
      topCount = count;
    }
  }

  return topSource;
}

export function getCashOnHandChartData(filters: DataFilters = {}): CashOnHandChartData[] {
    const rows = filterData(leads_data, filters);
    const valueToCount = new Map<string, number>();

    for (const row of rows) {
        const value = String(row["Willing to Invest"] || "").trim();
        if (!value) continue;
        valueToCount.set(value, (valueToCount.get(value) || 0) + 1);
    }

    return Array.from(valueToCount.entries())
      .map(([browser, visitors]) => ({ browser, visitors }))
      .sort((a, b) => b.visitors - a.visitors);
}

export function getApplicantSourceChartData(filters: DataFilters = {}) {
    const leadSourceToCount = new Map<string, number>();
    const rows = filterData(leads_data, filters);
  
    for (const row of rows) {
      const leadSource = String(row["Source"] || "").trim();
      if (!leadSource) continue;
  
      const normalized = leadSource; // keep label as-is for display
      if (!leadSourceToCount.has(normalized)) {
        leadSourceToCount.set(normalized, 0);
      }
      leadSourceToCount.set(
        normalized,
        (leadSourceToCount.get(normalized) || 0) + 1
      );
    }
  
    return Array.from(leadSourceToCount.entries())
      .map(([leadSource, count]) => ({ leadSource, count }))
      .filter((d) => d.count !== 0)
      .sort((a, b) => b.count - a.count);
}
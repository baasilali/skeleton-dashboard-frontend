import { eoc_data } from "../../dummy/eoc-data";
import { parseBackendDate } from "../utils";
import { coachInfoMap, setterInfoMap } from "./employee_info";
import { closerInfoMap } from "./employee_info";

export interface KPIs {
  cashCollected: number;
  revenueGenerated: number;
  closeRate: number;
  showRate: number;
  callsDue: number;
  callsTaken: number;
  callsClosed: number;
  avgCashPerCall: number;
  avgCashPerClose: number;
}

export type Client = {
  id: string;
  date: string;
  closer: string;
  setter: string;
  prospect: string;
  outcome: string;
  cashCollected: number;
  coach: string;
  platform: string;
};

export type DataFilters = {
  platform?: string;
  coach?: string;
  closer?: string;
  setter?: string;
  dateFrom?: Date;
  dateTo?: Date;
};

export function calculateKPIs(filters: DataFilters = {}): KPIs {
  const kpis: KPIs = {
    cashCollected: 0,
    revenueGenerated: 0,
    closeRate: 0,
    showRate: 0,
    callsDue: 0,
    callsTaken: 0,
    callsClosed: 0,
    avgCashPerCall: 0,
    avgCashPerClose: 0,
  };

  const rows = filterData(eoc_data, filters);

  let cashFromCalls = 0;
  let cashFromCloses = 0;

  for (const row of rows) {
    const cash =
      parseFloat(
        String(row["Cash Collected"] || "0").replace(/[^0-9.-]+/g, "")
      ) || 0;
    kpis.cashCollected += cash;
    kpis.revenueGenerated +=
      parseFloat(
        String(row["Revenue Generated"] || "0").replace(/[^0-9.-]+/g, "")
      ) || 0;

    const outcome = row["Call Outcome"].trim();

    // Calls Due: exclude Cancelled, Rescheduled, MRR
    if (!["Cancelled", "Rescheduled", "MRR"].includes(outcome)) {
      kpis.callsDue += 1;
    }
    // Calls Taken: exclude Cancelled, Rescheduled, No Show, MRR, Deposit Collected
    if (
      ![
        "Cancelled",
        "Rescheduled",
        "No Show",
        "MRR",
        "Deposit Collected",
        "Deposit collected",
      ].includes(outcome)
    ) {
      cashFromCalls += cash;
      kpis.callsTaken += 1;
    }

    if (outcome === "Closed") {
      cashFromCloses += cash;
      kpis.callsClosed += 1;
    }
  }

  kpis.closeRate = kpis.callsTaken
    ? (kpis.callsClosed / kpis.callsTaken) * 100
    : 0;
  kpis.showRate = kpis.callsDue ? (kpis.callsTaken / kpis.callsDue) * 100 : 0;

  kpis.avgCashPerCall = kpis.callsTaken ? cashFromCalls / kpis.callsTaken : 0;
  kpis.avgCashPerClose = kpis.callsClosed
    ? cashFromCloses / kpis.callsClosed
    : 0;

  return kpis;
}

export function getPlatformNames() {
  // remove empty strings
  const platforms = Array.from(new Set(eoc_data.map((row) => row["Platform"])));
  return platforms.filter((p) => p !== "");
}

export function getFilterValues(): {
  platforms: string[];
  coaches: string[];
  closers: string[];
  setters: string[];
} {
  const platformSet = new Set<string>();
  const coachSet = new Set<string>();
  const closerSet = new Set<string>();
  const setterSet = new Set<string>();

  for (const row of eoc_data) {
    const platform = String(row["Platform"] || "").trim();
    const coach = String(row["Coach Name"] || "").trim();
    const closer = String(row["Closer Name"] || "").trim();
    const setter = String(row["Setter Name"] || "").trim();

    if (platform) platformSet.add(platform);
    if (coach) coachSet.add(coach);
    if (closer) closerSet.add(closer);
    if (setter) setterSet.add(setter);
  }

  const toSortedArray = (s: Set<string>) =>
    Array.from(s).sort((a, b) => a.localeCompare(b));

  return {
    platforms: toSortedArray(platformSet),
    coaches: toSortedArray(coachSet),
    closers: toSortedArray(closerSet),
    setters: toSortedArray(setterSet),
  };
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

    // Platform
    if (
      filters.platform &&
      normalize(row["Platform"]) !== normalize(filters.platform)
    ) {
      return false;
    }

    // Coach Name
    if (
      filters.coach &&
      normalize(row["Coach Name"]) !== normalize(filters.coach)
    ) {
      return false;
    }

    // Closer Name
    if (
      filters.closer &&
      normalize(row["Closer Name"]) !== normalize(filters.closer)
    ) {
      return false;
    }

    // Setter Name
    if (
      filters.setter &&
      normalize(row["Setter Name"]) !== normalize(filters.setter)
    ) {
      return false;
    }

    return true;
  });
}

export function getCashCollectedChartData(filters: DataFilters = {}) {
  const dateToCashTotal = new Map<string, number>();
  const rows = filterData(eoc_data, filters);

  for (const row of rows) {
    const rawTimestamp = String(row["Timestamp"] || "").trim();
    if (!rawTimestamp) continue;

    // Keep the original date portion exactly as provided (M/D/YYYY)
    const dateKey = rawTimestamp.split(" ")[0] || "";
    if (!dateKey) continue;

    // Validate date format without converting/outputting ISO to avoid TZ shifts
    const parsed = parseBackendDate(dateKey);
    if (!parsed) continue;

    const cash =
      parseFloat(
        String(row["Cash Collected"] || "0").replace(/[^0-9.-]+/g, "")
      ) || 0;

    if (!dateToCashTotal.has(dateKey)) {
      dateToCashTotal.set(dateKey, 0);
    }
    dateToCashTotal.set(dateKey, (dateToCashTotal.get(dateKey) || 0) + cash);
  }

  // Build array, omit zero-sum days, and sort chronologically using parsed date
  return Array.from(dateToCashTotal.entries())
    .map(([date, cash]) => ({ date, cash }))
    .filter((d) => d.cash !== 0)
    .sort((a, b) => {
      const da = parseBackendDate(a.date)?.getTime() ?? 0;
      const db = parseBackendDate(b.date)?.getTime() ?? 0;
      return da - db;
    });
}

export function getLeadSourceBreakdownChartData(filters: DataFilters = {}) {
  const leadSourceToCount = new Map<string, number>();
  const rows = filterData(eoc_data, filters);

  for (const row of rows) {
    const leadSource = String(row["Platform"] || "").trim();
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

export function getFunnelBreakdownChartData(filters: DataFilters = {}) {
  const funnelToCount = new Map<string, number>();
  const rows = filterData(eoc_data, filters);

  for (const row of rows) {
    const funnel = String(row["Funnel"] || "").trim();
    if (!funnel) continue;

    const normalized = funnel; // keep label as-is for display
    if (!funnelToCount.has(normalized)) {
      funnelToCount.set(normalized, 0);
    }
    funnelToCount.set(normalized, (funnelToCount.get(normalized) || 0) + 1);
  }

  return Array.from(funnelToCount.entries())
    .map(([leadSource, count]) => ({ leadSource, count }))
    .filter((d) => d.count !== 0)
    .sort((a, b) => b.count - a.count);
}

export function getProspectSituationChartData(filters: DataFilters = {}) {
  const situationToCount = new Map<string, number>();
  const rows = filterData(eoc_data, filters);

  for (const row of rows) {
    const situation = String(row["Situation"] || "").trim();
    if (!situation) continue;

    const normalized = situation; // keep label as-is for display
    if (!situationToCount.has(normalized)) {
      situationToCount.set(normalized, 0);
    }
    situationToCount.set(
      normalized,
      (situationToCount.get(normalized) || 0) + 1
    );
  }

  return Array.from(situationToCount.entries())
    .map(([leadSource, count]) => ({ leadSource, count }))
    .filter((d) => d.count !== 0)
    .sort((a, b) => b.count - a.count);
}

export function getDealStatusBreakdownChartData(filters: DataFilters = {}) {
  const outcomeToCount = new Map<string, number>();
  const rows = filterData(eoc_data, filters);

  for (const row of rows) {
    const callOutcome = String(row["Call Outcome"] || "").trim();
    if (!callOutcome) continue;

    const normalized = callOutcome; // keep label as-is for display
    if (!outcomeToCount.has(normalized)) {
      outcomeToCount.set(normalized, 0);
    }
    outcomeToCount.set(normalized, (outcomeToCount.get(normalized) || 0) + 1);
  }

  return Array.from(outcomeToCount.entries())
    .map(([leadSource, count]) => ({ leadSource, count }))
    .filter((d) => d.count !== 0)
    .sort((a, b) => b.count - a.count);
}

export function getTableData(filters: DataFilters = {}): Client[] {
  const rows: Client[] = [];

  // Start from filtered raw rows and sort by Timestamp descending
  const sortedByTimestamp = [...filterData(eoc_data, filters)].sort((a, b) => {
    const aTs = String(a["Timestamp"] || "").trim();
    const bTs = String(b["Timestamp"] || "").trim();
    const aTime = aTs ? new Date(aTs).getTime() : 0;
    const bTime = bTs ? new Date(bTs).getTime() : 0;
    return bTime - aTime;
  });

  sortedByTimestamp.forEach((row, index) => {
    const timestamp = String(row["Timestamp"] || "").trim();
    const prospect = String(row["Prospect Name"] || "").trim();

    // Skip clearly empty rows
    if (!timestamp && !prospect) {
      return;
    }

    const date = (timestamp.split(" ")[0] || "").trim();

    const client: Client = {
      id: `c${index + 1}`,
      date,
      closer: String(row["Closer Name"] || "").trim(),
      setter: String(row["Setter Name"] || "").trim(),
      prospect,
      outcome: String(row["Call Outcome"] || "").trim(),
      cashCollected:
        parseFloat(
          String(row["Cash Collected"] || "0").replace(/[^0-9.-]+/g, "")
        ) || 0,
      coach: String(row["Coach Name"] || "").trim(),
      platform: String(row["Platform"] || "").trim(),
    };

    rows.push(client);
  });

  return rows;
}

export function getCloserCommission(filters: DataFilters = {}) {
  const rows = filterData(eoc_data, filters);
  let totalCashCollected = 0;

  for (const row of rows) {
    const cash =
      parseFloat(
        String(row["Cash Collected"] || "0").replace(/[^0-9.-]+/g, "")
      ) || 0;
    const closer = String(row["Closer Name"] || "").trim();
    if (!closer) continue;

    totalCashCollected += cash * closerInfoMap[closer].commission;
  }

  return totalCashCollected;
}

export function getCloseRateTrendChartData(filters: DataFilters = {}) {
  const dateToCounts = new Map<string, { taken: number; closed: number }>();
  const rows = filterData(eoc_data, filters);

  for (const row of rows) {
    const rawTimestamp = String(row["Timestamp"] || "").trim();
    if (!rawTimestamp) continue;

    // Keep the original date portion exactly as provided (M/D/YYYY)
    const dateKey = rawTimestamp.split(" ")[0] || "";
    if (!dateKey) continue;

    // Validate date format without converting/outputting ISO to avoid TZ shifts
    const parsed = parseBackendDate(dateKey);
    if (!parsed) continue;

    const outcome = row["Call Outcome"].trim();

    if (!dateToCounts.has(dateKey)) {
      dateToCounts.set(dateKey, { taken: 0, closed: 0 });
    }

    const counts = dateToCounts.get(dateKey)!;

    // Calls Taken: exclude Cancelled, Rescheduled, No Show, MRR, Deposit Collected (case variations)
    if (
      ![
        "Cancelled",
        "Rescheduled",
        "No Show",
        "MRR",
        "Deposit Collected",
        "Deposit collected",
      ].includes(outcome)
    ) {
      counts.taken += 1;
    }

    if (outcome === "Closed") {
      counts.closed += 1;
    }
  }

  // Build array, include only days with at least one call taken, and sort chronologically
  return Array.from(dateToCounts.entries())
    .map(([date, { taken, closed }]) => ({
      date,
      closeRate: taken ? (closed / taken) * 100 : 0,
    }))
    .filter((d) => {
      const taken = dateToCounts.get(d.date)?.taken ?? 0;
      return taken > 0;
    })
    .sort((a, b) => {
      const da = parseBackendDate(a.date)?.getTime() ?? 0;
      const db = parseBackendDate(b.date)?.getTime() ?? 0;
      return da - db;
    });
}

export function getSetterCommission(filters: DataFilters = {}) {
  const rows = filterData(eoc_data, filters);
  let totalCashCollected = 0;

  for (const row of rows) {
    const cash =
      parseFloat(
        String(row["Cash Collected"] || "0").replace(/[^0-9.-]+/g, "")
      ) || 0;
    const setter = String(row["Setter Name"] || "").trim();
    if (!setter) continue;

    totalCashCollected += cash * setterInfoMap[setter].commission;
  }

  return totalCashCollected;
}

export function getShowRateTrendChartData(filters: DataFilters = {}) {
  const dateToCounts = new Map<string, { taken: number; due: number }>();
  const rows = filterData(eoc_data, filters);

  for (const row of rows) {
    const rawTimestamp = String(row["Timestamp"] || "").trim();
    if (!rawTimestamp) continue;

    // Keep the original date portion exactly as provided (M/D/YYYY)
    const dateKey = rawTimestamp.split(" ")[0] || "";
    if (!dateKey) continue;

    // Validate date format without converting/outputting ISO to avoid TZ shifts
    const parsed = parseBackendDate(dateKey);
    if (!parsed) continue;

    const outcome = row["Call Outcome"].trim();

    if (!dateToCounts.has(dateKey)) {
      dateToCounts.set(dateKey, { taken: 0, due: 0 });
    }

    const counts = dateToCounts.get(dateKey)!;

    // kpis.showRate = kpis.callsDue ? (kpis.callsTaken / kpis.callsDue) * 100 : 0;
    // Calls Taken: exclude Cancelled, Rescheduled, No Show, MRR, Deposit Collected (case variations)
    if (
      ![
        "Cancelled",
        "Rescheduled",
        "No Show",
        "MRR",
        "Deposit Collected",
        "Deposit collected",
      ].includes(outcome)
    ) {
      counts.taken += 1;
    }

    if (!["Cancelled", "Rescheduled", "MRR"].includes(outcome)) {
      counts.due += 1;
    }
  }

  // Build array, include only days with at least one call taken, and sort chronologically
  return Array.from(dateToCounts.entries())
    .map(([date, { taken, due }]) => ({
      date,
      closeRate: due ? (taken / due) * 100 : 0,
    }))
    .filter((d) => {
      const taken = dateToCounts.get(d.date)?.taken ?? 0;
      return taken > 0;
    })
    .sort((a, b) => {
      const da = parseBackendDate(a.date)?.getTime() ?? 0;
      const db = parseBackendDate(b.date)?.getTime() ?? 0;
      return da - db;
    });
}

export type SetterCloser = {
  id: string;
  name: string;
  totalCashCollected: number;
  avgCashPerCall: number;
  avgCashPerClose: number;
};

export function getSetterTableData(filters: DataFilters = {}): SetterCloser[] {
  const rows = filterData(eoc_data, filters);

  const setterToStats = new Map<
    string,
    {
      totalCash: number;
      cashFromTaken: number;
      cashFromClosed: number;
      callsTaken: number;
      callsClosed: number;
    }
  >();

  for (const row of rows) {
    const setterName = String(row["Setter Name"] || "").trim();
    if (!setterName) continue;

    const cash =
      parseFloat(
        String(row["Cash Collected"] || "0").replace(/[^0-9.-]+/g, "")
      ) || 0;
    const outcome = String(row["Call Outcome"] || "").trim();

    if (!setterToStats.has(setterName)) {
      setterToStats.set(setterName, {
        totalCash: 0,
        cashFromTaken: 0,
        cashFromClosed: 0,
        callsTaken: 0,
        callsClosed: 0,
      });
    }

    const stats = setterToStats.get(setterName)!;
    stats.totalCash += cash;

    // Calls Taken: exclude Cancelled, Rescheduled, No Show, MRR, Deposit Collected (case variations)
    if (
      ![
        "Cancelled",
        "Rescheduled",
        "No Show",
        "MRR",
        "Deposit Collected",
        "Deposit collected",
      ].includes(outcome)
    ) {
      stats.callsTaken += 1;
      stats.cashFromTaken += cash;
    }

    if (outcome === "Closed") {
      stats.callsClosed += 1;
      stats.cashFromClosed += cash;
    }
  }

  const toId = (name: string) =>
    `setter-${name.toLowerCase().replace(/\s+/g, "-")}`;

  return Array.from(setterToStats.entries())
    .map(
      ([
        name,
        { totalCash, cashFromTaken, cashFromClosed, callsTaken, callsClosed },
      ]) => ({
        id: toId(name),
        name,
        totalCashCollected: totalCash,
        avgCashPerCall: callsTaken ? cashFromTaken / callsTaken : 0,
        avgCashPerClose: callsClosed ? cashFromClosed / callsClosed : 0,
      })
    )
    .sort((a, b) => b.totalCashCollected - a.totalCashCollected);
}

export function getCloserTableData(filters: DataFilters = {}): SetterCloser[] {
  const rows = filterData(eoc_data, filters);

  const closerToStats = new Map<
    string,
    {
      totalCash: number;
      cashFromTaken: number;
      cashFromClosed: number;
      callsTaken: number;
      callsClosed: number;
    }
  >();

  for (const row of rows) {
    const closerName = String(row["Closer Name"] || "").trim();
    if (!closerName) continue;

    const cash =
      parseFloat(
        String(row["Cash Collected"] || "0").replace(/[^0-9.-]+/g, "")
      ) || 0;
    const outcome = String(row["Call Outcome"] || "").trim();

    if (!closerToStats.has(closerName)) {
      closerToStats.set(closerName, {
        totalCash: 0,
        cashFromTaken: 0,
        cashFromClosed: 0,
        callsTaken: 0,
        callsClosed: 0,
      });
    }

    const stats = closerToStats.get(closerName)!;
    stats.totalCash += cash;

    // Calls Taken: exclude Cancelled, Rescheduled, No Show, MRR, Deposit Collected (case variations)
    if (
      ![
        "Cancelled",
        "Rescheduled",
        "No Show",
        "MRR",
        "Deposit Collected",
        "Deposit collected",
      ].includes(outcome)
    ) {
      stats.callsTaken += 1;
      stats.cashFromTaken += cash;
    }

    if (outcome === "Closed") {
      stats.callsClosed += 1;
      stats.cashFromClosed += cash;
    }
  }

  const toId = (name: string) =>
    `closer-${name.toLowerCase().replace(/\s+/g, "-")}`;

  return Array.from(closerToStats.entries())
    .map(
      ([
        name,
        { totalCash, cashFromTaken, cashFromClosed, callsTaken, callsClosed },
      ]) => ({
        id: toId(name),
        name,
        totalCashCollected: totalCash,
        avgCashPerCall: callsTaken ? cashFromTaken / callsTaken : 0,
        avgCashPerClose: callsClosed ? cashFromClosed / callsClosed : 0,
      })
    )
    .sort((a, b) => b.totalCashCollected - a.totalCashCollected);
}

export function getCoachCommission(filters: DataFilters = {}) {
	const rows = filterData(eoc_data, filters);
	let totalCashCollected = 0;
  
	for (const row of rows) {
	  const cash =
		parseFloat(
		  String(row["Cash Collected"] || "0").replace(/[^0-9.-]+/g, "")
		) || 0;
	  const coach = String(row["Coach Name"] || "").trim();
	  if (!coach) continue;
  
	  totalCashCollected += cash * coachInfoMap[coach].commission;
	}
  
	return totalCashCollected;
}

export function getCoachLeadsBreakdownChartData(filters: DataFilters = {}) {
  const coachToCount = new Map<string, number>();
  const rows = filterData(eoc_data, filters);

  for (const row of rows) {
    const coach = String(row["Coach Name"] || "").trim();
    if (!coach) continue;

    if (!coachToCount.has(coach)) {
      coachToCount.set(coach, 0);
    }
    coachToCount.set(coach, (coachToCount.get(coach) || 0) + 1);
  }

  return Array.from(coachToCount.entries())
    .map(([leadSource, count]) => ({ leadSource, count }))
    .filter((d) => d.count !== 0)
    .sort((a, b) => b.count - a.count);
}
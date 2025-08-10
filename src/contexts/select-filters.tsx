import React from "react";

// Define the shape of your filters here. Extend as needed.
export type DashboardFilters = {
  client?: string;
  platform?: string;
  funnel?: string;
  coach?: string;
  closer?: string;
  setter?: string;
  dateFrom?: Date;
  dateTo?: Date;
};

type DashboardFiltersContextValue = {
  filters: DashboardFilters;
  setFilter: (key: keyof DashboardFilters, value: any) => void;
};

const DashboardFiltersContext = React.createContext<DashboardFiltersContextValue | undefined>(
  undefined
);

export const DashboardFiltersProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [filters, setFilters] = React.useState<DashboardFilters>({});

  const setFilter = React.useCallback(
    (key: keyof DashboardFilters, value: any) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const value = React.useMemo(() => ({ filters, setFilter }), [filters, setFilter]);

  return (
    <DashboardFiltersContext.Provider value={value}>
      {children}
    </DashboardFiltersContext.Provider>
  );
};

export function useDashboardFilters() {
  const context = React.useContext(DashboardFiltersContext);
  if (!context) {
    throw new Error("useDashboardFilters must be used within a DashboardFiltersProvider");
  }
  return context;
} 
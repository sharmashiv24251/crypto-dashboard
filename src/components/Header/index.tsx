// src/components/Header.tsx
import React, { useMemo } from "react";
import HeaderChart from "./HeaderChart";
import PortfolioValue from "./PortfolioValue";
import { useAppSelector } from "../../store/hooks";

const Header: React.FC = () => {
  const entities = useAppSelector((s) => s.wishlist.entities);

  // collect coin entries that have numeric value
  const coinEntries = useMemo(
    () =>
      Object.values(entities)
        .filter(Boolean)
        .map((c: any) => c)
        .filter(
          (c: any) => c && (c.value != null ? Number(c.value) > 0 : false)
        ),
    [entities]
  );

  const total = useMemo(() => {
    return coinEntries.reduce((sum: number, c: any) => {
      const v = Number(c.value ?? 0);
      return sum + (Number.isFinite(v) ? v : 0);
    }, 0);
  }, [coinEntries]);

  // derive last updated from coins' last_updated (ISO strings) if available
  const lastUpdated = useMemo(() => {
    const dates = Object.values(entities)
      .filter(Boolean)
      .map((c: any) => c?.last_updated)
      .filter(Boolean)
      .map((s: string) => new Date(s).getTime())
      .filter((t: number) => Number.isFinite(t));
    if (dates.length === 0) return null;
    const max = Math.max(...dates);
    return new Date(max).toLocaleTimeString();
  }, [entities]);

  // build slices for chart: label + numeric value
  const slices = useMemo(() => {
    return coinEntries.map((c: any) => ({
      label: `${c.name ?? c.id} (${(c.symbol ?? "").toUpperCase()})`,
      value: Number(c.value ?? 0),
    }));
  }, [coinEntries]);

  // If overall holdings are zero -> show muted centered message
  if (!total || total === 0) {
    return (
      <div className="bg-surface md:rounded-xl p-6 w-full min-h-[350px] flex max-md:flex-col items-start justify-start gap-8 md:gap-5">
        <PortfolioValue totalValue={total} lastUpdated={lastUpdated} />
      </div>
    );
  }

  return (
    <div className="bg-surface md:rounded-xl p-6 w-full flex max-md:flex-col items-stretch justify-center gap-8 md:gap-5">
      <div className="md:w-1/2 w-full flex flex-col items-start justify-between">
        <PortfolioValue totalValue={total} lastUpdated={lastUpdated} />
      </div>
      <div className="md:w-1/2 w-full flex flex-col items-start justify-between">
        <HeaderChart slices={slices} total={total} />
      </div>
    </div>
  );
};

export default Header;

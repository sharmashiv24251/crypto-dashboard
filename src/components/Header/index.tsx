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
  // Use a single reduce loop to find the max timestamp (safer & clearer)
  const lastUpdated = useMemo(() => {
    const maxTs = Object.values(entities)
      .filter(Boolean)
      .reduce((max: number, c: any) => {
        const s = c?.last_updated;
        if (!s) return max;
        const t = Date.parse(s);
        if (!Number.isFinite(t)) return max;
        return Math.max(max, t);
      }, 0);

    if (!maxTs) return null;
    // Format with locale string (includes date + time)
    return new Date(maxTs).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
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

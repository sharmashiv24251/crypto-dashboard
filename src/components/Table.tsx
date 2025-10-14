import React, { useEffect, useRef, useState } from "react";
import {
  AddIcon,
  RefreshIcon,
  StarIcon,
  MoreIcon,
  EditIcon,
  DeleteIcon,
} from "./svg-icons";
import Button from "./UI/Button";
import useIsMobile from "../hooks/useIsMobile";

type Token = {
  id: string;
  imgUrl?: string;
  name: string;
  tag: string;
  price: string;
  change24h: number;
  sparkline: number[];
  holdings: string;
  value: string;
};

const mockDataAll: Token[] = [
  {
    id: "1",
    name: "Ethereum",
    tag: "ETH",
    price: "$43,250.67",
    change24h: 2.3,
    sparkline: [100, 105, 103, 108, 110, 107, 112],
    holdings: "0.0500",
    value: "$2,162.53",
  },
  {
    id: "2",
    name: "Bitcoin",
    tag: "BTC",
    price: "$2,654.32",
    change24h: -1.2,
    sparkline: [100, 98, 95, 97, 94, 92, 90],
    holdings: "2.5000",
    value: "$6,635.80",
  },
  {
    id: "3",
    name: "Solana",
    tag: "SOL",
    price: "$98.45",
    change24h: 4.7,
    sparkline: [100, 102, 104, 103, 107, 109, 110],
    holdings: "2.5000",
    value: "$1,476.75",
  },
  {
    id: "4",
    name: "Dogecoin",
    tag: "DOGE",
    price: "$43,250.67",
    change24h: 2.3,
    sparkline: [100, 103, 105, 104, 106, 108, 107],
    holdings: "0.0500",
    value: "$2,162.53",
  },
  {
    id: "5",
    name: "USDC",
    tag: "USDC",
    price: "$2,654.32",
    change24h: -1.2,
    sparkline: [100, 99, 97, 98, 96, 95, 94],
    holdings: "2.5000",
    value: "$6,635.80",
  },
  {
    id: "6",
    name: "Stellar",
    tag: "XLM",
    price: "$98.45",
    change24h: 4.7,
    sparkline: [100, 101, 103, 105, 106, 108, 109],
    holdings: "15.0000",
    value: "$1,476.75",
  },
];

const PAGE_SIZE = 6;

type TableCellProps = {
  width?: string;
  height?: string;
  className?: string;
  children: React.ReactNode;
};
const TableCell: React.FC<TableCellProps> = ({
  width = "206px",
  height = "48px",
  className = "",
  children,
}) => (
  <div
    className={`flex items-center flex-shrink-0 ${className}`}
    style={{ width, height }}
  >
    {children}
  </div>
);

type TableHeaderCellProps = {
  width?: string;
  height?: string;
  children: React.ReactNode;
};
const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  width,
  height,
  children,
}) => (
  <TableCell width={width} height={height}>
    <div className="text-text-muted text-[13px] font-medium">{children}</div>
  </TableCell>
);

type TokenNameProps = { imgUrl?: string; name: string; tag: string };
const TokenName: React.FC<TokenNameProps> = ({ imgUrl, name, tag }) => (
  <div className="flex items-center gap-3">
    <div
      className="bg-teal rounded flex-shrink-0"
      style={{ width: 32, height: 32, borderRadius: 4 }}
    />
    <div className="flex items-center gap-3">
      <span className="text-text-default text-sm">{name}</span>
      <span className="text-text-muted text-sm">({tag})</span>
    </div>
  </div>
);

type SparklineChartProps = { data: number[]; positive: boolean };
const SparklineChart: React.FC<SparklineChartProps> = ({ data, positive }) => {
  const width = 100;
  const height = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height}>
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#22c55e" : "#ef4444"}
        strokeWidth="1.5"
      />
    </svg>
  );
};

type EditableHoldingsProps = {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  editing: boolean;
};
const EditableHoldings: React.FC<EditableHoldingsProps> = ({
  value,
  onChange,
  onSave,
  editing,
}) => {
  const [val, setVal] = useState(value);
  useEffect(() => setVal(value), [value]);
  useEffect(() => {
    if (!editing) setVal(value);
  }, [editing, value]);
  return editing ? (
    <div className="flex items-center gap-3">
      <input
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          onChange(e.target.value);
        }}
        className="w-[109px] h-[32px] px-[8px] py-[6px] rounded-[6px] border bg-surface-contrast text-text-default text-sm outline-none"
        style={{
          boxShadow: "0px 0px 0px 4px #A9E85133, 0px 0px 0px 1px #A9E851",
          borderColor: "rgba(169,232,81,1)",
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave();
          if (e.key === "Escape") setVal(value);
        }}
      />
      <button
        onClick={onSave}
        className="px-3 py-1 bg-accent rounded text-text-black text-sm"
      >
        Save
      </button>
    </div>
  ) : (
    <span className="text-text-default text-sm">{value}</span>
  );
};

const WatchlistTable: React.FC = () => {
  const [data, setData] = useState<Token[]>(mockDataAll);
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const isMobile = useIsMobile();
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, data.length);
  const currentData = data.slice(startIndex, endIndex);
  const cellWidth = isMobile ? "200px" : "206px";
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const openMenu = (id: string) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
    setEditingId(null);
  };

  const startEditFromMenu = (id: string) => {
    const token = data.find((t) => t.id === id);
    setEditingValue(token ? token.holdings : "");
    setEditingId(id);
    setOpenMenuId(null);
  };

  const saveHoldings = () => {
    if (!editingId) return;
    setData((old) =>
      old.map((r) =>
        r.id === editingId ? { ...r, holdings: editingValue } : r
      )
    );
    setEditingId(null);
  };

  const removeToken = (id: string) => {
    setData((old) => old.filter((r) => r.id !== id));
    setOpenMenuId(null);
    if (editingId === id) setEditingId(null);
  };

  return (
    <div className="w-full flex flex-col gap-4 items-center justify-center max-md:px-4">
      <div className="flex flex-row items-center justify-between w-full">
        <div className="flex flex-row items-center gap-2 text-text-default text-lg md:text-2xl font-medium">
          <StarIcon />
          Watchlist
        </div>
        <div className="flex flex-row items-center gap-3">
          <Button
            size="lg"
            variant="secondary"
            className={isMobile ? "h-9 w-9" : ""}
          >
            <div className="flex flex-row items-center gap-2">
              <RefreshIcon />
              {isMobile ? "" : "Refresh Prices"}
            </div>
          </Button>
          <Button size="lg" variant="primary">
            <div className="flex flex-row items-center gap-2">
              <AddIcon />
              Add Token
            </div>
          </Button>
        </div>
      </div>

      <div className="w-full rounded-2xl border border-[#FFFFFF14] overflow-hidden">
        <style>{`.hide-scrollbar::-webkit-scrollbar{display:none;}`}</style>
        <div
          className="overflow-x-auto hide-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div style={{ minWidth: "max-content" }}>
            <div className="bg-surface flex items-center h-12 border-b border-[#FFFFFF14] px-6">
              <div className="flex items-center gap-3">
                <TableHeaderCell width={cellWidth}>Token</TableHeaderCell>
                <TableHeaderCell width={cellWidth}>Price</TableHeaderCell>
                <TableHeaderCell width={cellWidth}>24h %</TableHeaderCell>
                <TableHeaderCell width={cellWidth}>
                  Sparkline (7d)
                </TableHeaderCell>
                <TableHeaderCell width={cellWidth}>Holdings</TableHeaderCell>
                <TableHeaderCell width={cellWidth}>Value</TableHeaderCell>
                <TableCell width="48px" height="48px">
                  <div className="text-text-muted text-[13px] font-medium" />
                </TableCell>
              </div>
            </div>

            <div className="bg-transparent py-3">
              {currentData.map((token) => {
                const isActive =
                  openMenuId === token.id || editingId === token.id;
                return (
                  <div
                    key={token.id}
                    className={`flex items-center h-12 hover:bg-surface transition-colors px-6 ${
                      isActive ? "bg-surface" : ""
                    }`}
                    style={{ position: "relative" }}
                  >
                    <div className="flex items-center gap-3">
                      <TableCell width={cellWidth}>
                        <TokenName
                          imgUrl={token.imgUrl}
                          name={token.name}
                          tag={token.tag}
                        />
                      </TableCell>

                      <TableCell
                        width={cellWidth}
                        className="text-text-muted text-sm"
                      >
                        {token.price}
                      </TableCell>

                      <TableCell
                        width={cellWidth}
                        className={`text-sm ${
                          token.change24h >= 0
                            ? "text-sparkline-green"
                            : "text-sparkline-red"
                        }`}
                      >
                        {token.change24h >= 0 ? "+" : ""}
                        {token.change24h.toFixed(2)}%
                      </TableCell>

                      <TableCell width={cellWidth}>
                        <SparklineChart
                          data={token.sparkline}
                          positive={token.change24h >= 0}
                        />
                      </TableCell>

                      <TableCell width={cellWidth}>
                        <EditableHoldings
                          value={token.holdings}
                          onChange={(v) => setEditingValue(v)}
                          onSave={saveHoldings}
                          editing={editingId === token.id}
                        />
                      </TableCell>

                      <TableCell
                        width={cellWidth}
                        className="text-text-default text-sm"
                      >
                        {token.value}
                      </TableCell>

                      <TableCell width="28px" className="text-text-muted">
                        <button
                          aria-label="actions"
                          onClick={() => openMenu(token.id)}
                          className="cursor-pointer"
                        >
                          <MoreIcon />
                        </button>
                      </TableCell>
                    </div>

                    {openMenuId === token.id && (
                      <div
                        ref={(el) => {
                          menuRefs.current[token.id] = el;
                        }}
                        style={{
                          position: "absolute",
                          right: 12,
                          top: 40,
                          zIndex: 40,
                        }}
                      >
                        <div
                          className="bg-surface rounded-md p-1"
                          style={{ borderRadius: 8 }}
                        >
                          <div className="flex flex-col">
                            <button
                              className="flex items-center gap-2 px-1 py-0 justify-start"
                              style={{ width: 136, height: 28, padding: 4 }}
                              onClick={() => startEditFromMenu(token.id)}
                            >
                              <div className="p-1">
                                <EditIcon />
                              </div>
                              <div className="text-text-muted text-[13px]">
                                Edit Holdings
                              </div>
                            </button>
                            <div
                              style={{
                                height: 1,
                                background: "rgba(255,255,255,0.08)",
                              }}
                            />
                            <button
                              className="flex items-center gap-2 px-1 py-0 justify-start"
                              style={{ width: 136, height: 28, padding: 4 }}
                              onClick={() => removeToken(token.id)}
                            >
                              <div className="p-1">
                                <DeleteIcon />
                              </div>
                              <div
                                className="text-[13px]"
                                style={{ color: "#FDA4AF" }}
                              >
                                Remove
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-transparent px-6 flex items-center justify-between h-12 border-t border-[#FFFFFF14]">
          <div className="text-text-muted text-sm">
            {startIndex + 1} — {endIndex} of {data.length} results
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-text-muted">
              {currentPage} of {totalPages} pages
            </span>
            <button
              className="px-3 py-1 rounded-full text-text-muted hover:bg-surface transition disabled:opacity-40"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <button
              className="px-3 py-1 rounded-full text-text-muted hover:bg-surface transition disabled:opacity-40"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchlistTable;

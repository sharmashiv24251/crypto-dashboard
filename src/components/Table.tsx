import React, { useEffect, useRef, useState } from "react";
import { AddIcon, RefreshIcon, StarIcon, MoreIcon } from "./svg-icons";
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
    sparkline: [
      100, 105, 103, 108, 110, 107, 112, 0, 1, 2, 3, 19, 20, 30, 60, 100, 200,
    ],
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
  onSave: (newVal: string) => void;
};
const EditableHoldings: React.FC<EditableHoldingsProps> = ({
  value,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setEditValue(value), [value]);

  useEffect(() => {
    if (!isEditing) return;
    function onDocClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsEditing(false);
        setEditValue(value);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isEditing, value]);

  const save = () => {
    onSave(editValue);
    setIsEditing(false);
  };
  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(value);
    }
  };

  return (
    <div ref={wrapperRef}>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="px-2 py-1 rounded bg-surface border border-accent text-text-default text-sm w-20"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={onKey}
            autoFocus
          />
          <button
            className="px-3 py-1 bg-accent rounded text-text-black text-sm"
            onClick={save}
          >
            Save
          </button>
        </div>
      ) : (
        <span
          className="text-text-default cursor-pointer text-sm"
          onClick={() => setIsEditing(true)}
        >
          {value}
        </span>
      )}
    </div>
  );
};

const WatchlistTable: React.FC = () => {
  const [data, setData] = useState<Token[]>(mockDataAll);
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, data.length);
  const currentData = data.slice(startIndex, endIndex);
  const cellWidth = isMobile ? "200px" : "206px";

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const handleHoldingsSave = (id: string, newHoldings: string) =>
    setData((old) =>
      old.map((r) => (r.id === id ? { ...r, holdings: newHoldings } : r))
    );

  const prev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const next = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

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
              {currentData.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center h-12 hover:bg-surface transition-colors px-6"
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
                        onSave={(v) => handleHoldingsSave(token.id, v)}
                      />
                    </TableCell>

                    <TableCell
                      width={cellWidth}
                      className="text-text-default text-sm"
                    >
                      {token.value}
                    </TableCell>

                    <TableCell width="28px" className="text-text-muted">
                      <button aria-label="actions">
                        <MoreIcon />
                      </button>
                    </TableCell>
                  </div>
                </div>
              ))}
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
              onClick={prev}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <button
              className="px-3 py-1 rounded-full text-text-muted hover:bg-surface transition disabled:opacity-40"
              onClick={next}
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

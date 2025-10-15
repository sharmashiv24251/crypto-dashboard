// src/components/WatchlistTable.tsx
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
import { TokenName } from "./UI/TokenName";
import Modal from "./UI/Modal";
import AddToken from "./AddToken";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  updateHoldings,
  removeId,
  setCoinsData,
  refreshPrices,
} from "../store/wishlistSlice";
import { useCoinsByIds } from "../hooks/useCoins";

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
        type="number"
        step="any"
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
  const dispatch = useAppDispatch();
  const wishlistIds = useAppSelector((s) => s.wishlist.ids);
  const entities = useAppSelector((s) => s.wishlist.entities);
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const isMobile = useIsMobile();
  const totalPages = Math.max(1, Math.ceil(wishlistIds.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, wishlistIds.length);
  const currentIds = wishlistIds.slice(startIndex, endIndex);
  const cellWidth = isMobile ? "200px" : "206px";
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { data: fullData, refetch } = useCoinsByIds(wishlistIds);

  useEffect(() => {
    if (fullData) {
      dispatch(setCoinsData(fullData));
    }
  }, [fullData, dispatch]);

  // --- NEW: spinning state & key to restart animation ---
  const [isRefreshing, setIsRefreshing] = useState(false); // "creeper" state you asked for
  const [spinKey, setSpinKey] = useState(0); // bump this to restart animation

  const refresh = async () => {
    // set the creeper state true and bump key to trigger the animation
    setIsRefreshing(true);
    setSpinKey((k) => k + 1);

    const res = await refetch();
    if (res?.data) {
      dispatch(refreshPrices(res.data as any));
    }

    // we'll clear isRefreshing on animation end via onAnimationEnd,
    // but also set a fallback timeout to ensure it resets even if animationend doesn't fire.
    const fallback = setTimeout(() => setIsRefreshing(false), 800);
    return () => clearTimeout(fallback);
  };

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const openMenu = (id: string) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
    setEditingId(null);
  };

  const startEditFromMenu = (id: string) => {
    const token = entities[id] as any;
    setEditingValue(token ? token.holdings : "");
    setEditingId(id);
    setOpenMenuId(null);
  };

  const removeToken = (id: string) => {
    dispatch(removeId(id));
    setOpenMenuId(null);
    if (editingId === id) setEditingId(null);
  };

  const currentData = currentIds.map((id) => {
    const e = entities[id];
    if (!e)
      return {
        id,
        name: id,
        tag: id.toUpperCase(),
        price: "$0.00",
        change24h: 0,
        sparkline: [0],
        holdings: "0",
        value: "$0.00",
        imgUrl: undefined,
      };
    return {
      id: e.id,
      name: e.name ?? e.id,
      tag: (e.symbol ?? "").toUpperCase(),
      price:
        e.current_price != null
          ? `$${Number(e.current_price).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : "$0.00",
      change24h: e.price_change_percentage_24h ?? 0,
      sparkline: e.sparkline_in_7d?.price ?? [0],
      holdings: e.holdings ?? "0",
      value:
        e.value != null
          ? `$${Number(e.value).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : "$0.00",
      imgUrl: e.image,
    } as Token;
  });

  return (
    <>
      {/* --- CSS for single spin animation --- */}
      <style>{`
        @keyframes spinOnce {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .animate-spin-once {
          animation-name: spinOnce;
          animation-duration: 600ms;
          animation-timing-function: linear;
          animation-fill-mode: none;
          transform-origin: center;
          display: inline-block; /* ensure transform applies correctly */
        }
      `}</style>

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
              onClick={refresh}
            >
              <div className="flex flex-row items-center gap-2">
                {/* Wrap the icon so we can add an animation class and restart it by changing key */}
                <span
                  // key changes force React to recreate element so animation restarts
                  key={`refresh-icon-${spinKey}`}
                  className={isRefreshing ? "animate-spin-once" : ""}
                  onAnimationEnd={() => setIsRefreshing(false)}
                  aria-hidden
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  <RefreshIcon />
                </span>
                {isMobile ? "" : "Refresh Prices"}
              </div>
            </Button>
            <Button
              size="lg"
              variant="primary"
              onClick={() => setIsAddOpen(true)}
            >
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
            <div className="min-h-[350px]" style={{ minWidth: "max-content" }}>
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

              {currentData.length === 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                  className="text-text-muted text-sm mt-[125px]"
                >
                  No Holdings, Please add some tokens to your portfolio
                </div>
              )}

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
                            onSave={() => {
                              if (!editingId) return;
                              dispatch(
                                updateHoldings({
                                  id: editingId,
                                  holdings: editingValue,
                                })
                              );
                              setEditingId(null);
                            }}
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
              {startIndex + 1} — {endIndex} of {wishlistIds.length} results
            </div>
            <div className="flex items-center gap-3 text-sm">
              {isMobile ? (
                <></>
              ) : (
                <span className="text-text-muted">
                  {currentPage} of {totalPages} pages
                </span>
              )}
              <button
                className="px-3 py-1 rounded-full text-text-muted hover:bg-surface transition disabled:opacity-40"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <button
                className="px-3 py-1 rounded-full text-text-muted hover:bg-surface transition disabled:opacity-40"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        closeOnEsc={true}
        closeOnBackdrop={true}
        backdropClassName="fixed inset-0 flex items-center justify-center"
        modalClassName="relative z-50 rounded-xl overflow-hidden w-full max-w-[640px] max-sm:mx-4 bg-background shadow-[0_8px_16px_0_#00000052,0_4px_8px_0_#00000052,0_0_0_1px_#FFFFFF1A,0_-1px_0_0_#FFFFFF0A,inset_0_0_0_1.5px_#FFFFFF0F,inset_0_0_0_1px_#18181B]"
        showShadow={true}
      >
        <AddToken onClose={() => setIsAddOpen(false)} />
      </Modal>
    </>
  );
};

export default WatchlistTable;

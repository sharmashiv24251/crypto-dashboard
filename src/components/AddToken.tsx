// src/components/AddToken.tsx
import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { TokenName } from "./UI/TokenName";
import Button from "./UI/Button";
import { StarIcon } from "./svg-icons";
import useIsMobile from "../hooks/useIsMobile";
import useDebouncedValue from "../hooks/useDebouncedValue";
import { useInfiniteCoins, useSearchCoins } from "../hooks/useCoins";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addId, removeId } from "../store/wishlistSlice";

const PER_PAGE = 12;
const BOTTOM_BAR_HEIGHT = 56; // px
const SEARCH_FIELD_HEIGHT = 52; // px

const AddToken: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  const debouncedQuery = useDebouncedValue(searchQuery, 600);
  const dispatch = useAppDispatch();
  const wishlistIds = useAppSelector((s) => s.wishlist.ids);

  // Keep an initial snapshot of wishlist IDs (the "previous" state to compare against).
  // This snapshot is taken once when the component mounts.
  const originalIdsRef = useRef<string[]>(wishlistIds);
  useEffect(() => {
    originalIdsRef.current = wishlistIds;
    // Intentionally only run on mount — we want the "previous" state when the UI opened.
    // If you want to refresh this snapshot when the modal re-opens, set up a prop to trigger that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedSet = useMemo(() => new Set(wishlistIds), [wishlistIds]);

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: infiniteLoading,
    error: infiniteError,
    refetch: refetchInfinite,
  } = useInfiniteCoins(PER_PAGE);

  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchError,
    refetch: refetchSearch,
  } = useSearchCoins(debouncedQuery?.trim() ? debouncedQuery : null);

  const infiniteCoins = useMemo(() => {
    if (!infiniteData || !infiniteData.pages) return [];
    return infiniteData.pages.flatMap((p) => p.data ?? []);
  }, [infiniteData]);

  const showingSearch = Boolean(debouncedQuery?.trim());
  const coins = showingSearch ? searchData ?? [] : infiniteCoins;

  const isInitialInfiniteLoad =
    !showingSearch && infiniteLoading && infiniteCoins.length === 0;
  const loading = showingSearch ? searchLoading : isInitialInfiniteLoad;
  const error = showingSearch ? searchError : infiniteError;

  const toggleToken = (id: string) => {
    if (selectedSet.has(id)) dispatch(removeId(id));
    else dispatch(addId(id));
  };

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const first = entries[0];
      if (first?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || showingSearch) return;
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "400px",
      threshold: 0.1,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [handleObserver, showingSearch, sentinelRef.current]);

  useEffect(() => {
    if (showingSearch) {
      refetchSearch?.();
    } else {
      refetchInfinite?.();
      if (infiniteCoins.length === 0) {
        fetchNextPage?.();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showingSearch]);

  const totalHeight = isMobile ? 500 : 432;
  const scrollableHeight = `${
    totalHeight - SEARCH_FIELD_HEIGHT - BOTTOM_BAR_HEIGHT
  }px`;

  // Compare current wishlistIds to the original snapshot to determine if any changes were made.
  const hasChanges = useMemo(() => {
    const origSet = new Set(originalIdsRef.current);
    if (origSet.size !== wishlistIds.length) return true;
    for (const id of wishlistIds) {
      if (!origSet.has(id)) return true;
    }
    return false;
  }, [wishlistIds]);

  return (
    <div
      className="flex flex-col w-full bg-background"
      style={{ height: isMobile ? 500 : 432 }}
    >
      <div
        className="flex-shrink-0 rounded-t-lg"
        style={{
          height: `${SEARCH_FIELD_HEIGHT}px`,
          borderColor: "rgba(255, 255, 255, 0.08)",
          borderWidth: "1px",
        }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tokens (e.g., ETH, SOL)..."
          className="w-full h-full py-3 rounded-lg pl-4 text-text-default placeholder:text-text-muted bg-transparent outline-none focus:border-white/10 border-0"
        />
      </div>

      <div
        className="overflow-y-auto no-scrollbar"
        style={{
          height: scrollableHeight,
        }}
      >
        <div className="pl-2 pt-3">
          <span
            className="text-text-muted font-medium pl-2"
            style={{ fontSize: 12 }}
          >
            {showingSearch ? "Search results" : "Trending"}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-full text-text-muted">
            Loading...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-text-muted">
            <div>Error loading coins.</div>
            <div className="mt-2 text-sm">
              {String((error as Error).message)}
            </div>
          </div>
        ) : coins.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-muted">
            No results
          </div>
        ) : (
          <>
            {coins.map((coin: any) => {
              const id = coin.id;
              const name = coin.name;
              const symbol = coin.symbol?.toUpperCase();
              const img =
                coin.image || coin.large || coin.thumb || coin.icon || "";
              const isSelected = selectedSet.has(id);
              return (
                <div
                  key={id}
                  onClick={() => toggleToken(id)}
                  className={`flex items-center justify-between w-full p-2 cursor-pointer transition-colors ${
                    isSelected ? "bg-accent/[0.06]" : "hover:bg-accent/[0.06]"
                  }`}
                >
                  <div className="pl-2">
                    <TokenName imgUrl={img} name={name} tag={symbol} isModal />
                  </div>

                  <div className="flex items-center gap-4">
                    {isSelected && <StarIcon />}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-accent border-accent"
                          : "border-white/20 bg-transparent"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10 3L4.5 8.5L2 6"
                            stroke="black"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {!showingSearch && (
              <>
                <div ref={sentinelRef} className="w-full h-2" aria-hidden />
                {isFetchingNextPage && (
                  <div className="flex items-center justify-center py-3 text-text-muted">
                    Loading more...
                  </div>
                )}
                {!hasNextPage && (
                  <div className="flex items-center justify-center py-3 text-text-muted text-sm">
                    You've reached the end
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <div
        className="flex-shrink-0 flex justify-end items-center gap-2 bg-surface border-t border-white/10"
        style={{ height: BOTTOM_BAR_HEIGHT }}
      >
        <Button
          size="lg"
          variant={hasChanges ? "primary" : "outline"}
          className="mr-4"
          onClick={() => {
            // At the moment the add/remove actions are dispatched immediately on toggle.
            // This button could either be used to persist to server, close modal, or show feedback.
            // For now keep existing behavior (log), but you can replace this with a batch-update dispatch.
            onClose();
          }}
          disabled={!hasChanges}
          aria-disabled={!hasChanges}
        >
          Add to Wishlist
        </Button>
      </div>
    </div>
  );
};

export default AddToken;

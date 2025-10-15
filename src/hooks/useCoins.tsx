import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { fetchAllCoins, searchCoins, getCoinsByIds } from "../api/";
import type { CoinWithSparkline } from "../types/index";

export const COIN_KEYS = {
  all: ["coins"] as const,
  list: (page = 1, perPage = 10) =>
    [...COIN_KEYS.all, "list", { page, perPage }] as const,
  search: (q: string) => [...COIN_KEYS.all, "search", q] as const,
  byIds: (ids: string[]) => [...COIN_KEYS.all, "byIds", ...ids] as const,
  infinite: (perPage = 10) => [...COIN_KEYS.all, "infinite", perPage] as const,
};

export const useTrendingCoins = (page = 1, perPage = 10) => {
  return useQuery({
    queryKey: COIN_KEYS.list(page, perPage),
    queryFn: async () => {
      const res = await fetchAllCoins(page, perPage);
      return res.data as CoinWithSparkline[];
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useSearchCoins = (query: string | null) => {
  return useQuery({
    queryKey: COIN_KEYS.search(query ?? ""),
    queryFn: async () => {
      const res = await searchCoins(query ?? "");
      return res.coins ?? [];
    },
    enabled: Boolean(query && query.trim().length > 0),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 1, // 1 min
  });
};

export const useCoinsByIds = (ids: string[] | undefined) => {
  return useQuery({
    queryKey: COIN_KEYS.byIds(ids ?? []),
    queryFn: async () => {
      if (!ids || ids.length === 0) return [];
      const res = await getCoinsByIds(ids);
      return res;
    },
    enabled: Boolean(ids && ids.length > 0),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

export const useInfiniteCoins = (perPage = 10) => {
  return useInfiniteQuery({
    queryKey: COIN_KEYS.infinite(perPage),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetchAllCoins(pageParam, perPage);
      return res;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      if (!lastPage || !lastPage.pagination) return undefined;
      return lastPage.pagination.hasNextPage
        ? lastPage.pagination.currentPage + 1
        : undefined;
    },
    staleTime: 1000 * 60 * 2, // 2min
    gcTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });
};

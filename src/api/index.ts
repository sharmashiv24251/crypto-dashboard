// src/api/coingecko.ts
import Coingecko from '@coingecko/coingecko-typescript'

import {
  type BaseCoin,
  type CoinWithSparkline,
  type FetchAllCoinsResponse,
  type GetCoinsByIdsResponse,
  type PaginationInfo,
  type SearchCoinsResponse,
  type CoinIds,
  type SearchQuery,
} from '../types/index'

// Create and export a single client instance (so other modules can reuse if you want)
const PRO_KEY = (import.meta.env.VITE_COINGECKO_PRO_API_KEY as string) || ''
const DEMO_KEY = (import.meta.env.VITE_PUBLIC_CG_API_KEY as string) || ''

const environment: 'pro' | 'demo' = PRO_KEY ? 'pro' : 'demo'

export const coingeckoClient = new Coingecko({
  proAPIKey: PRO_KEY || undefined,
  demoAPIKey: DEMO_KEY || undefined,
  environment,
  maxRetries: 3,
})

/**
 * Fetch all coins (markets) with pagination
 */
export const fetchAllCoins = async (
  page = 1,
  perPage = 5
): Promise<FetchAllCoinsResponse> => {
  try {
    const params: Coingecko.Coins.MarketGetParams = {
      vs_currency: 'usd',
      page,
      per_page: perPage,
    }

    const data = (await coingeckoClient.coins.markets.get(params)) as BaseCoin[]

    const pagination: PaginationInfo = {
      currentPage: page,
      perPage,
      hasNextPage: data.length === perPage,
      hasPrevPage: page > 1,
    }

    return { data, pagination }
  } catch (err) {
    if (err instanceof Coingecko.RateLimitError) {
      console.error('Rate limit exceeded. Please try again later.')
    } else if (err instanceof Coingecko.APIError) {
      console.error(`An API error occurred: ${err.name} (Status: ${err.status})`)
    } else {
      console.error('An unexpected error occurred fetching all coins:', err)
    }
    throw err
  }
}

/**
 * Helper: split array into chunks
 */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

/**
 * Fetch coins by multiple IDs.
 * - Supports automatic batching (250 ids per request limit).
 * - Returns an array matching requested ids order, inserting null for missing ids.
 */
export const getCoinsByIds = async (ids: CoinIds): Promise<GetCoinsByIdsResponse> => {
  try {
    if (!Array.isArray(ids) || ids.length === 0) return []
    // CoinGecko supports up to 250 ids per request
    const MAX_IDS_PER_REQUEST = 250

    // If small enough, do single request
    const batches = chunkArray(ids, MAX_IDS_PER_REQUEST)

    const allResults: CoinWithSparkline[] = []

    // Process batches sequentially to be friendly to rate limits.
    for (const batch of batches) {
      const params: Coingecko.Coins.MarketGetParams = {
        vs_currency: 'usd',
        ids: batch.join(','),
        per_page: batch.length,
        page: 1,
        sparkline: true,
        price_change_percentage: '24h',
      }

      const batchData = (await coingeckoClient.coins.markets.get(params)) as CoinWithSparkline[]
      allResults.push(...(batchData || []))
    }

    // Map results by id for ordering
    const map = new Map<string, CoinWithSparkline>()
    for (const item of allResults) {
      if (item && item.id) map.set(item.id, item)
    }

    return ids.map((id) => map.get(id) ?? null)
  } catch (err) {
    if (err instanceof Coingecko.RateLimitError) {
      console.error('Rate limit exceeded. Please try again later.')
    } else if (err instanceof Coingecko.APIError) {
      console.error(`An API error occurred: ${err.name} (Status: ${err.status})`)
    } else {
      console.error('An unexpected error occurred fetching coins by IDs:', err)
    }
    throw err
  }
}

/**
 * Search coins by query
 */
export const searchCoins = async (query: SearchQuery): Promise<SearchCoinsResponse> => {
  try {
    if (!query || String(query).trim() === '') {
      throw new Error('Search query is required')
    }

    const params: Coingecko.Search.SearchGetParams = {
      query: String(query).trim(),
    }

    const data = (await coingeckoClient.search.get(params)) as SearchCoinsResponse

    return {
      coins: data?.coins ?? [],
      exchanges: data?.exchanges ?? [],
      icos: data?.icos ?? [],
      categories: data?.categories ?? [],
      nfts: data?.nfts ?? [],
    }
  } catch (err) {
    if (err instanceof Coingecko.RateLimitError) {
      console.error('Rate limit exceeded. Please try again later.')
    } else if (err instanceof Coingecko.APIError) {
      console.error(`An API error occurred: ${err.name} (Status: ${err.status})`)
    } else {
      console.error('An unexpected error occurred searching coins:', err)
    }
    throw err
  }
}

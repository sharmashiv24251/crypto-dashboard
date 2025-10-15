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

const DEFAULT_BASE_URL = 'https://api.coingecko.com/api/v3'
const COINGECKO_BASE_URL = (import.meta.env.VITE_PUBLIC_BASE_URL as string) || DEFAULT_BASE_URL
const API_KEY = (import.meta.env.VITE_COINGECKO_API_KEY as string) || ''

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  try {
    return JSON.parse(text) as T
  } catch (err) {
    throw new Error(`Failed to parse JSON response: ${err instanceof Error ? err.message : String(err)} — raw: ${text}`)
  }
}

export const fetchAllCoins = async (
  page = 1,
  perPage = 5
): Promise<FetchAllCoinsResponse> => {
  try {
    const url = `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&page=${page}&per_page=${perPage}`

    const response = await fetch(url, {
      headers: {
        'x-cg-demo-api-key': API_KEY ?? '',
      },
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Failed to fetch coins: ${response.status} ${response.statusText} ${text}`)
    }

    const data = (await parseJson<BaseCoin[]>(response)) || []

    const pagination: PaginationInfo = {
      currentPage: page,
      perPage,
      hasNextPage: data.length === perPage,
      hasPrevPage: page > 1,
    }

    return { data, pagination }
  } catch (error) {
    console.error('Error fetching all coins:', error)
    throw error
  }
}

export const getCoinsByIds = async (ids: CoinIds): Promise<GetCoinsByIdsResponse> => {
  try {
    if (!Array.isArray(ids) || ids.length === 0) return []
    if (ids.length > 250) throw new Error('Too many IDs: CoinGecko supports up to 250 ids per request. Please batch your requests.')

    const idsParam = ids.map(encodeURIComponent).join(',')
    const url = `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&ids=${idsParam}&per_page=${ids.length}&page=1&sparkline=true&price_change_percentage=24h`

    const response = await fetch(url, {
      headers: {
        'x-cg-demo-api-key': API_KEY ?? '',
      },
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Failed to fetch coins by IDs: ${response.status} ${response.statusText} ${text}`)
    }

    const data = (await parseJson<CoinWithSparkline[]>(response)) || []

    const map = new Map<string, CoinWithSparkline>()
    for (const item of data) {
      if (item && item.id) map.set(item.id, item)
    }

    return ids.map((id) => map.get(id) ?? null)
  } catch (error) {
    console.error('Error fetching coins by IDs:', error)
    throw error
  }
}

export const searchCoins = async (query: SearchQuery): Promise<SearchCoinsResponse> => {
  try {
    if (!query || query.trim() === '') {
      throw new Error('Search query is required')
    }

    const url = `${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query)}`

    const response = await fetch(url, {
      headers: {
        'x-cg-demo-api-key': API_KEY ?? '',
      },
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Failed to search coins: ${response.status} ${response.statusText} ${text}`)
    }

    const data = (await parseJson<SearchCoinsResponse>(response))

    return {
      coins: data?.coins ?? [],
      exchanges: data?.exchanges ?? [],
      icos: data?.icos ?? [],
      categories: data?.categories ?? [],
      nfts: data?.nfts ?? [],
    }
  } catch (error) {
    console.error('Error searching coins:', error)
    throw error
  }
}

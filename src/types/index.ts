// Base coin interface used across multiple endpoints
export interface BaseCoin {
    id: string
    symbol: string
    name: string
    image: string
    current_price: number | null
    market_cap: number | null
    market_cap_rank: number | null
    fully_diluted_valuation: number | null
    total_volume: number | null
    high_24h: number | null
    low_24h: number | null
    price_change_24h: number | null
    price_change_percentage_24h: number | null
    market_cap_change_24h: number | null
    market_cap_change_percentage_24h: number | null
    circulating_supply: number | null
    total_supply: number | null
    max_supply: number | null
    ath: number | null
    ath_change_percentage: number | null
    ath_date: string | null
    atl: number | null
    atl_change_percentage: number | null
    atl_date: string | null
    roi: {
      times: number
      currency: string
      percentage: number
    } | null
    last_updated: string
  }
  
  // Extended coin interface with sparkline data
  export interface CoinWithSparkline extends BaseCoin {
    sparkline_in_7d: {
      price: number[]
    }
    price_change_percentage_1h_in_currency?: number | null
    price_change_percentage_24h_in_currency?: number | null
    price_change_percentage_7d_in_currency?: number | null
  }
  
  // Pagination metadata
  export interface PaginationInfo {
    currentPage: number
    perPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  
  // Response type for fetchAllCoins
  export interface FetchAllCoinsResponse {
    data: BaseCoin[]
    pagination: PaginationInfo
  }
  
  // Response type for getCoinsByIds
  export type GetCoinsByIdsResponse = (CoinWithSparkline | null)[]
  
  // Search result interfaces
  export interface SearchCoin {
    id: string
    name: string
    symbol: string
    market_cap_rank: number | null
    thumb: string
    large: string
  }
  
  export interface SearchExchange {
    id: string
    name: string
    market_type: string
    thumb: string
    large: string
  }
  
  export interface SearchCategory {
    id: string
    name: string
  }
  
  export interface SearchNft {
    id: string
    name: string
    symbol: string
    thumb: string
  }
  
  // Response type for searchCoins
  export interface SearchCoinsResponse {
    coins: SearchCoin[]
    exchanges: SearchExchange[]
    icos: any[] // ICOs structure varies, using any for flexibility
    categories: SearchCategory[]
    nfts: SearchNft[]
  }
  
  // Error types for better error handling
  export interface ApiError {
    message: string
    status?: number
    statusText?: string
  }
  
  // Utility types for function parameters
  export type CoinIds = string[]
  export type SearchQuery = string
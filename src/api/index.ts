// src/api/index.ts

const COINGECKO_BASE_URL = import.meta.env.VITE_PUBLIC_BASE_URL
const API_KEY = import.meta.env.VITE_COINGECKO_API_KEY


// --- Fetch all coins ---
export const fetchAllCoins = async () => {
  try {
    const response = await fetch(`${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd`, {
    // const response = await fetch(`${COINGECKO_BASE_URL}/coins/list`, {
      headers: {
        'x-cg-demo-api-key': API_KEY ?? '',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch coins: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching all coins:', error)
    throw error
  }
}

// --- Fetch coins by multiple IDs ---
export const getCoinsByIds = async (ids: string[]) => {
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
        throw new Error(`Failed to fetch coins by IDs: ${response.status} ${response.statusText}`)
      }
  
      const data = await response.json()
  
      const map = new Map<string, any>()
      for (const item of data) {
        if (item && item.id) map.set(item.id, item)
      }
  
      return ids.map((id) => map.get(id) ?? null)
    } catch (error) {
      console.error('Error fetching coins by IDs:', error)
      throw error
    }
  }
  



//   SAMPLE
// const [data, setData] = useState<any[]>([]);
// const [dataByIds, setDataByIds] = useState<any[]>([]);
// useEffect(() => {
//   fetchAllCoins().then((data) => {
//     setData(data);
//   });
// }, []);

// useEffect(() => {
//   getCoinsByIds([
//     "bitcoin",
//     "ethereum",
//     "solana",
//     "dogecoin",
//     "wrapped-beacon-eth",
//   ]).then((data) => {
//     setDataByIds(data);
//   });
// }, [data]);
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CoinWithSparkline } from "../types/index";
import { DEFAULT_COINS, DEFAULT_HOLDINGS } from "../../constants";

type StoredCoin = CoinWithSparkline & {
  holdings: string;
  value: number | null;
  last_updated?: string; // <-- added
};

type WishlistState = {
  ids: string[];
  entities: Record<string, StoredCoin | null>;
};

const STORAGE_KEY = "wishlist_state";
const SEEDED_COOKIE_NAME = "wishlist_seeded_v1";

/* ---------- Helpers ---------- */

const recalcValue = (coin: CoinWithSparkline | null, holdings: string) => {
  if (!coin || coin.current_price == null) return null;
  const h = Number(holdings || "0");
  if (Number.isNaN(h)) return null;
  return h * coin.current_price;
};

// Safe localStorage helpers
const loadFromLocalStorage = (): WishlistState | null => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return null;
    }
    return JSON.parse(serialized) as WishlistState;
  } catch (error) {
    console.warn("Failed to load from localStorage:", error);
    return null;
  }
};

export const saveToLocalStorage = (state: WishlistState): void => {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.warn("Failed to save to localStorage:", error);
  }
};

// Cookie helpers - used to mark that seeding has already happened once
const setCookie = (name: string, value: string, days = 3650) => {
  try {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  } catch (e) {
    // If cookies are disabled, we simply proceed without cookie persistence.
    console.warn("Failed to set cookie:", e);
  }
};

const getCookie = (name: string): string | null => {
  try {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  } catch (e) {
    console.warn("Failed to read cookie:", e);
    return null;
  }
};

/* ---------- Build initial default state from constants ---------- */

const buildInitialState = (): WishlistState => {
  const ids: string[] = [];
  const entities: Record<string, StoredCoin | null> = {};

  DEFAULT_COINS.forEach((c) => {
    const holdings = DEFAULT_HOLDINGS[c.id] ?? "0";
    const value = recalcValue(c, holdings);
    ids.push(c.id);
    entities[c.id] = { ...(c as CoinWithSparkline), holdings, value };
  });

  return { ids, entities };
};

/* ---------- Decide initial state (seed-once behavior) ---------- */

const getInitialState = (): WishlistState => {
  const persisted = loadFromLocalStorage();
  const seededFlag = getCookie(SEEDED_COOKIE_NAME);

  if (persisted) {
    return persisted;
  }

  // No persisted data in localStorage
  if (!seededFlag) {
    // First time: seed from constants and persist the seeded data and set cookie
    const seededState = buildInitialState();
    saveToLocalStorage(seededState);
    setCookie(SEEDED_COOKIE_NAME, "1");
    return seededState;
  }

  // Cookie says we've already seeded once previously, but localStorage is empty (user cleared it).
  // Important: do NOT reseed from constants. Return an empty wishlist state.
  return { ids: [], entities: {} };
};

const initialState: WishlistState = getInitialState();

/* ---------- Slice ---------- */

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addId(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (!state.ids.includes(id)) {
        state.ids.push(id);
        if (!state.entities[id]) state.entities[id] = null;
        // persist
        saveToLocalStorage(state);
      }
    },
    removeId(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.ids = state.ids.filter((i) => i !== id);
      delete state.entities[id];
      // persist
      saveToLocalStorage(state);
    },
    setCoinsData(state, action: PayloadAction<(CoinWithSparkline | null)[]>) {
      const now = new Date().toISOString();
      action.payload.forEach((c) => {
        if (!c) return;
        const prev = state.entities[c.id] ?? null;
        const holdings = prev?.holdings ?? "0";
        const value = recalcValue(c, holdings);
        // stamp last_updated to now (we refreshed/received fresh data)
        state.entities[c.id] = { ...(c as CoinWithSparkline), holdings, value, last_updated: now };
        if (!state.ids.includes(c.id)) state.ids.push(c.id);
      });
      // persist
      saveToLocalStorage(state);
    },
    updateHoldings(
      state,
      action: PayloadAction<{ id: string; holdings: string }>
    ) {
      const { id, holdings } = action.payload;
      const prev = state.entities[id] ?? null;
      if (!prev) {
        // No coin data available yet, create placeholder entity so holdings persist
        state.entities[id] = {
          // coin fields unknown => leave as null-ish using type coercion
          ...(null as any),
          holdings,
          value: null,
        };
        if (!state.ids.includes(id)) state.ids.push(id);
        saveToLocalStorage(state);
        return;
      }
      const value =
        prev.current_price != null ? Number(holdings || "0") * prev.current_price : null;
      // keep prev.last_updated as-is when only holdings change
      state.entities[id] = { ...prev, holdings, value };
      saveToLocalStorage(state);
    },
    refreshPrices(state, action: PayloadAction<(CoinWithSparkline | null)[]>) {
      const now = new Date().toISOString();
      action.payload.forEach((c) => {
        if (!c) return;
        const prev = state.entities[c.id] ?? null;
        const holdings = prev?.holdings ?? "0";
        const value = recalcValue(c, holdings);
        // stamp the last_updated timestamp for this coin to now (refresh)
        state.entities[c.id] = { ...(c as CoinWithSparkline), holdings, value, last_updated: now };
        if (!state.ids.includes(c.id)) state.ids.push(c.id);
      });
      // persist
      saveToLocalStorage(state);
    },
    // Optional convenience: replace whole wishlist and persist (useful for migrations)
    replaceWholeState(state, action: PayloadAction<WishlistState>) {
      const next = action.payload;
      // mutate existing state object to keep reference
      state.ids = next.ids;
      state.entities = next.entities;
      saveToLocalStorage(state);
    },
  },
});

export const {
  addId,
  removeId,
  setCoinsData,
  updateHoldings,
  refreshPrices,
  replaceWholeState,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;

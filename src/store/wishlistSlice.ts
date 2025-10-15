// src/store/wishlistSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CoinWithSparkline } from "../types/index";
import { DEFAULT_COINS, DEFAULT_HOLDINGS } from "../../constants";

type StoredCoin = CoinWithSparkline & {
  holdings: string;
  value: number | null;
};

type WishlistState = {
  ids: string[];
  entities: Record<string, StoredCoin | null>;
};

const recalcValue = (coin: CoinWithSparkline | null, holdings: string) => {
  if (!coin || coin.current_price == null) return null;
  const h = Number(holdings || "0");
  if (Number.isNaN(h)) return null;
  return h * coin.current_price;
};



// build initial state from defaults
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

const initialState: WishlistState = buildInitialState();

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addId(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (!state.ids.includes(id)) {
        state.ids.push(id);
        if (!state.entities[id]) state.entities[id] = null;
      }
    },
    removeId(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.ids = state.ids.filter((i) => i !== id);
      delete state.entities[id];
    },
    setCoinsData(state, action: PayloadAction<(CoinWithSparkline | null)[]>) {
      action.payload.forEach((c) => {
        if (!c) return;
        const prev = state.entities[c.id] ?? null;
        const holdings = prev?.holdings ?? "0";
        const value = recalcValue(c, holdings);
        state.entities[c.id] = { ...(c as CoinWithSparkline), holdings, value };
      });
    },
    updateHoldings(
      state,
      action: PayloadAction<{ id: string; holdings: string }>
    ) {
      const { id, holdings } = action.payload;
      const prev = state.entities[id] ?? null;
      if (!prev) {
        state.entities[id] = {
          ...(null as any),
          holdings,
          value: null,
        };
        return;
      }
      const value =
        prev.current_price != null ? Number(holdings || "0") * prev.current_price : null;
      state.entities[id] = { ...prev, holdings, value };
    },
    refreshPrices(state, action: PayloadAction<(CoinWithSparkline | null)[]>) {
      action.payload.forEach((c) => {
        if (!c) return;
        const prev = state.entities[c.id] ?? null;
        const holdings = prev?.holdings ?? "0";
        const value = recalcValue(c, holdings);
        state.entities[c.id] = { ...(c as CoinWithSparkline), holdings, value };
      });
    },
  },
});

export const {
  addId,
  removeId,
  setCoinsData,
  updateHoldings,
  refreshPrices,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;

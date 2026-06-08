import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "malin.cart.v1";

const initial = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* ignore */
  }
  return { items: [], open: false };
};

function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const idx = state.items.findIndex((i) => i.id === action.product.id);
      const qty = action.qty ?? 1;
      let items;
      if (idx >= 0) {
        items = state.items.map((it, i) =>
          i === idx ? { ...it, qty: it.qty + qty } : it
        );
      } else {
        items = [
          ...state.items,
          {
            id: action.product.id,
            name: action.product.name,
            price: action.product.price,
            image: action.product.images?.[0],
            qty,
          },
        ];
      }
      return { ...state, items, open: true };
    }
    case "REMOVE":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "QTY":
      return {
        ...state,
        items: state.items
          .map((i) => (i.id === action.id ? { ...i, qty: Math.max(0, action.qty) } : i))
          .filter((i) => i.qty > 0),
      };
    case "CLEAR":
      return { ...state, items: [] };
    case "TOGGLE":
      return { ...state, open: action.open ?? !state.open };
    default:
      return state;
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, undefined, initial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items, open: false }));
    } catch (e) {
      /* ignore */
    }
  }, [state.items]);

  const value = useMemo(() => {
    const subtotal = state.items.reduce((s, i) => s + i.price * i.qty, 0);
    const count = state.items.reduce((s, i) => s + i.qty, 0);
    return {
      items: state.items,
      open: state.open,
      subtotal,
      count,
      add: (product, qty = 1) => dispatch({ type: "ADD", product, qty }),
      remove: (id) => dispatch({ type: "REMOVE", id }),
      setQty: (id, qty) => dispatch({ type: "QTY", id, qty }),
      clear: () => dispatch({ type: "CLEAR" }),
      setOpen: (open) => dispatch({ type: "TOGGLE", open }),
      toggle: () => dispatch({ type: "TOGGLE" }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

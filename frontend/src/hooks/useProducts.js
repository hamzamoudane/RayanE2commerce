import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products");
      setProducts(data.map(normalize));
      setError(null);
    } catch (e) {
      setError(e?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/products");
        if (!cancelled) {
          setProducts(data.map(normalize));
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Erreur");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading, error, refresh: fetchProducts };
};

export const useProduct = (id) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        if (!cancelled) {
          setProduct(normalize(data));
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.response?.status === 404 ? "not-found" : e?.message);
          setProduct(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (id) load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { product, loading, error };
};

// Map backend snake_case to frontend camelCase used in legacy components
export const normalize = (p) => ({
  id: p.id,
  name: p.name,
  tagline: p.tagline,
  category: p.category,
  price: p.price,
  compareAt: p.compare_at ?? null,
  isNew: !!p.is_new,
  bestSeller: !!p.best_seller,
  description: p.description || "",
  images: p.images || [],
  specs: p.specs || [],
});

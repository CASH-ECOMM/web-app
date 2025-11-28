// src/services/catalogue.js
import apiClient from "../api/api";

// Unwrap HAL/HATEOAS or simple arrays from router-service responses
const parseCatalogueResponse = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  // HAL style: { _embedded: { someKey: [ ...items ] }, ... }
  if (data._embedded && typeof data._embedded === "object") {
    const keys = Object.keys(data._embedded);
    if (keys.length > 0) {
      const firstKey = keys[0];
      const embedded = data._embedded[firstKey];
      if (Array.isArray(embedded)) {
        return embedded;
      }
    }
  }

  // Spring "page" style: { content: [ ...items ], ... }
  if (Array.isArray(data.content)) {
    return data.content;
  }

  return [];
};

// Normalize each raw item from backend into the shape our UI expects
const normalizeItem = (it) => ({
  id: it.id ?? it.itemId ?? Math.random(),

  // Basic fields
  title: it.title ?? it.name ?? "Untitled",
  description: it.description ?? "",

  // Prices
  startingPrice: Number(
    it.starting_price ??
    it.startingPrice ??
    0
  ),
  currentPrice: Number(
    it.current_price ??
    it.currentPrice ??
    it.starting_price ??
    it.startingPrice ??
    0
  ),

  // Duration / time
  durationHours: Number(it.duration_hours ?? it.durationHours ?? 0),
  createdAt: it.created_at ?? it.createdAt ?? null,
  endTime: it.end_time ?? it.endTime ?? null,

  // Auction/availability
  active: it.active ?? it.isActive ?? true,

  // Seller / shipping
  sellerId: it.seller_id ?? it.sellerId ?? null,
  shippingCost: Number(it.shipping_cost ?? it.shippingCost ?? 0),
  shippingTime: Number(it.shipping_time ?? it.shippingTime ?? 0),

  // Remaining time
  remainingTimeSeconds: Number(
    it.remaining_time_seconds ??
    it.remainingTimeSeconds ??
    it.remaining ??
    0
  ),
});

// GET /catalogue/items → list all items
export const fetchAllItems = async () => {
  const res = await apiClient.get("/catalogue/items");
  const parsed = parseCatalogueResponse(res.data);
  return parsed.map(normalizeItem);
};

// GET /catalogue/search?keyword=... → search items by title
export const searchItems = async (keyword) => {
  const res = await apiClient.get("/catalogue/search", {
    params: { keyword },
  });
  const parsed = parseCatalogueResponse(res.data);
  return parsed.map(normalizeItem);
};

// GET /catalogue/items/{id} → single item (for detail page)
export const fetchItem = async (id) => {
  const res = await apiClient.get(`/catalogue/items/${id}`);
  // Single item, no need for parseCatalogueResponse
  return normalizeItem(res.data);
};

// POST /catalogue/items → create new catalogue item (optional, for your upload form)
export const createItem = async (payload) => {
  // Expect payload with keys: title, description, startingPrice, durationHours, sellerId, etc.
  const res = await apiClient.post("/catalogue/items", payload);
  return normalizeItem(res.data);
};
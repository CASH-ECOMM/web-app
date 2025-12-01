import apiClient from '../api/api';

/*
 * Service functions for interacting with the auction endpoints exposed
 * by the router‑service.  These calls manage auction state and
 * bidding operations.  All functions return the data portion of the
 * Axios response.
 */

/**
 * Retrieve the current auction status for a catalogue item.
 *
 * @param {number|string} catalogueId - The catalogue item identifier.
 * @returns {Promise<Object>} A promise resolving to an object
 *                            containing highestBidder, currentHighestBid,
 *                            remainingTime, auctionStatus and other
 *                            metadata defined by the backend.
 */
export async function getAuctionStatus(catalogueId) {
  const res = await apiClient.get(`/auctions/${catalogueId}/status`);
  return res.data;
}

/**
 * Place a bid on a catalogue item.
 *
 * @param {number|string} catalogueId - The catalogue item identifier.
 * @param {number} bidAmount - The amount to bid.
 * @returns {Promise<Object>} A promise resolving to the response
 *                            containing success and message fields.
 */
export async function placeBid(catalogueId, bidAmount) {
  const res = await apiClient.post(`/auctions/${catalogueId}/bid`, {
    bidAmount,
  });
  return res.data;
}

/**
 * Optionally start an auction.  Some items may not have an active
 * auction session until explicitly started.  The backend will
 * initialise the auction window based on the item's end time and
 * starting price.
 *
 * @param {number|string} catalogueId - The catalogue item identifier.
 */
export async function startAuction(catalogueId) {
  const res = await apiClient.post(`/auctions/${catalogueId}/start`);
  return res.data;
}

/**
 * Fetch the auction end time for a catalogue item.  Useful if you
 * need to synchronise a countdown timer with the server.  Returns
 * an object containing `catalogueId` and `remainingTime` (in
 * seconds) among other fields.
 *
 * @param {number|string} catalogueId
 */
export async function getAuctionEnd(catalogueId) {
  const res = await apiClient.get(`/auctions/${catalogueId}/end`);
  return res.data;
}

/**
 * Retrieve the winner of a completed auction.  The backend will
 * return `found: true` if the auction is finished along with
 * `winningUserId` and `finalPrice`.  If the auction is still in
 * progress, `found` will be false.
 *
 * @param {number|string} catalogueId
 */
export async function getAuctionWinner(catalogueId) {
  const res = await apiClient.get(`/auctions/${catalogueId}/winner`);
  return res.data;
}
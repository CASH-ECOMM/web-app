import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
  Stack,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { fetchItem } from "../services/catalogue";
import {
  getAuctionStatus,
  placeBid,
  getAuctionWinner,
} from "../services/auction";

// Format seconds into "HH:MM:SS"
function formatSecondsToHHMMSS(seconds) {
  if (seconds == null || seconds <= 0) return "00:00:00";

  const s = Math.floor(seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

const CatalogueItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const catalogueId = Number(id);

  // STATE
  const [item, setItem] = useState(null);         // catalogue item data
  const [status, setStatus] = useState(null);     // auction status from auction-service
  const [winner, setWinner] = useState(null);     // winner info after auction ends

  const [remainingTime, setRemainingTime] = useState(null); // countdown seconds
  const [bidAmount, setBidAmount] = useState("");           // input field for bid

  const [loadingItem, setLoadingItem] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [placingBid, setPlacingBid] = useState(false);

  const [error, setError] = useState("");         // error for UI
  const [infoMessage, setInfoMessage] = useState(""); // success/info message
  // track which item the user currently has an active bid on (synced with Catalogue)
  const [activeBidItemId, setActiveBidItemId] = useState(() => {
    const stored = localStorage.getItem("activeBidItemId");
    return stored ? Number(stored) : null;
  });

  // FETCH ITEM DETAILS
  useEffect(() => {
    const loadItem = async () => {
      setLoadingItem(true);
      setError("");
      try {
        const data = await fetchItem(catalogueId);
        setItem(data);

        // Initialise remainingTime from item (defensive: camelCase + snake_case)
        const initialRt =
          data.remainingTimeSeconds ??
          data.remaining_time_seconds ??
          data.remainingTime ??
          data.remainingSeconds ??
          null;

        if (initialRt != null) {
          setRemainingTime(initialRt);
        }
      } catch (err) {
        console.error(err);
        setError("Item not found or failed to load.");
      } finally {
        setLoadingItem(false);
      }
    };

    if (!Number.isNaN(catalogueId)) {
      loadItem();
    } else {
      setError("Invalid catalogue id.");
      setLoadingItem(false);
    }
  }, [catalogueId]);

  // FETCH AUCTION STATUS
  useEffect(() => {
    const loadStatus = async () => {
      setLoadingStatus(true);
      try {
        const s = await getAuctionStatus(catalogueId);
        setStatus(s);

        // remainingTime might come under different keys, so we are defensive
        const rt =
          s.remainingTimeSeconds ??
          s.remaining_time_seconds ??
          s.remainingTime ??
          s.remainingSeconds ??
          item?.remainingTimeSeconds ??
          item?.remaining_time_seconds ??
          remainingTime; // fall back to whatever we already had

        if (rt != null) {
          setRemainingTime(rt);
        }

        // Initialize bid amount a little higher than current highest bid or starting price
        let base = null;
        if (s.currentHighestBid != null) {
          base = Number(s.currentHighestBid);
        } else if (item?.currentPrice != null || item?.current_price != null) {
          base = Number(item.currentPrice ?? item.current_price);
        } else if (
          item?.startingPrice != null ||
          item?.starting_price != null
        ) {
          base = Number(item.startingPrice ?? item.starting_price);
        }

        if (base != null && !Number.isNaN(base)) {
          setBidAmount((base + 1).toFixed(2));
        }
      } catch (err) {
        console.error(err);
        // No active auction / error: fall back to item's remaining time if we have it
        if (
          (item?.remainingTimeSeconds != null ||
            item?.remaining_time_seconds != null) &&
          remainingTime == null
        ) {
          setRemainingTime(
            item.remainingTimeSeconds ?? item.remaining_time_seconds
          );
        }
      } finally {
        setLoadingStatus(false);
      }
    };

    if (!Number.isNaN(catalogueId)) {
      loadStatus();
    }
  }, [catalogueId, item]); // rerun once item is loaded so we can use its fallback

  // COUNTDOWN TIMER
  useEffect(() => {
    if (remainingTime == null || remainingTime <= 0) return;

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev == null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime]);

  // LOAD WINNER WHEN AUCTION ENDS
  useEffect(() => {
    const loadWinner = async () => {
      try {
        const w = await getAuctionWinner(catalogueId);
        setWinner(w);
      } catch (err) {
        console.error(err);
        // Winner endpoint might fail if auction not finalized yet
      }
    };

    if (remainingTime === 0 && !winner && !loadingStatus) {
      loadWinner();
    }
  }, [remainingTime, winner, loadingStatus, catalogueId]);

  const auctionEnded =
    remainingTime != null && remainingTime <= 0;
  // lock bidding if user already has an active bid on a different item
  const biddingLockedToOtherItem =
    activeBidItemId != null && activeBidItemId !== catalogueId;

  // Current highest bid based on status or item
  const currentHighestBid = useMemo(() => {
    if (status?.currentHighestBid != null) {
      return Number(status.currentHighestBid);
    }

    // Defensive: currentPrice / current_price, startingPrice / starting_price
    if (item?.currentPrice != null || item?.current_price != null) {
      return Number(item.currentPrice ?? item.current_price);
    }
    if (item?.startingPrice != null || item?.starting_price != null) {
      return Number(item.startingPrice ?? item.starting_price);
    }
    return 0;
  }, [status, item]);

  //  HANDLERS

  const handleQuickBid = (increment) => {
    const base = Number(currentHighestBid);
    if (Number.isNaN(base)) return;
    const next = base + increment;
    setBidAmount(next.toFixed(2));
  };

  const handlePlaceBid = async () => {
    setError("");
    setInfoMessage("");
    // enforce single active bid rule same as in Catalogue page
    if (biddingLockedToOtherItem) {
      setError(
        "You already have an active bid on another item. You can only bid on one item at a time."
      );
      return;
    }

    const numericBid = Number(bidAmount);
    if (Number.isNaN(numericBid) || numericBid <= 0) {
      setError("Please enter a valid bid amount.");
      return;
    }

    if (numericBid <= currentHighestBid) {
      setError(
        `Your bid must be higher than the current highest bid ($${currentHighestBid.toFixed(
          2
        )}).`
      );
      return;
    }

    if (auctionEnded) {
      setError("This auction has already ended.");
      return;
    }

    setPlacingBid(true);
    try {
      // placeBid call
      const response = await placeBid(catalogueId, numericBid);

      if (response?.success === false) {
        setError(response.message || "Bid was not accepted.");
      } else {
        setInfoMessage(response?.message || "Bid placed successfully.");

        // mark this item as the active bid item
        setActiveBidItemId(catalogueId);
        localStorage.setItem("activeBidItemId", String(catalogueId));

        // Refresh status after successful bid
        const s = await getAuctionStatus(catalogueId);
        setStatus(s);

        const rt =
          s.remainingTimeSeconds ??
          s.remaining_time_seconds ??
          s.remainingTime ??
          s.remainingSeconds ??
          remainingTime;
        if (rt != null) {
          setRemainingTime(rt);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to place bid. Please try again.");
    } finally {
      setPlacingBid(false);
    }
  };

  const handleBack = () => {
    navigate(-1); // go back to previous page (which is /catalogue)
  };

  // CONDITIONAL RENDERING

  if (loadingItem) {
    return (
      <Box p={3} display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !item) {
    return (
      <Box p={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back
        </Button>
        <Typography color="error" mt={2}>
          {error}
        </Typography>
      </Box>
    );
  }

  // MAIN RENDER

  return (
    <Box p={3}>
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={handleBack}
        >
          Back to catalogue
        </Button>
        <Typography variant="h5">{item?.title}</Typography>
      </Stack>

      <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={3}>
        {/* Left column: description */}
        <Box flex={1}>
          <Typography variant="h4" gutterBottom>
            Description
          </Typography>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body1">
                {item?.description || "No description provided."}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Right column: auction panel */}
        <Box flex={1} maxWidth={{ md: 420 }}>
          <Card variant="outlined">
            <CardContent>
              {/* Bid details header */}
              <Typography variant="h4" gutterBottom>
                Bid Details
              </Typography>
              {/* Timer */}
              <Typography variant="subtitle2" color="text.secondary">
                Time remaining
              </Typography>
              <Typography variant="h4" gutterBottom>
                {auctionEnded
                  ? "Auction ended"
                  : formatSecondsToHHMMSS(remainingTime)}
              </Typography>

              {/* Current bid */}
              <Typography variant="subtitle2" color="text.secondary">
                Current bid
              </Typography>
              <Typography variant="h5" gutterBottom>
                ${currentHighestBid.toFixed(2)}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Quick bids */}
              <Typography variant="subtitle2" mb={1}>
                Quick bids
              </Typography>
              <Stack direction="row" spacing={1} mb={2}>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={auctionEnded}
                  onClick={() => handleQuickBid(5)}
                >
                  + $5
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={auctionEnded}
                  onClick={() => handleQuickBid(10)}
                >
                  + $10
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={auctionEnded}
                  onClick={() => handleQuickBid(20)}
                >
                  + $20
                </Button>
              </Stack>

              {/* Custom bid */}
              <Typography variant="subtitle2" mb={1}>
                Place your bid
              </Typography>
              <Stack direction="row" spacing={1} mb={2}>
                <TextField
                  size="small"
                  type="number"
                  inputProps={{ step: "1", min: 0 }}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  disabled={auctionEnded || placingBid}
                  fullWidth
                  placeholder="Enter amount"
                />
                <Button
                  variant="contained"
                  onClick={handlePlaceBid}
                  disabled={auctionEnded || placingBid}
                >
                  {placingBid ? "Placing..." : "Place Bid"}
                </Button>
              </Stack>

              {error && (
                <Typography color="error" variant="body2" mb={1}>
                  {error}
                </Typography>
              )}
              {infoMessage && (
                <Typography color="success.main" variant="body2" mb={1}>
                  {infoMessage}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Auction info */}
              <Typography variant="subtitle2" mb={1}>
                Auction info
              </Typography>
              {loadingStatus && (
                <Typography variant="body2">Loading auction status…</Typography>
              )}
              {!loadingStatus && !status && (
                <Typography variant="body2">
                  No active auction found for this item.
                </Typography>
              )}
              {!loadingStatus && status && (
                <Box>
                  <Typography variant="body2">
                    Highest bidder:{" "}
                    {status.highestBidder != null
                      ? `User #${status.highestBidder}`
                      : "No bids yet"}
                  </Typography>
                  <Typography variant="body2">
                    Status: {status.auctionStatus || "Unknown"}
                  </Typography>
                </Box>
              )}

              {/* Winner info after auction ends */}
              {auctionEnded && winner && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" mb={1}>
                    Winner
                  </Typography>
                  <Typography variant="body2">
                    Winner:{" "}
                    {winner.winnerId != null
                      ? `User #${winner.winnerId}`
                      : "No winner"}
                  </Typography>
                  <Typography variant="body2">
                    Final price: $
                    {winner.finalPrice
                      ? Number(winner.finalPrice).toFixed(2)
                      : "0.00"}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default CatalogueItemDetail;
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Paper,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
import { fetchAllItems, searchItems } from "../services/catalogue";
import { getAuctionStatus, placeBid } from "../services/auction";

const ROWS_PER_PAGE_DEFAULT = 10;

// Format seconds into "HH:MM:SS" or "Ended"
function formatSecondsToHHMMSS(seconds) {
  if (seconds == null || seconds <= 0) return "Ended";

  const s = Math.floor(seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

// Sort logic for different sort options
function sortItems(items, sortOption) {
  const copy = [...items];
  switch (sortOption) {
    case "timeAsc":
      return copy.sort(
        (a, b) =>
          (a.remainingTimeSeconds ?? Infinity) -
          (b.remainingTimeSeconds ?? Infinity)
      );
    case "timeDesc":
      return copy.sort(
        (a, b) =>
          (b.remainingTimeSeconds ?? -Infinity) -
          (a.remainingTimeSeconds ?? -Infinity)
      );
    case "priceAsc":
      return copy.sort(
        (a, b) => Number(a.currentPrice) - Number(b.currentPrice)
      );
    case "priceDesc":
      return copy.sort(
        (a, b) => Number(b.currentPrice) - Number(a.currentPrice)
      );
    case "titleAsc":
      return copy.sort((a, b) =>
        String(a.title).localeCompare(String(b.title))
      );
    default:
      return copy;
  }
}

// if there is a latest highest bid and remaining time, update the item
async function enrichItemsWithAuctionStatus(items) {
  const updated = await Promise.all(
    items.map(async (item) => {
      try {
        const status = await getAuctionStatus(item.id);
        if (!status) return item;

        const newPrice =
          status.currentHighestBid != null
            ? Number(status.currentHighestBid)
            : item.currentPrice;

        const newRemaining =
          status.remainingTimeSeconds ??
          status.remainingTime ??
          status.remainingSeconds ??
          item.remainingTimeSeconds;

        return {
          ...item,
          currentPrice: newPrice,
          remainingTimeSeconds: newRemaining,
        };
      } catch {
        // If no active auction or error, just return original item
        return item;
      }
    })
  );
  return updated;
}

const Catalogue = () => {
  // STATE
  const [itemsRaw, setItemsRaw] = useState([]); // all items from backend
  const [searchTerm, setSearchTerm] = useState(""); // search input text
  const [sortOption, setSortOption] = useState("timeAsc");
  const [page, setPage] = useState(0); // 0-based for TablePagination
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_DEFAULT);
  const [selectedIds, setSelectedIds] = useState([]); // selected item IDs (checkboxes)
  const [loading, setLoading] = useState(false); // spinner flag
  const [error, setError] = useState(""); // error message

  // inline bidding state (per item)
  const [bidValues, setBidValues] = useState({}); // { [itemId]: "123.45" }
  const [bidErrors, setBidErrors] = useState({}); // { [itemId]: "Error message" }
  const [bidMessages, setBidMessages] = useState({}); // { [itemId]: "Success message" }
  const [biddingIds, setBiddingIds] = useState([]); // ids currently placing bid

  // track which item the user currently has an active bid on
  const [activeBidItemId, setActiveBidItemId] = useState(() => {
    const stored = localStorage.getItem("activeBidItemId");
    return stored ? Number(stored) : null;
  });

  // INITIAL LOAD
  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchAllItems();
        let items = Array.isArray(data) ? data : [];
        // overlay auction currentHighestBid + remaining time
        items = await enrichItemsWithAuctionStatus(items);
        setItemsRaw(items);
      } catch (err) {
        console.error("Error loading catalogue items:", err);
        const message =
          err?.response?.data?.message ||
          err?.response?.statusText ||
          err?.message ||
          "Failed to load catalogue items.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setItemsRaw((prevItems) =>
        prevItems.map((item) => {
          const rt = item.remainingTimeSeconds;
          if (rt == null || rt <= 0) return item;
          return {
            ...item,
            remainingTimeSeconds: Math.max(rt - 1, 0),
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // HANDLERS

  // Called when the user submits the search form.
  const handleSearchSubmit = async (e) => {
    e.preventDefault(); // Prevent full page reload
    setPage(0); // Reset to first page on new search
    setLoading(true);
    setError("");

    try {
      let data;
      if (!searchTerm.trim()) {
        data = await fetchAllItems();
      } else {
        data = await searchItems(searchTerm.trim());
      }
      let items = Array.isArray(data) ? data : [];
      // overlay auction data after search
      items = await enrichItemsWithAuctionStatus(items);
      setItemsRaw(items);
    } catch (err) {
      console.error("Error searching items:", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.statusText ||
        err?.message ||
        "Error while searching items.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value); // update sort option (including "aliveOnly")
    setPage(0); // reset to first page
  };

  // Connected to TablePagination, updates page when user clicks next/prev.
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleRowCheckboxClick = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // inline bid value change
  const handleBidValueChange = (itemId, value) => {
    setBidValues((prev) => ({ ...prev, [itemId]: value }));
    setBidErrors((prev) => ({ ...prev, [itemId]: "" }));
    setBidMessages((prev) => ({ ...prev, [itemId]: "" }));
  };

  // place bid from catalogue row
  const handleRowPlaceBid = async (item) => {
    const itemId = item.id;
    const currentPrice = Number(item.currentPrice ?? item.startingPrice ?? 0);
    const amountStr = bidValues[itemId];
    const amount = Number(amountStr);

    if (activeBidItemId != null && activeBidItemId !== itemId) {
      setBidErrors((prev) => ({
        ...prev,
        [itemId]:
          "You already have an active bid on another item. You can only bid on one item at a time.",
      }));
      return;
    }

    // clear previous messages for this item
    setBidErrors((prev) => ({ ...prev, [itemId]: "" }));
    setBidMessages((prev) => ({ ...prev, [itemId]: "" }));

    // basic validation
    if (!amountStr || Number.isNaN(amount) || amount <= 0) {
      setBidErrors((prev) => ({
        ...prev,
        [itemId]: "Please enter a valid bid amount.",
      }));
      return;
    }

    if (amount <= currentPrice) {
      setBidErrors((prev) => ({
        ...prev,
        [itemId]: `Bid must be higher than current bid ($${currentPrice.toFixed(
          2
        )}).`,
      }));
      return;
    }

    if (item.remainingTimeSeconds != null && item.remainingTimeSeconds <= 0) {
      setBidErrors((prev) => ({
        ...prev,
        [itemId]: "This auction has already ended.",
      }));
      return;
    }

    // mark this row as "bidding"
    setBiddingIds((prev) => [...prev, itemId]);
    try {
      const response = await placeBid(itemId, amount);

      if (response?.success === false) {
        setBidErrors((prev) => ({
          ...prev,
          [itemId]: response.message || "Bid was not accepted.",
        }));
      } else {
        setBidMessages((prev) => ({
          ...prev,
          [itemId]: response?.message || "Bid placed successfully.",
        }));
        // Mark this item as having an active bid
        setActiveBidItemId(itemId);
        localStorage.setItem("activeBidItemId", String(itemId));

        // refresh auction status to update current price & remaining time
        try {
          const status = await getAuctionStatus(itemId);
          const newPrice =
            status.currentHighestBid != null
              ? Number(status.currentHighestBid)
              : currentPrice;
          const newRemaining =
            status.remainingTimeSeconds ??
            status.remainingTime ??
            status.remainingSeconds ??
            item.remainingTimeSeconds;

          setItemsRaw((prevItems) =>
            prevItems.map((it) =>
              it.id === itemId
                ? {
                  ...it,
                  currentPrice: newPrice,
                  remainingTimeSeconds: newRemaining,
                }
                : it
            )
          );
        } catch (statusErr) {
          console.error("Error refreshing auction status:", statusErr);
        }
      }
    } catch (err) {
      console.error("Error placing bid from catalogue:", err);
      // Show backend error message
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to place bid. Please try again.";
      setBidErrors((prev) => ({
        ...prev,
        [itemId]: message,
      }));
    } finally {
      setBiddingIds((prev) => prev.filter((x) => x !== itemId));
    }
  };

  // DERIVED DATA WITH "ALIVE ONLY" OPTION

  // default behaviour = show ONLY alive items.
  // If sortOption === "all", show alive + ended.
  const filteredItems = useMemo(() => {
    if (sortOption === "all") {
      return itemsRaw;
    }
    // show only alive auctions
    return itemsRaw.filter(
      (item) =>
        item.remainingTimeSeconds == null || item.remainingTimeSeconds > 0
    );
  }, [itemsRaw, sortOption]);

  // For all
  const effectiveSortOption =
    sortOption === "all" ? "timeAsc" : sortOption;

  // Sort visible items
  const sortedItems = useMemo(
    () => sortItems(filteredItems, effectiveSortOption),
    [filteredItems, effectiveSortOption]
  );

  // Pagination over sorted items
  const paginatedItems = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedItems.slice(start, start + rowsPerPage);
  }, [sortedItems, page, rowsPerPage]);

  // Selection is based on visible items (filtered)
  const isAllSelected =
    filteredItems.length > 0 && selectedIds.length === filteredItems.length;

  const handleSelectAllClick = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredItems.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  // RENDER

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Catalogue
      </Typography>

      {/* Search + sort row */}
      <Box
        component="form"
        onSubmit={handleSearchSubmit}
        mb={2}
        display="flex"
        flexWrap="wrap"
        gap={2}
        alignItems="center"
      >
        <TextField
          size="small"
          label="Search items"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button type="submit" variant="contained">
          Search
        </Button>

        <Box flexGrow={1} />

        {/* Top sort / filter */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="sort-by-label">Sort / Filter</InputLabel>
          <Select
            labelId="sort-by-label"
            value={sortOption}
            label="Sort / Filter"
            onChange={handleSortChange}
          >
            <MenuItem value="timeAsc">Time left (ascending)</MenuItem>
            <MenuItem value="timeDesc">Time left (descending)</MenuItem>
            <MenuItem value="priceAsc">Price (low to high)</MenuItem>
            <MenuItem value="priceDesc">Price (high to low)</MenuItem>
            <MenuItem value="titleAsc">Title (A–Z)</MenuItem>
            <MenuItem value="all">
              All auctions (alive + ended)
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      {!loading && !error && sortedItems.length === 0 && (
        <Typography>No items found.</Typography>
      )}

      {!loading && !error && sortedItems.length > 0 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selectedIds.length > 0 &&
                        selectedIds.length < filteredItems.length
                      }
                      checked={isAllSelected}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Current bid</TableCell>
                  <TableCell>Time left</TableCell>
                  <TableCell>Bid</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map((item) => {
                  const itemId = item.id;
                  const bidValue = bidValues[itemId] ?? "";
                  const bidError = bidErrors[itemId];
                  const bidMessage = bidMessages[itemId];
                  const isBidding = biddingIds.includes(itemId);
                  const ended =
                    item.remainingTimeSeconds != null &&
                    item.remainingTimeSeconds <= 0;
                  // NEW: user can only bid on this row if:
                  //  - auction not ended
                  //  - not currently sending a bid
                  //  - EITHER no activeBidItemId OR this row is their active bid item

                  const biddingLockedToOtherItem =
                    activeBidItemId != null && activeBidItemId !== itemId;

                  const bidDisabled =
                    ended || isBidding || biddingLockedToOtherItem;
                  return (
                    <TableRow
                      key={item.id}
                      hover
                      role="checkbox"
                      aria-checked={selectedIds.includes(item.id)}
                      selected={selectedIds.includes(item.id)}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleRowCheckboxClick(item.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/catalogue/${item.id}`}
                          style={{ textDecoration: "none" }}
                        >
                          <Typography color="primary">{item.title}</Typography>
                        </Link>
                      </TableCell>
                      <TableCell>
                        $
                        {Number(
                          item.currentPrice ?? item.startingPrice ?? 0
                        ).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {formatSecondsToHHMMSS(item.remainingTimeSeconds)}
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Stack direction="row" spacing={1}>
                            <TextField
                              size="small"
                              type="number"
                              inputProps={{ step: "1", min: 0 }}
                              value={bidValue}
                              onChange={(e) =>
                                handleBidValueChange(itemId, e.target.value)
                              }
                              disabled={bidDisabled}
                              placeholder={
                                biddingLockedToOtherItem
                                  ? "Active bid on another item"
                                  : "Bid"
                              }
                            />
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleRowPlaceBid(item)}
                              disabled={ended || isBidding}
                            >
                              {isBidding ? "..." : "Bid"}
                            </Button>
                          </Stack>
                          {bidError && (
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ maxWidth: 220 }}
                            >
                              {bidError}
                            </Typography>
                          )}
                          {bidMessage && (
                            <Typography
                              variant="caption"
                              color="success.main"
                              sx={{ maxWidth: 220 }}
                            >
                              {bidMessage}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer: pagination only (sort/filter removed) */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
            px={2}
            py={1}
          >
            {/* Bottom sort is commented out to have it only on top.
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="sort-by-bottom-label">Sort / Filter</InputLabel>
              <Select
                labelId="sort-by-bottom-label"
                value={sortOption}
                label="Sort / Filter"
                onChange={handleSortChange}
              >
                <MenuItem value="timeAsc">Time left (ascending)</MenuItem>
                <MenuItem value="timeDesc">Time left (descending)</MenuItem>
                <MenuItem value="priceAsc">Price (low to high)</MenuItem>
                <MenuItem value="priceDesc">Price (high to low)</MenuItem>
                <MenuItem value="titleAsc">Title (A–Z)</MenuItem>
                <MenuItem value="aliveOnly">
                  Alive auctions only
                </MenuItem>
              </Select>
            </FormControl>
            */}

            <Stack direction="row" spacing={2} alignItems="center">
              <TablePagination
                component="div"
                count={sortedItems.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </Stack>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Catalogue;
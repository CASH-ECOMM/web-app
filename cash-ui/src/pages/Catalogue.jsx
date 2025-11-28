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

const Catalogue = () => {
  // STATE
  const [itemsRaw, setItemsRaw] = useState([]);          // all items from backend
  const [searchTerm, setSearchTerm] = useState("");      // search input text
  const [sortOption, setSortOption] = useState("timeAsc");
  const [page, setPage] = useState(0);                   // 0-based for TablePagination
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_DEFAULT);
  const [selectedIds, setSelectedIds] = useState([]);    // selected item IDs (checkboxes)
  const [loading, setLoading] = useState(false);         // spinner flag
  const [error, setError] = useState("");                // error message

  // INITIAL LOAD
  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchAllItems();
        setItemsRaw(Array.isArray(data) ? data : []);
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

  // HANDLERS

  // Called when the user submits the search form.
  const handleSearchSubmit = async (e) => {
    e.preventDefault();       // Prevent full page reload
    setPage(0);               // Reset to first page on new search
    setLoading(true);
    setError("");

    try {
      if (!searchTerm.trim()) {
        const data = await fetchAllItems();
        setItemsRaw(Array.isArray(data) ? data : []);
      } else {
        const data = await searchItems(searchTerm.trim());
        setItemsRaw(Array.isArray(data) ? data : []);
      }
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
    setSortOption(e.target.value); // update sort option
    setPage(0);                    // reset to first page
  };

  // Connected to TablePagination, updates page when user clicks next/prev.
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // Are all items selected?
  const isAllSelected =
    itemsRaw.length > 0 && selectedIds.length === itemsRaw.length;

  // Handle select-all checkbox click
  const handleSelectAllClick = (e) => {
    if (e.target.checked) {
      setSelectedIds(itemsRaw.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleRowCheckboxClick = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // DERIVED DATA

  // Use useMemo to avoid re-sorting on every render
  const sortedItems = useMemo(
    () => sortItems(itemsRaw, sortOption),
    [itemsRaw, sortOption]
  );

  const paginatedItems = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedItems.slice(start, start + rowsPerPage);
  }, [sortedItems, page, rowsPerPage]);

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

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="sort-by-label">Sort by</InputLabel>
          <Select
            labelId="sort-by-label"
            value={sortOption}
            label="Sort by"
            onChange={handleSortChange}
          >
            <MenuItem value="timeAsc">Time left (ascending)</MenuItem>
            <MenuItem value="timeDesc">Time left (descending)</MenuItem>
            <MenuItem value="priceAsc">Price (low to high)</MenuItem>
            <MenuItem value="priceDesc">Price (high to low)</MenuItem>
            <MenuItem value="titleAsc">Title (A–Z)</MenuItem>
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

      {!loading && !error && itemsRaw.length === 0 && (
        <Typography>No items found.</Typography>
      )}

      {!loading && !error && itemsRaw.length > 0 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selectedIds.length > 0 &&
                        selectedIds.length < itemsRaw.length
                      }
                      checked={isAllSelected}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Current bid</TableCell>
                  <TableCell>Time left</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map((item) => (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer: sort + pagination */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={2}
            py={1}
          >
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="sort-by-bottom-label">Sort by</InputLabel>
              <Select
                labelId="sort-by-bottom-label"
                value={sortOption}
                label="Sort by"
                onChange={handleSortChange}
              >
                <MenuItem value="timeAsc">Time left (ascending)</MenuItem>
                <MenuItem value="timeDesc">Time left (descending)</MenuItem>
                <MenuItem value="priceAsc">Price (low to high)</MenuItem>
                <MenuItem value="priceDesc">Price (high to low)</MenuItem>
                <MenuItem value="titleAsc">Title (A–Z)</MenuItem>
              </Select>
            </FormControl>

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
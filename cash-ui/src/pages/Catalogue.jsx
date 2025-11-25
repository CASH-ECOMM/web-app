import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/api';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  FormControl,
  Select,
  MenuItem,
  Pagination,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';

const PAGE_SIZE = 10;

const parseCatalogueResponse = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data._embedded) {
    const keys = Object.keys(data._embedded);
    if (keys.length > 0) return data._embedded[keys[0]] || [];
  }
  if (Array.isArray(data.content)) return data.content;
  return [];
};

const formatRemaining = (seconds) => {
  if (!seconds || seconds <= 0) return 'Ended';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const Catalogue = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [viewItem, setViewItem] = useState(null);
  const [bidValue, setBidValue] = useState('');
  const [bidSuccess, setBidSuccess] = useState(false);
  const [bidError, setBidError] = useState('');
  const [recentBids, setRecentBids] = useState([]);

  useEffect(() => {
    let mounted = true;
    const loadItems = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/catalogue/items');
        const parsed = parseCatalogueResponse(res.data);
        const normalized = parsed.map((it) => ({
          id: it.id ?? it.itemId ?? Math.random(),
          title: it.title ?? it.name ?? 'Untitled',
          description: it.description ?? '',
          current_price: Number(it.current_price ?? it.currentPrice ?? 0),
          remaining_time_seconds: Number(
            it.remaining_time_seconds ??
              it.remainingTimeSeconds ??
              it.remaining ??
              0
          ),
          created_at: it.created_at ?? it.createdAt ?? '',
        }));
        if (mounted) setItems(normalized);
      } catch (err) {
        if (mounted) setError(err?.message || 'Failed to load items');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadItems();
    return () => (mounted = false);
  }, []);

  const sortedItems = useMemo(() => {
    const list = [...items];
    switch (sortBy) {
      case 'title':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case 'current_price':
        return list.sort((a, b) => a.current_price - b.current_price);
      case 'remaining_time_seconds':
        return list.sort(
          (a, b) => a.remaining_time_seconds - b.remaining_time_seconds
        );
      default:
        return list.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
    }
  }, [items, sortBy]);

  const totalPages = Math.ceil(sortedItems.length / PAGE_SIZE);
  const pageItems = sortedItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePlaceBid = () => {
    setBidError('');
    if (!bidValue || isNaN(bidValue) || Number(bidValue) <= 0) {
      setBidError('Please enter a valid bid.');
      return;
    }
    if (Number(bidValue) <= viewItem.current_price) {
      setBidError(
        `Bid must be greater than current bid ($${viewItem.current_price.toFixed(2)})`
      );
      return;
    }

    const newBid = {
      username: 'You',
      time: new Date().toLocaleString(),
      amount: Number(bidValue),
    };

    setRecentBids((prev) => [newBid, ...prev]);

    setBidSuccess(true);
    setBidValue('');

    setViewItem((prev) => ({ ...prev, current_price: Number(bidValue) }));

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === viewItem.id
          ? { ...item, current_price: Number(bidValue) }
          : item
      )
    );
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>
        Catalogue
      </Typography>

      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Typography>Sort By:</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <MenuItem value="created_at">Newest</MenuItem>
            <MenuItem value="title">Title</MenuItem>
            <MenuItem value="current_price">Current Bid</MenuItem>
            <MenuItem value="remaining_time_seconds">Time Left</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Current Bid</TableCell>
              <TableCell>Time Left</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageItems.map((it) => (
              <TableRow key={it.id}>
                <TableCell>{it.title}</TableCell>
                <TableCell>${it.current_price.toFixed(2)}</TableCell>
                <TableCell>
                  {formatRemaining(it.remaining_time_seconds)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setViewItem(it);
                      setBidSuccess(false);
                      setBidError('');
                      setRecentBids([]);
                    }}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, val) => setPage(val)}
        />
      </Box>

      {/* Dialog for item details */}
      {viewItem && (
        <Dialog
          open={true}
          onClose={() => setViewItem(null)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>{viewItem.title}</DialogTitle>
          <DialogContent>
            <Typography mb={1}>
              <strong>Description:</strong>
            </Typography>
            <Typography mb={2}>{viewItem.description}</Typography>
            <Typography mb={2}>
              Time Left: {formatRemaining(viewItem.remaining_time_seconds)}
            </Typography>
            <Typography mb={2}>
              Current Bid: ${viewItem.current_price.toFixed(2)}
            </Typography>

            <TextField
              label="Your Bid"
              type="number"
              fullWidth
              value={bidValue}
              onChange={(e) => setBidValue(e.target.value)}
              sx={{ mb: 2 }}
            />
            {bidError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {bidError}
              </Alert>
            )}
            {bidSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Bid placed successfully!
              </Alert>
            )}

            {recentBids.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle1">Recent Bids</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Username</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentBids.map((b, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{b.username}</TableCell>
                        <TableCell>{b.time}</TableCell>
                        <TableCell>${b.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePlaceBid} variant="contained">
              Place Bid
            </Button>
            <Button onClick={() => setViewItem(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default Catalogue;

import React, { useEffect, useState, useMemo } from 'react';
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
  Checkbox,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Pagination,
} from '@mui/material';

const PAGE_SIZE_OPTIONS = [5, 10, 20];

const MyItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [sortBy, setSortBy] = useState('created_at');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());

  const parseCatalogueResponse = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data._embedded) {
      const keys = Object.keys(data._embedded);
      if (keys.length === 1) return data._embedded[keys[0]] || [];
      return keys.reduce((acc, k) => {
        if (Array.isArray(data._embedded[k]))
          acc = acc.concat(data._embedded[k]);
        return acc;
      }, []);
    }
    if (Array.isArray(data.content)) return data.content;
    if (Array.isArray(data.items)) return data.items;
    return Array.isArray(data) ? data : [];
  };

  const formatRemaining = (seconds) => {
    if (seconds <= 0) return 'Ended';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(
      s
    ).padStart(2, '0')}`;
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get('/catalogue/items');
        const parsed = parseCatalogueResponse(res.data);
        const normalized = parsed.map((it) => ({
          id: it.id ?? it.itemId ?? it.name ?? Math.random(),
          title: it.title ?? it.name ?? 'Untitled',
          description: it.description ?? '',
          current_price: it.current_price ?? it.currentPrice ?? 0,
          remaining_time_seconds:
            Number(
              it.remaining_time_seconds ??
                it.remainingTimeSeconds ??
                it.remaining ??
                0
            ) || 0,
          active:
            typeof it.active === 'boolean' ? it.active : it.active === 'true',
          created_at: it.created_at ?? it.createdAt ?? '',
        }));
        if (!mounted) return;
        setItems(normalized);
      } catch (err) {
        setError(err?.response?.data || err.message || 'Failed to load items');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, []);

  const filteredSorted = useMemo(() => {
    let list = items.slice();
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (i) =>
          (i.title && i.title.toLowerCase().includes(q)) ||
          (i.description && i.description.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'current_price':
          return Number(a.current_price) - Number(b.current_price);
        case 'remaining_time_seconds':
          return (
            Number(a.remaining_time_seconds) - Number(b.remaining_time_seconds)
          );
        case 'created_at':
        default:
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
      }
    });
    return list;
  }, [items, search, sortBy]);

  const totalPages = Math.ceil(filteredSorted.length / pageSize);
  const pageItems = filteredSorted.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const toggleSelect = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  if (loading) return <Typography>Loading items...</Typography>;
  if (error)
    return (
      <Typography color="error">Error: {JSON.stringify(error)}</Typography>
    );

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>
        My Items
      </Typography>

      {/* controls */}
      <Box
        display="flex"
        justifyContent="space-between"
        mb={2}
        gap={2}
        alignItems="center"
      >
        <TextField
          label="Search title or description"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          variant="outlined"
          size="small"
          sx={{
            backgroundColor: 'white',
            '& .MuiInputBase-input': { color: 'black' },
          }}
        />

        {/* sort by */}
        <Box display="flex" alignItems="center" gap={1}>
          <Typography>Sort By:</Typography>
          <FormControl
            size="small"
            sx={{ backgroundColor: 'white', minWidth: 120 }}
          >
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              sx={{ color: 'black' }}
            >
              <MenuItem value="created_at">Newest</MenuItem>
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="current_price">Current Bid</MenuItem>
              <MenuItem value="remaining_time_seconds">Time Left</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Items per page */}
        <Box display="flex" alignItems="center" gap={1}>
          <Typography>Per page:</Typography>
          <FormControl
            size="small"
            sx={{ backgroundColor: 'white', minWidth: 60 }}
          >
            <Select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              sx={{ color: 'black' }}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Items Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.size === pageItems.length}
                  onChange={() =>
                    pageItems.forEach((it) => toggleSelect(it.id))
                  }
                />
              </TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Current Bid</TableCell>
              <TableCell>Time Left</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageItems.map((it) => (
              <TableRow key={it.id} selected={!it.active}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.has(it.id)}
                    onChange={() => toggleSelect(it.id)}
                  />
                </TableCell>
                <TableCell>{it.title}</TableCell>
                <TableCell>{it.description}</TableCell>
                <TableCell>${it.current_price.toFixed(2)}</TableCell>
                <TableCell>
                  {formatRemaining(it.remaining_time_seconds)}
                </TableCell>
              </TableRow>
            ))}
            {pageItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No items found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* */}
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default MyItems;

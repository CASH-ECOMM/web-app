import * as React from 'react';
import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Logout from '@mui/icons-material/Logout';
import Login from '@mui/icons-material/Login';
import LocalAtmRoundedIcon from '@mui/icons-material/LocalAtmRounded';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import { logoutUser } from '../services/auth';

const pages = ['Catalogue', 'My Items', 'Auctions Won', 'Past Auctions', 'Contact'];

export default function Navbar({ themePreference, setThemePreference }) {
  const [isAuthenticated] = useState(!!localStorage.getItem('access_token'));

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleItemUpload = () => {
    window.location.href = '/upload-item';
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleMyAccount = () => {
    window.location.href = '/profile';
  };
  const handleLogout = async () => {
    const jwt = localStorage.getItem('access_token');
    const userId = localStorage.getItem('userId');
    await logoutUser(jwt, userId);
    window.location.href = '/login';
  };
  // Theme menu state
  const [themeAnchorEl, setThemeAnchorEl] = React.useState(null);
  const openThemeMenu = Boolean(themeAnchorEl);
  // open/close handlers for theme menu
  const handleThemeButtonClick = (event) => {
    setThemeAnchorEl(event.currentTarget);
  };
  const handleThemeMenuClose = () => {
    setThemeAnchorEl(null);
  };
  const handleSelectTheme = (mode) => {
    if (typeof setThemePreference === 'function') {
      setThemePreference(mode); // 'system' | 'light' | 'dark'
    }
    setThemeAnchorEl(null);
  };
  // choose icon based on current themePreference
  let ThemeIcon = SettingsBrightnessIcon;
  if (themePreference === 'light') ThemeIcon = Brightness7Icon;
  if (themePreference === 'dark') ThemeIcon = Brightness4Icon;

  return (
    <AppBar position="sticky" sx={{ width: '100%' }}>
      <Toolbar disableGutters sx={{ px: 3 }}>
        <LocalAtmRoundedIcon sx={{ display: 'flex', mr: 1 }} />
        <Typography
          variant="h6"
          noWrap
          component="a"
          href="/"
          sx={{
            mr: 4,
            display: 'flex',
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '.3rem',
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          CASH
        </Typography>
        {isAuthenticated ? (
          <>
            {/* Navigation Pages */}
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
              {pages.map((page) => {
                // Map page names to routes
                const pageRoutes = {
                  Catalogue: '/catalogue',
                  'My Items': '/my-items',
                  'Auctions Won': '/auctions-won',
                  'Past Auctions': '/past-auctions',
                  Contact: '/contact',
                };
                return (
                  <Button
                    variant="text"
                    key={page}
                    sx={{ color: 'white', display: 'block' }}
                    href={pageRoutes[page]}
                  >
                    {page}
                  </Button>
                );
              })}
            </Box>
            {/* Account Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
              {/* Theme toggle button (logged in) */}
              <Tooltip title="Theme">
                <IconButton
                  color="inherit"
                  onClick={handleThemeButtonClick}
                  size="small"
                  sx={{ ml: 1 }}
                  aria-controls={openThemeMenu ? 'theme-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={openThemeMenu ? 'true' : undefined}
                >
                  <ThemeIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Account">
                <IconButton
                  onClick={handleClick}
                  size="small"
                  sx={{ ml: 2 }}
                  aria-controls={open ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                >
                  <Avatar sx={{ width: 32, height: 32 }} />
                </IconButton>
              </Tooltip>
            </Box>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    '&::before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <React.Fragment>
                <MenuItem onClick={handleMyAccount}>
                  <Avatar /> My account
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleItemUpload}>
                  <ListItemIcon>
                    <AddCircleIcon fontSize="small" />
                  </ListItemIcon>
                  Auction an item
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </React.Fragment>
            </Menu>
          </>
        ) : (
          <Box
            sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}
          >
            {/* Theme toggle button (logged out) */}
            <Tooltip title="Theme">
              <IconButton
                color="inherit"
                onClick={handleThemeButtonClick}
                size="small"
                sx={{ mr: 1 }}
                aria-controls={openThemeMenu ? 'theme-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={openThemeMenu ? 'true' : undefined}
              >
                <ThemeIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Login />}
              href="/login"
            >
              Login
            </Button>
          </Box>
        )}
        {/* Theme selection menu (shared for both auth / non-auth) */}
        <Menu
          anchorEl={themeAnchorEl}
          id="theme-menu"
          open={openThemeMenu}
          onClose={handleThemeMenuClose}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        >
          <MenuItem
            selected={themePreference === 'system'}
            onClick={() => handleSelectTheme('system')}
          >
            <ListItemIcon>
              <SettingsBrightnessIcon fontSize="small" />
            </ListItemIcon>
            System default
          </MenuItem>
          <MenuItem
            selected={themePreference === 'light'}
            onClick={() => handleSelectTheme('light')}
          >
            <ListItemIcon>
              <Brightness7Icon fontSize="small" />
            </ListItemIcon>
            Light
          </MenuItem>
          <MenuItem
            selected={themePreference === 'dark'}
            onClick={() => handleSelectTheme('dark')}
          >
            <ListItemIcon>
              <Brightness4Icon fontSize="small" />
            </ListItemIcon>
            Dark
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

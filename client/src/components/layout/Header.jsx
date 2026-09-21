import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Badge,
  Box,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
  Typography,
  Button,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import { TR } from '../../constants/tr';
import { useCart } from '../../hooks/useCart';
import { useUiStore } from '../../store/uiStore';
import MobileMenu from './MobileMenu';

export default function Header() {
  const mui = useTheme();
  const isMd = useMediaQuery(mui.breakpoints.up('md'));
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const openMobileMenu = useUiStore((s) => s.openMobileMenu);
  const openCartDrawer = useUiStore((s) => s.openCartDrawer);
  const [q, setQ] = useState('');

  const submitSearch = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/arama?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <>
      <AppBar position="sticky" color="inherit">
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: 72, gap: 2 }}>
            {!isMd && (
              <IconButton aria-label="Menü" onClick={openMobileMenu} edge="start">
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              component={RouterLink}
              to="/"
              variant="h5"
              sx={{ textDecoration: 'none', color: 'text.primary', whiteSpace: 'nowrap' }}
            >
              {TR.brandDark}
              <Box component="span" sx={{ color: 'primary.main' }}>
                {TR.brandAccent}
              </Box>
            </Typography>

            {isMd && (
              <Box component="form" onSubmit={submitSearch} sx={{ flex: 1, px: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={TR.hero.searchPlaceholder}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{ 'aria-label': TR.nav.search }}
                />
              </Box>
            )}

            {isMd && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button component={RouterLink} to="/temalar" color="inherit">
                  {TR.nav.themes}
                </Button>
                <Button component={RouterLink} to="/kategori/karton-tabak" color="inherit">
                  {TR.nav.categories}
                </Button>
                <Button component={RouterLink} to="/renkler" color="inherit">
                  {TR.nav.colors}
                </Button>
                <Button component={RouterLink} to="/iletisim" color="inherit">
                  {TR.nav.contact}
                </Button>
              </Box>
            )}

            {!isMd && (
              <IconButton
                aria-label={TR.nav.search}
                onClick={() => navigate('/arama')}
                sx={{ ml: 'auto' }}
              >
                <SearchIcon />
              </IconButton>
            )}

            <IconButton aria-label={TR.nav.cart} onClick={openCartDrawer} sx={{ ml: isMd ? 1 : 0 }}>
              <Badge badgeContent={itemCount} color="secondary">
                <ShoppingBagOutlinedIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>
      <MobileMenu />
    </>
  );
}

import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import { ADMIN_TOKEN_KEY, TR } from '../../constants/tr';

const LINKS = [
  { to: '/admin', label: TR.admin.dashboard, end: true },
  { to: '/admin/temalar', label: TR.admin.themes },
  { to: '/admin/urunler', label: TR.admin.products },
  { to: '/admin/kategoriler', label: TR.admin.categories },
  { to: '/admin/renkler', label: TR.admin.colors },
  { to: '/admin/siparisler', label: TR.admin.orders },
  { to: '/admin/ayarlar', label: TR.admin.settings },
];

const DRAWER_WIDTH = 240;

export default function AdminLayout() {
  const navigate = useNavigate();
  const mui = useTheme();
  const isMd = useMediaQuery(mui.breakpoints.up('md'));
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    navigate('/admin/giris');
  };

  const drawer = (
    <>
      <Toolbar>
        <Typography variant="h6" component={NavLink} to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          {TR.brand}
        </Typography>
      </Toolbar>
      <List>
        {LINKS.map((l) => (
          <ListItemButton
            key={l.to}
            component={NavLink}
            to={l.to}
            end={l.end}
            onClick={() => setOpen(false)}
            sx={{ '&.active': { bgcolor: 'primary.light', color: 'white' } }}
          >
            <ListItemText primary={l.label} />
          </ListItemButton>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant={isMd ? 'permanent' : 'temporary'}
        open={isMd ? true : open}
        onClose={() => setOpen(false)}
        sx={{
          width: isMd ? DRAWER_WIDTH : undefined,
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {drawer}
      </Drawer>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <AppBar position="sticky" color="inherit">
          <Toolbar>
            {!isMd && (
              <IconButton aria-label="Menü" onClick={() => setOpen(true)} edge="start" sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography sx={{ flex: 1 }}>{TR.nav.admin}</Typography>
            <Button onClick={logout}>{TR.admin.logout}</Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

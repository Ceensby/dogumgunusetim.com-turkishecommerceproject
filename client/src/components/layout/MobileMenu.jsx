import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TR } from '../../constants/tr';
import { useUiStore } from '../../store/uiStore';

const LINKS = [
  { to: '/temalar', label: TR.nav.themes },
  { to: '/kategori/karton-tabak', label: TR.nav.categories },
  { to: '/renkler', label: TR.nav.colors },
  { to: '/iletisim', label: TR.nav.contact },
  { to: '/sss', label: TR.footer.faq },
];

export default function MobileMenu() {
  const open = useUiStore((s) => s.mobileMenuOpen);
  const close = useUiStore((s) => s.closeMobileMenu);

  return (
    <Drawer anchor="left" open={open} onClose={close}>
      <Box sx={{ width: 280, p: 2 }} role="presentation">
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {TR.brandDark}
            <Box component="span" sx={{ color: 'primary.main' }}>
              {TR.brandAccent}
            </Box>
          </Typography>
          <IconButton aria-label={TR.common.close} onClick={close}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider sx={{ my: 1 }} />
        <List>
          {LINKS.map((link) => (
            <ListItemButton key={link.to} component={RouterLink} to={link.to} onClick={close}>
              <ListItemText primary={link.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

import { Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { TR } from '../constants/tr';
import SeoHead from '../components/common/SeoHead';

export default function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
      <SeoHead title="404" />
      <Typography variant="h1">404</Typography>
      <Typography variant="h4" sx={{ mb: 1 }}>
        {TR.common.notFound}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {TR.common.notFoundHint}
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Ana sayfa
      </Button>
    </Container>
  );
}

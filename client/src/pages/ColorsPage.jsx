import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, Container, Stack, Typography } from '@mui/material';
import { fetchColors } from '../api/catalog';
import SeoHead from '../components/common/SeoHead';
import { TR } from '../constants/tr';

export default function ColorsPage() {
  const query = useQuery({ queryKey: ['colors'], queryFn: fetchColors });
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SeoHead title={TR.nav.colors} path="/renkler" />
      <Typography variant="h2" sx={{ mb: 3 }}>
        {TR.nav.colors}
      </Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        {(query.data || []).map((c) => (
          <Box
            key={c.id}
            component={RouterLink}
            to={`/renk/${c.slug}`}
            sx={{ textDecoration: 'none', color: 'inherit', textAlign: 'center' }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: c.hexCode,
                border: '2px solid',
                borderColor: c.hexCode === '#FFFFFF' ? 'divider' : 'transparent',
                mx: 'auto',
                mb: 1,
              }}
            />
            <Typography>{c.name}</Typography>
          </Box>
        ))}
      </Stack>
    </Container>
  );
}

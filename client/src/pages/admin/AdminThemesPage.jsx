import { Link as RouterLink } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Button, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { adminDeleteTheme, adminThemes } from '../../api/admin';
import Loader from '../../components/common/Loader';

export default function AdminThemesPage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin-themes'], queryFn: adminThemes });
  const del = useMutation({
    mutationFn: adminDeleteTheme,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-themes'] }),
  });
  if (query.isLoading) return <Loader />;
  return (
    <>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">Temalar</Typography>
        <Button component={RouterLink} to="/admin/temalar/yeni" variant="contained">
          Yeni tema
        </Button>
      </Stack>
        <Box sx={{ overflowX: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Ad</TableCell>
            <TableCell>Slug</TableCell>
            <TableCell>Aktif</TableCell>
            <TableCell>Ürün</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {(query.data || []).map((t) => (
            <TableRow key={t.id}>
              <TableCell>{t.name}</TableCell>
              <TableCell>{t.slug}</TableCell>
              <TableCell>{t.isActive ? 'Evet' : 'Hayır'}</TableCell>
              <TableCell>{t._count?.themeProducts ?? 0}</TableCell>
              <TableCell>
                <Button component={RouterLink} to={`/admin/temalar/${t.id}`}>
                  Düzenle
                </Button>
                <Button component={RouterLink} to={`/admin/tema-urun/${t.id}`}>
                  Ürün ata
                </Button>
                <IconButton aria-label="Sil" onClick={() => del.mutate(t.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
        </Box>
    </>
  );
}

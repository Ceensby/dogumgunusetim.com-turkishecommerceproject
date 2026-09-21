import { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { adminSettings, adminUpdateSettings } from '../../api/admin';
import Loader from '../../components/common/Loader';

export default function AdminSettingsPage() {
  const [items, setItems] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    adminSettings().then(setItems);
  }, []);

  if (!items) return <Loader />;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Site ayarları</Typography>
      {items.map((row, idx) => (
        <TextField
          key={row.key}
          fullWidth
          multiline={String(row.value).length > 80}
          minRows={String(row.value).length > 80 ? 3 : 1}
          label={row.key}
          value={row.value}
          onChange={(e) => {
            const next = [...items];
            next[idx] = { ...row, value: e.target.value };
            setItems(next);
          }}
          sx={{ mb: 2 }}
        />
      ))}
      <Button
        variant="contained"
        onClick={async () => {
          await adminUpdateSettings(items.map(({ key, value }) => ({ key, value })));
          enqueueSnackbar('Ayarlar kaydedildi', { variant: 'success' });
        }}
      >
        Kaydet
      </Button>
    </Box>
  );
}

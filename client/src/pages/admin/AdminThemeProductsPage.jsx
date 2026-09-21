import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  adminAssignProduct,
  adminProducts,
  adminRemoveThemeProduct,
  adminReorderProducts,
  adminThemeProducts,
} from '../../api/admin';
import Loader from '../../components/common/Loader';

export default function AdminThemeProductsPage() {
  const { themeId } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const productsQuery = useQuery({ queryKey: ['admin-products'], queryFn: () => adminProducts() });
  const [data, setData] = useState(null);
  const [productId, setProductId] = useState('');
  const [defaultQuantity, setDefaultQuantity] = useState(1);
  const [isRequired, setIsRequired] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  const load = () => adminThemeProducts(themeId).then(setData);

  useEffect(() => {
    load();
  }, [themeId]);

  if (!data) return <Loader />;

  const assignedIds = new Set(data.items.map((i) => i.productId));
  const available = (productsQuery.data || []).filter((p) => !assignedIds.has(p.id));

  const persistOrder = async (items) => {
    await adminReorderProducts(
      themeId,
      items.map((item, idx) => ({ productId: item.productId, sortOrder: idx })),
    );
  };

  const onDrop = async (index) => {
    if (dragIndex == null || dragIndex === index) return;
    const next = [...data.items];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setData({ ...data, items: next });
    setDragIndex(null);
    await persistOrder(next);
    enqueueSnackbar('Sıra kaydedildi', { variant: 'success' });
  };

  return (
    <>
      <Typography variant="h4" sx={{ mb: 1 }}>
        {data.theme.name} — ürün atama
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Satırları sürükleyerek sırala. defaultQuantity, tema sayfası açılınca dolu gelir.
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 3 }}>
        <TextField select size="small" label="Ürün" value={productId} onChange={(e) => setProductId(e.target.value)} sx={{ minWidth: 240 }}>
          {available.map((p) => (
            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
          ))}
        </TextField>
        <TextField size="small" type="number" label="Varsayılan adet" value={defaultQuantity} onChange={(e) => setDefaultQuantity(Number(e.target.value))} />
        <FormControlLabel control={<Checkbox checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} />} label="Zorunlu" />
        <FormControlLabel control={<Checkbox checked={isRecommended} onChange={(e) => setIsRecommended(e.target.checked)} />} label="Önerilen" />
        <Button
          variant="contained"
          onClick={async () => {
            if (!productId) return;
            await adminAssignProduct(themeId, {
              productId: Number(productId),
              defaultQuantity,
              isRequired,
              isRecommended,
              sortOrder: data.items.length,
            });
            setProductId('');
            await load();
          }}
        >
          Ata
        </Button>
      </Stack>
      {data.items.map((item, index) => (
        <Box
          key={item.productId}
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(index)}
          sx={{
            p: 1.5,
            mb: 1,
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            cursor: 'grab',
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
            <Typography sx={{ flex: 1 }}>
              {index + 1}. {item.product.name}
            </Typography>
            <TextField
              size="small"
              type="number"
              label="Adet"
              value={item.defaultQuantity}
              onChange={async (e) => {
                const v = Number(e.target.value);
                await adminAssignProduct(themeId, { productId: item.productId, defaultQuantity: v });
                await load();
              }}
              sx={{ width: 100 }}
            />
            <Button
              color="error"
              onClick={async () => {
                await adminRemoveThemeProduct(themeId, item.productId);
                await load();
              }}
            >
              Çıkar
            </Button>
          </Stack>
        </Box>
      ))}
    </>
  );
}

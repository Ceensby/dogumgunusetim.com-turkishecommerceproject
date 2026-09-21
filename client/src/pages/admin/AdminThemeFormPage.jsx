import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, FormControlLabel, Grid, Switch, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { adminCreateTheme, adminTheme, adminUpdateTheme, adminUpload } from '../../api/admin';
import Loader from '../../components/common/Loader';

const empty = {
  name: '',
  title: '',
  slug: '',
  shortDescription: '',
  description: '',
  heroImage: '',
  thumbnail: '',
  primaryColor: '#7C4DFF',
  secondaryColor: '#FF4D8D',
  gender: 'unisex',
  ageGroup: 'cocuk',
  tags: '',
  isActive: true,
  isFeatured: false,
  sortOrder: 0,
  seoTitle: '',
  seoDescription: '',
};

export default function AdminThemeFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'yeni';
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(!isNew);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (isNew) return;
    adminTheme(id).then((data) => {
      setForm({ ...empty, ...data });
      setLoading(false);
    });
  }, [id, isNew]);

  const set = (k) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: k === 'sortOrder' ? Number(value) : value }));
  };

  const upload = async (field, file) => {
    const res = await adminUpload(file);
    setForm((f) => ({ ...f, [field]: res.url }));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 };
      if (isNew) await adminCreateTheme(payload);
      else await adminUpdateTheme(id, payload);
      enqueueSnackbar('Kaydedildi', { variant: 'success' });
      navigate('/admin/temalar');
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Kayıt başarısız', { variant: 'error' });
    }
  };

  if (loading) return <Loader />;

  return (
    <Box component="form" onSubmit={submit}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {isNew ? 'Yeni tema' : 'Temayı düzenle'}
      </Typography>
      <Grid container spacing={2}>
        {['name', 'title', 'slug', 'shortDescription', 'description', 'gender', 'ageGroup', 'tags', 'seoTitle', 'seoDescription'].map((k) => (
          <Grid item xs={12} md={k === 'description' ? 12 : 6} key={k}>
            <TextField
              fullWidth
              multiline={k === 'description'}
              minRows={k === 'description' ? 3 : 1}
              label={k}
              value={form[k] || ''}
              onChange={set(k)}
              required={['name', 'title'].includes(k)}
            />
          </Grid>
        ))}
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="primaryColor" value={form.primaryColor || ''} onChange={set('primaryColor')} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="secondaryColor" value={form.secondaryColor || ''} onChange={set('secondaryColor')} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth type="number" label="sortOrder" value={form.sortOrder} onChange={set('sortOrder')} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="heroImage" value={form.heroImage || ''} onChange={set('heroImage')} />
          <Button component="label" sx={{ mt: 1 }}>
            Hero yükle
            <input hidden type="file" accept="image/*" onChange={(e) => e.target.files[0] && upload('heroImage', e.target.files[0])} />
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="thumbnail" value={form.thumbnail || ''} onChange={set('thumbnail')} />
          <Button component="label" sx={{ mt: 1 }}>
            Thumbnail yükle
            <input hidden type="file" accept="image/*" onChange={(e) => e.target.files[0] && upload('thumbnail', e.target.files[0])} />
          </Button>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel control={<Switch checked={form.isActive} onChange={set('isActive')} />} label="Aktif" />
          <FormControlLabel control={<Switch checked={form.isFeatured} onChange={set('isFeatured')} />} label="Öne çıkan" />
        </Grid>
      </Grid>
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Kaydet
      </Button>
    </Box>
  );
}

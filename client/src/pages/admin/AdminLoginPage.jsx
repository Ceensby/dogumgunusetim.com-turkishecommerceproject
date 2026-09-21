import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { adminLogin } from '../../api/admin';
import { ADMIN_TOKEN_KEY, TR } from '../../constants/tr';
import SeoHead from '../../components/common/SeoHead';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await adminLogin({ email, password });
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      navigate('/admin');
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Giriş başarısız', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <SeoHead title={TR.admin.login} />
      <Paper sx={{ p: 4, width: '100%', maxWidth: 420 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {TR.admin.login}
        </Typography>
        <Box component="form" onSubmit={submit}>
          <TextField fullWidth required type="email" label={TR.admin.email} value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
          <TextField fullWidth required type="password" label={TR.admin.password} value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }} />
          <Button type="submit" variant="contained" fullWidth disabled={loading}>
            {TR.admin.submit}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

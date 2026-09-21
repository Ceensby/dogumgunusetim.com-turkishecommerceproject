import PropTypes from 'prop-types';
import { Box, CircularProgress, Typography } from '@mui/material';
import { TR } from '../../constants/tr';

export default function Loader({ label }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
      <CircularProgress color="primary" />
      <Typography color="text.secondary">{label || TR.common.loading}</Typography>
    </Box>
  );
}

Loader.propTypes = { label: PropTypes.string };

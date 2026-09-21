import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import { TR } from '../../constants/tr';

export default function EmptyState({ title, hint, actionLabel, onAction }) {
  return (
    <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
      <Box
        aria-hidden
        sx={{
          width: 88,
          height: 88,
          mx: 'auto',
          mb: 2,
          borderRadius: '50%',
          bgcolor: 'primary.light',
          opacity: 0.35,
        }}
      />
      <Typography variant="h5" gutterBottom>
        {title || TR.common.empty}
      </Typography>
      {hint && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {hint}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string,
  hint: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
};

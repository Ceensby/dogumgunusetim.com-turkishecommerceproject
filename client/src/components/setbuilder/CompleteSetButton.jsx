import PropTypes from 'prop-types';
import { Button, CircularProgress } from '@mui/material';
import { TR } from '../../constants/tr';

export default function CompleteSetButton({ disabled, loading, isEditing, onClick, accent }) {
  return (
    <Button
      variant="contained"
      fullWidth
      size="large"
      disabled={disabled || loading}
      onClick={onClick}
      sx={{
        mt: 1,
        bgcolor: accent || undefined,
        '&:hover': accent ? { bgcolor: accent, filter: 'brightness(0.92)' } : undefined,
      }}
    >
      {loading ? <CircularProgress size={22} color="inherit" /> : isEditing ? TR.theme.update : TR.theme.complete}
    </Button>
  );
}

CompleteSetButton.propTypes = {
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  isEditing: PropTypes.bool,
  onClick: PropTypes.func,
  accent: PropTypes.string,
};

import PropTypes from 'prop-types';
import { Alert, Button, Stack } from '@mui/material';
import { TR } from '../../constants/tr';

export default function ErrorState({ message, onRetry }) {
  return (
    <Stack spacing={2} alignItems="flex-start" sx={{ py: 4 }}>
      <Alert severity="error">{message || TR.common.errorTitle}</Alert>
      {onRetry && (
        <Button variant="outlined" onClick={onRetry}>
          {TR.common.retry}
        </Button>
      )}
    </Stack>
  );
}

ErrorState.propTypes = {
  message: PropTypes.string,
  onRetry: PropTypes.func,
};

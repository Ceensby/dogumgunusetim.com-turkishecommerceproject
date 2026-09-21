import PropTypes from 'prop-types';
import { Alert, Box, Button, Divider, Stack, Typography } from '@mui/material';
import { TR } from '../../constants/tr';
import { formatPrice } from '../../utils/formatPrice';
import CompleteSetButton from './CompleteSetButton';

export default function SetSummaryPanel({
  theme,
  selected,
  quantities,
  totalProducts,
  subtotal,
  shippingHint,
  missingRequired,
  isEditing,
  loading,
  onComplete,
  onReset,
}) {
  return (
    <Box
      sx={{
        position: { md: 'sticky' },
        top: { md: 96 },
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: 1,
      }}
    >
      <Typography variant="h5" sx={{ mb: 1 }}>
        {theme.name} {TR.theme.yourSet}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {TR.theme.selectedOf(selected.length, totalProducts)}
      </Typography>
      <Stack spacing={1} sx={{ mb: 2, maxHeight: 240, overflow: 'auto' }}>
        {selected.map((p) => (
          <Stack key={p.id} direction="row" justifyContent="space-between">
            <Typography variant="body2">
              {p.name} × {quantities[p.id]}
            </Typography>
            <Typography variant="body2">{formatPrice(p.price * quantities[p.id])}</Typography>
          </Stack>
        ))}
      </Stack>
      <Divider sx={{ my: 1.5 }} />
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Typography>{TR.cart.subtotal}</Typography>
        <Typography fontWeight={700}>{formatPrice(subtotal)}</Typography>
      </Stack>
      {shippingHint && (
        <Typography variant="caption" color="text.secondary">
          {shippingHint}
        </Typography>
      )}
      {missingRequired.length > 0 && selected.length > 0 && (
        <Alert severity="warning" sx={{ my: 1.5 }}>
          {TR.theme.missingRequired(missingRequired[0].category?.name || missingRequired[0].name)}
        </Alert>
      )}
      <CompleteSetButton
        disabled={selected.length === 0}
        loading={loading}
        isEditing={isEditing}
        onClick={onComplete}
      />
      {selected.length === 0 && (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          {TR.theme.needOne}
        </Typography>
      )}
      <Button onClick={onReset} size="small" sx={{ mt: 1 }}>
        {TR.theme.reset}
      </Button>
    </Box>
  );
}

SetSummaryPanel.propTypes = {
  theme: PropTypes.object.isRequired,
  selected: PropTypes.array.isRequired,
  quantities: PropTypes.object.isRequired,
  totalProducts: PropTypes.number.isRequired,
  subtotal: PropTypes.number.isRequired,
  shippingHint: PropTypes.string,
  missingRequired: PropTypes.array,
  isEditing: PropTypes.bool,
  loading: PropTypes.bool,
  onComplete: PropTypes.func,
  onReset: PropTypes.func,
};

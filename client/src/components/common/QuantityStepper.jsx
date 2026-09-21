import PropTypes from 'prop-types';
import { IconButton, Stack, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { MAX_QTY, TR } from '../../constants/tr';

export default function QuantityStepper({ value, onChange, min = 0, max = MAX_QTY, disabled }) {
  const cap = max ?? MAX_QTY;

  const setSafe = (next) => {
    const n = Number.parseInt(String(next), 10);
    if (Number.isNaN(n)) {
      onChange(min);
      return;
    }
    onChange(Math.min(cap, Math.max(min, n)));
  };

  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <IconButton
        aria-label="Azalt"
        size="small"
        disabled={disabled || value <= min}
        onClick={() => setSafe(value - 1)}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
      <TextField
        aria-label={TR.common.quantity}
        value={value}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, '');
          if (raw === '') {
            onChange(min);
            return;
          }
          setSafe(raw);
        }}
        disabled={disabled}
        inputProps={{
          inputMode: 'numeric',
          style: { textAlign: 'center', width: 36, padding: '6px 4px' },
        }}
        sx={{ width: 56 }}
        size="small"
      />
      <IconButton
        aria-label="Artır"
        size="small"
        disabled={disabled || value >= cap}
        onClick={() => setSafe(value + 1)}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
}

QuantityStepper.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  disabled: PropTypes.bool,
};

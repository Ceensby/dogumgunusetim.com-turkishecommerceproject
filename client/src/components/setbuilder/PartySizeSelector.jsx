import PropTypes from 'prop-types';
import { Chip, Stack, Typography } from '@mui/material';
import { PARTY_SIZES, TR } from '../../constants/tr';

export default function PartySizeSelector({ value, onChange }) {
  return (
    <Stack spacing={1} sx={{ mb: 3 }}>
      <Typography variant="h6">{TR.theme.partySize}</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {PARTY_SIZES.map((size) => (
          <Chip
            key={size}
            label={TR.theme[`people${size}`] || `${size} kişi`}
            color={value === size ? 'primary' : 'default'}
            onClick={() => onChange(size)}
            variant={value === size ? 'filled' : 'outlined'}
          />
        ))}
        <Chip
          label={TR.theme.custom}
          color={value === 'custom' ? 'primary' : 'default'}
          onClick={() => onChange('custom')}
          variant={value === 'custom' ? 'filled' : 'outlined'}
        />
      </Stack>
    </Stack>
  );
}

PartySizeSelector.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func.isRequired,
};

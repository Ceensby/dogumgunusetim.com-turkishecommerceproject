import PropTypes from 'prop-types';
import { Chip, Stack } from '@mui/material';
import { TR } from '../../constants/tr';

const CHIPS = [
  { label: TR.filters.girl, gender: 'kiz', ageGroup: 'cocuk' },
  { label: TR.filters.boy, gender: 'erkek', ageGroup: 'cocuk' },
  { label: TR.filters.baby, ageGroup: 'bebek' },
  { label: TR.filters.unisex, gender: 'unisex' },
  { label: TR.filters.adult, ageGroup: 'yetiskin' },
];

export default function ThemeFilters({ value, onChange }) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
      {CHIPS.map((chip) => {
        const active =
          (chip.gender ? value.gender === chip.gender : true) &&
          (chip.ageGroup ? value.ageGroup === chip.ageGroup : !chip.gender || value.gender === chip.gender) &&
          ((chip.gender && value.gender === chip.gender && (!chip.ageGroup || value.ageGroup === chip.ageGroup)) ||
            (chip.ageGroup && !chip.gender && value.ageGroup === chip.ageGroup && !value.gender));
        return (
          <Chip
            key={chip.label}
            label={chip.label}
            color={active ? 'primary' : 'default'}
            onClick={() => onChange({ gender: chip.gender, ageGroup: chip.ageGroup })}
            variant={active ? 'filled' : 'outlined'}
          />
        );
      })}
      {(value.gender || value.ageGroup) && (
        <Chip label="Tümü" onClick={() => onChange({})} variant="outlined" />
      )}
    </Stack>
  );
}

ThemeFilters.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func,
};

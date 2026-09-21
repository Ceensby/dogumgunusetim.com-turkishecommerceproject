import PropTypes from 'prop-types';
import { Chip, Grid, Stack, Typography } from '@mui/material';

const CHIP_SX = [
  { bgcolor: 'rgba(124,77,255,0.12)', color: 'primary.dark' },
  { bgcolor: 'rgba(255,77,141,0.12)', color: 'secondary.dark' },
  { bgcolor: 'rgba(255,201,60,0.2)', color: 'text.primary' },
];

export default function ProductAttributes({ attributes }) {
  if (!attributes?.length) return null;
  return (
    <Grid container spacing={1.5}>
      {attributes.map((attr, i) => (
        <Grid item xs={12} sm={6} key={attr.id || attr.label}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip label={attr.label} sx={{ fontWeight: 700, ...CHIP_SX[i % CHIP_SX.length] }} />
            <Typography>{attr.value}</Typography>
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
}

ProductAttributes.propTypes = { attributes: PropTypes.array };

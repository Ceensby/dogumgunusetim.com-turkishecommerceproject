import PropTypes from 'prop-types';
import { Button, Grid } from '@mui/material';
import ThemeCard from './ThemeCard';
import { TR } from '../../constants/tr';

export default function ThemeGrid({ items, onLoadMore, hasMore }) {
  return (
    <>
      <Grid container spacing={2}>
        {items.map((theme) => (
          <Grid item xs={6} sm={4} md={3} key={theme.id}>
            <ThemeCard theme={theme} />
          </Grid>
        ))}
      </Grid>
      {hasMore && (
        <Button onClick={onLoadMore} sx={{ mt: 3, display: 'block', mx: 'auto' }} variant="outlined">
          {TR.home.loadMore}
        </Button>
      )}
    </>
  );
}

ThemeGrid.propTypes = {
  items: PropTypes.array.isRequired,
  onLoadMore: PropTypes.func,
  hasMore: PropTypes.bool,
};

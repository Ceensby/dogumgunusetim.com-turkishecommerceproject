import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import ImageWithFallback from '../common/ImageWithFallback';
import { TR } from '../../constants/tr';

export default function ThemeCard({ theme }) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/tema/${theme.slug}`}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <Box sx={{ aspectRatio: '4 / 3', overflow: 'hidden', '& img': { objectPosition: 'center 65%' } }}>
          <ImageWithFallback src={theme.thumbnail} alt={theme.name} letter={theme.name} objectFit="cover" />
        </Box>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6">{theme.name}</Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mb: 2, flex: 1 }}>
            {theme.shortDescription}
          </Typography>
          <Button component="span" variant="contained" fullWidth>
            {TR.hero.buildSet}
          </Button>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

ThemeCard.propTypes = {
  theme: PropTypes.object.isRequired,
};

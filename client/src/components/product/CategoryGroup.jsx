import PropTypes from 'prop-types';
import { Stack, Typography } from '@mui/material';
import ProductSelectorCard from './ProductSelectorCard';

export default function CategoryGroup({ group, quantities, onQuantity, accent, themeSlug }) {
  return (
    <Stack spacing={2} sx={{ mb: 4 }}>
      <Typography variant="h4">{group.category.pluralName || group.category.name}</Typography>
      {group.products.map((product) => (
        <ProductSelectorCard
          key={product.id}
          product={product}
          quantity={quantities[product.id] || 0}
          onQuantity={(q) => onQuantity(product.id, q)}
          accent={accent}
          themeSlug={themeSlug}
        />
      ))}
    </Stack>
  );
}

CategoryGroup.propTypes = {
  group: PropTypes.object.isRequired,
  quantities: PropTypes.object.isRequired,
  onQuantity: PropTypes.func.isRequired,
  accent: PropTypes.string,
  themeSlug: PropTypes.string,
};

import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CartLineItem from './CartLineItem';
import ConfirmDialog from '../common/ConfirmDialog';
import ImageWithFallback from '../common/ImageWithFallback';
import { formatPrice } from '../../utils/formatPrice';
import { TR } from '../../constants/tr';
import { useCartStore } from '../../store/cartStore';

export default function CartSetGroup({ group, compact }) {
  const removeSet = useCartStore((s) => s.removeSet);
  const [confirm, setConfirm] = useState(false);
  const slug = group.theme?.slug;

  return (
    <>
      <Accordion defaultExpanded={!compact} disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%', pr: 1 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 1, overflow: 'hidden' }}>
              <ImageWithFallback src={group.theme?.thumbnail} alt={group.setName} letter={group.setName} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={700}>{group.displayName || group.setName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {TR.cart.products(group.itemCount)} · {formatPrice(group.total)}
              </Typography>
            </Box>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          {!compact && (
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              {slug && (
                <Button
                  size="small"
                  component={RouterLink}
                  to={`/tema/${slug}?setGroupId=${group.setGroupId}`}
                >
                  {TR.cart.editSet}
                </Button>
              )}
              <Button size="small" color="error" onClick={() => setConfirm(true)}>
                {TR.cart.removeSet}
              </Button>
            </Stack>
          )}
          <Stack spacing={1.5}>
            {group.items.map((item) => (
              <CartLineItem key={item.id} item={item} compact={compact} />
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>
      <ConfirmDialog
        open={confirm}
        title={TR.cart.removeSet}
        text={TR.cart.removeSetConfirm}
        onClose={() => setConfirm(false)}
        onConfirm={async () => {
          await removeSet(group.setGroupId);
          setConfirm(false);
        }}
      />
    </>
  );
}

CartSetGroup.propTypes = {
  group: PropTypes.object.isRequired,
  compact: PropTypes.bool,
};

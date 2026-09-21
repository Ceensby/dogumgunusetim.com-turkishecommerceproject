import PropTypes from 'prop-types';
import { useState } from 'react';
import { Box, Button, Stack, SwipeableDrawer, Typography } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { formatPrice } from '../../utils/formatPrice';
import { TR } from '../../constants/tr';
import SetSummaryPanel from './SetSummaryPanel';

export default function MobileSummaryBar(props) {
  const [open, setOpen] = useState(false);
  const { selected, subtotal, onComplete, isEditing, loading } = props;

  return (
    <>
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 20,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          p: 1.5,
          pb: 'max(12px, env(safe-area-inset-bottom))',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Button
            onClick={() => setOpen(true)}
            startIcon={<KeyboardArrowUpIcon />}
            sx={{ flex: 1, justifyContent: 'flex-start' }}
          >
            <Box textAlign="left">
              <Typography variant="caption" display="block">
                {selected.length} ürün
              </Typography>
              <Typography fontWeight={800}>{formatPrice(subtotal)}</Typography>
            </Box>
          </Button>
          <Button
            variant="contained"
            disabled={!selected.length || loading}
            onClick={onComplete}
          >
            {isEditing ? TR.theme.update : TR.theme.complete}
          </Button>
        </Stack>
      </Box>
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        PaperProps={{ sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20, p: 1 } }}
      >
        <SetSummaryPanel {...props} />
      </SwipeableDrawer>
    </>
  );
}

MobileSummaryBar.propTypes = SetSummaryPanel.propTypes;

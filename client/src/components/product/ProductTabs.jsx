import PropTypes from 'prop-types';
import { Accordion, AccordionDetails, AccordionSummary, Box, Tab, Tabs, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState } from 'react';
import ProductAttributes from './ProductAttributes';
import { TR } from '../../constants/tr';

export default function ProductTabs({ attributes, description, shippingText }) {
  const mui = useTheme();
  const isMd = useMediaQuery(mui.breakpoints.up('md'));
  const [tab, setTab] = useState(0);
  const hasAttrs = Boolean(attributes?.length);
  const tabs = [
    hasAttrs && { key: 'specs', label: TR.product.specs },
    { key: 'desc', label: TR.product.description },
    { key: 'ship', label: TR.product.shipping },
  ].filter(Boolean);

  const panels = {
    specs: <ProductAttributes attributes={attributes} />,
    desc: (
      <Typography sx={{ whiteSpace: 'pre-line' }}>
        {description}
      </Typography>
    ),
    ship: <Typography sx={{ whiteSpace: 'pre-line' }}>{shippingText}</Typography>,
  };

  if (!isMd) {
    return (
      <Box>
        {tabs.map((t) => (
          <Accordion key={t.key} defaultExpanded={t.key === tabs[0].key}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>{t.label}</AccordionSummary>
            <AccordionDetails>{panels[t.key]}</AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 2 }}>
        {tabs.map((t) => (
          <Tab key={t.key} label={t.label} />
        ))}
      </Tabs>
      {panels[tabs[tab].key]}
    </Box>
  );
}

ProductTabs.propTypes = {
  attributes: PropTypes.array,
  description: PropTypes.string,
  shippingText: PropTypes.string,
};

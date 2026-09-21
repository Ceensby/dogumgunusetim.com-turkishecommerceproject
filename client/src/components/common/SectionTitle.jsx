import PropTypes from 'prop-types';
import { Typography } from '@mui/material';

export default function SectionTitle({ children, subtitle, align = 'left' }) {
  return (
    <>
      <Typography variant="h2" align={align} sx={{ mb: subtitle ? 1 : 3 }}>
        {children}
      </Typography>
      {subtitle && (
        <Typography color="text.secondary" align={align} sx={{ mb: 3 }}>
          {subtitle}
        </Typography>
      )}
    </>
  );
}

SectionTitle.propTypes = {
  children: PropTypes.node,
  subtitle: PropTypes.string,
  align: PropTypes.string,
};

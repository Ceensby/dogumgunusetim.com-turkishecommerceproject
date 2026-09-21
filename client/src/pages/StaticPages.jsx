import PropTypes from 'prop-types';
import { Accordion, AccordionDetails, AccordionSummary, Container, Link, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSettings } from '../hooks/useTheme';
import SeoHead from '../components/common/SeoHead';
import { TR } from '../constants/tr';

export default function StaticPage({ settingKey, title, path }) {
  const { data: settings } = useSettings();
  const raw = settings?.[settingKey] || '';
  let faq = [];
  if (settingKey === 'faq_json') {
    try {
      faq = JSON.parse(raw || '[]');
    } catch {
      faq = [];
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <SeoHead title={title} path={path} />
      <Typography variant="h2" sx={{ mb: 3 }}>
        {title}
      </Typography>
      {settingKey === 'faq_json' ? (
        faq.map((item) => (
          <Accordion key={item.q}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>{item.q}</AccordionSummary>
            <AccordionDetails>{item.a}</AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography sx={{ whiteSpace: 'pre-line' }}>{raw}</Typography>
      )}
      {path === '/iletisim' && settings && (
        <Typography sx={{ mt: 2 }}>
          {settings.contact_email}
          <br />
          {settings.contact_phone}
          <br />
          <Link href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer">
            WhatsApp
          </Link>
        </Typography>
      )}
    </Container>
  );
}

StaticPage.propTypes = {
  settingKey: PropTypes.string,
  title: PropTypes.string.isRequired,
  path: PropTypes.string,
};

export function AboutPage() {
  return <StaticPage settingKey="about_text" title={TR.static.aboutTitle} path="/hakkimizda" />;
}
export function ContactPage() {
  return <StaticPage settingKey="about_text" title={TR.static.contactTitle} path="/iletisim" />;
}
export function FaqPage() {
  return <StaticPage settingKey="faq_json" title={TR.static.faqTitle} path="/sss" />;
}
export function ShippingPage() {
  return <StaticPage settingKey="shipping_text" title={TR.static.shippingTitle} path="/kargo-ve-teslimat" />;
}
export function ReturnsPage() {
  return <StaticPage settingKey="returns_text" title={TR.static.returnsTitle} path="/iade-ve-degisim" />;
}
export function PrivacyPage() {
  return <StaticPage settingKey="privacy_text" title={TR.static.privacyTitle} path="/gizlilik" />;
}
export function DistanceSalesPage() {
  return <StaticPage settingKey="distance_sales_text" title={TR.static.distanceTitle} path="/mesafeli-satis-sozlesmesi" />;
}

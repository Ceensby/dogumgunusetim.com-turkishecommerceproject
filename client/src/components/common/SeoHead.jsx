import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

export default function SeoHead({ title, description, image, jsonLd, path }) {
  const fullTitle = title?.includes('doğumgünü') ? title : `${title} | doğumgünüsetim`;
  const url = path ? `https://dogumgunusetim.com${path}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:type" content="website" />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}

SeoHead.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  image: PropTypes.string,
  jsonLd: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  path: PropTypes.string,
};

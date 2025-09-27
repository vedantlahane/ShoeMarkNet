import { useMemo } from 'react';
import usePageMetadata from '../../hooks/usePageMetadata';

/**
 * Declarative page head manager for client-rendered views.
 * Allows setting document title, meta tags, link tags, and JSON-LD snippets
 * without relying on react-helmet.
 */
const PageMeta = ({
  title,
  description,
  keywords,
  robots,
  canonical,
  meta = [],
  links = [],
  openGraph,
  twitter,
  jsonLd,
}) => {
  const metaTags = useMemo(() => {
    const tags = [];

    if (description) {
      tags.push({ name: 'description', content: description });
    }

    if (keywords) {
      const keywordValue = Array.isArray(keywords) ? keywords.join(', ') : keywords;
      tags.push({ name: 'keywords', content: keywordValue });
    }

    if (robots) {
      tags.push({ name: 'robots', content: robots });
    }

    if (openGraph) {
      Object.entries(openGraph).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          const propertyKey = key.startsWith('og:') ? key : `og:${key}`;
          tags.push({ property: propertyKey, content: value });
        }
      });
    }

    if (twitter) {
      Object.entries(twitter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          const nameKey = key.startsWith('twitter:') ? key : `twitter:${key}`;
          tags.push({ name: nameKey, content: value });
        }
      });
    }

    return [...tags, ...meta];
  }, [description, keywords, robots, openGraph, twitter, meta]);

  const linkTags = useMemo(() => {
    const tags = [...links];

    if (canonical) {
      tags.push({ rel: 'canonical', href: canonical });
    }

    return tags;
  }, [links, canonical]);

  const scriptTags = useMemo(() => {
    if (!jsonLd) {
      return [];
    }

    const dataArray = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
    return dataArray
      .filter(Boolean)
      .map((entry) => ({
        type: 'application/ld+json',
        textContent: typeof entry === 'string' ? entry : JSON.stringify(entry),
      }));
  }, [jsonLd]);

  usePageMetadata({
    title,
    meta: metaTags,
    links: linkTags,
    scripts: scriptTags,
  });

  return null;
};

export default PageMeta;

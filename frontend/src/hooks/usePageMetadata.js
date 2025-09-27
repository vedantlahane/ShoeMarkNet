import { useEffect } from 'react';

const resolvePrimaryAttribute = (attributes = {}) => {
  if ('name' in attributes) {
    return ['name', attributes.name];
  }

  if ('property' in attributes) {
    return ['property', attributes.property];
  }

  if ('httpEquiv' in attributes) {
    return ['http-equiv', attributes.httpEquiv];
  }

  if ('charSet' in attributes) {
    return ['charset', attributes.charSet];
  }

  if ('charset' in attributes) {
    return ['charset', attributes.charset];
  }

  return [];
};

const usePageMetadata = ({ title, meta = [], links = [], scripts = [] }) => {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const cleanups = [];

    if (typeof title === 'string' && title.length > 0) {
      const previousTitle = document.title;
      document.title = title;
      cleanups.push(() => {
        document.title = previousTitle;
      });
    }

    meta.forEach((descriptor = {}) => {
      const { content, ...attributes } = descriptor;
      const [attrName, attrValue] = resolvePrimaryAttribute(attributes);

      if (!attrName || !attrValue) {
        return;
      }

      let element;
      let created = false;
      const previous = {};

      if (attrName === 'charset') {
        element = document.head.querySelector('meta[charset]');
        if (!element) {
          element = document.createElement('meta');
          document.head.prepend(element);
          created = true;
        }

        previous.charset = element.getAttribute('charset');
        element.setAttribute('charset', attrValue);
      } else {
        element = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);

        if (!element) {
          element = document.createElement('meta');
          element.setAttribute(attrName, attrValue);
          document.head.appendChild(element);
          created = true;
        } else {
          previous.content = element.getAttribute('content');
        }

        if (content !== undefined) {
          element.setAttribute('content', content ?? '');
        }
      }

      Object.entries(attributes).forEach(([key, value]) => {
        if (['name', 'property', 'httpEquiv', 'charSet', 'charset'].includes(key)) {
          return;
        }

        if (value !== undefined && value !== null) {
          element.setAttribute(key, value);
        }
      });

      element.setAttribute('data-page-meta', 'true');

      cleanups.push(() => {
        if (created) {
          element.remove();
          return;
        }

        if (attrName === 'charset') {
          if (previous.charset) {
            element.setAttribute('charset', previous.charset);
          } else {
            element.removeAttribute('charset');
          }

          return;
        }

        if (previous.content !== undefined) {
          element.setAttribute('content', previous.content ?? '');
        }
      });
    });

    links.forEach((descriptor = {}) => {
      const { rel, href, ...attributes } = descriptor;
      if (!rel) {
        return;
      }

      let selector = `link[rel="${rel}"]`;
      if (href) {
        selector += `[href="${href}"]`;
      }

      let element = document.head.querySelector(selector);
      let created = false;
      const previous = {};

      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        if (href) {
          element.setAttribute('href', href);
        }
        document.head.appendChild(element);
        created = true;
      } else {
        previous.href = element.getAttribute('href');
      }

      Object.entries(attributes).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          element.setAttribute(key, value);
        }
      });

      element.setAttribute('data-page-meta', 'true');

      cleanups.push(() => {
        if (created) {
          element.remove();
          return;
        }

        if (previous.href !== undefined) {
          element.setAttribute('href', previous.href ?? '');
        }
      });
    });

    scripts.forEach((descriptor = {}) => {
      const { textContent, innerHTML, ...attributes } = descriptor;
      const element = document.createElement('script');

      Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'async' || key === 'defer') {
          element[key] = Boolean(value);
          return;
        }

        if (value !== undefined && value !== null) {
          element.setAttribute(key, value);
        }
      });

      if (textContent !== undefined) {
        element.textContent = textContent;
      } else if (innerHTML !== undefined) {
        element.textContent = innerHTML;
      }

      element.setAttribute('data-page-meta', 'true');
      document.head.appendChild(element);

      cleanups.push(() => {
        element.remove();
      });
    });

    return () => {
      cleanups.forEach((cleanup) => {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      });
    };
  }, [title, meta, links, scripts]);
};

export default usePageMetadata;

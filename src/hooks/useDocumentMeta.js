import { useEffect } from 'react';

const SITE_ORIGIN = 'https://gerente.rianfernando.com';

const setMeta = (selector, attr, content) => {
  if (!content) return;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    const [, key, value] = selector.match(/\[([^=]+)="([^"]+)"\]/) || [];
    if (key && value) el.setAttribute(key, value);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, content);
};

const setLink = (rel, href) => {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

export const useDocumentMeta = ({ title, description, path = '/', noindex = false } = {}) => {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      setMeta('meta[name="description"]', 'content', description);
      setMeta('meta[property="og:description"]', 'content', description);
      setMeta('meta[name="twitter:description"]', 'content', description);
    }
    if (title) {
      setMeta('meta[property="og:title"]', 'content', title);
      setMeta('meta[name="twitter:title"]', 'content', title);
    }
    const url = `${SITE_ORIGIN}${path}`;
    setLink('canonical', url);
    setMeta('meta[property="og:url"]', 'content', url);

    setMeta('meta[name="robots"]', 'content', noindex ? 'noindex, follow' : 'index, follow');
  }, [title, description, path, noindex]);
};

export default useDocumentMeta;

import { useEffect, useState } from 'react';
import { getCoverImageUrlByIdAsync } from './coverData.js';

export const useCoverImageUrl = (coverId) => {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!coverId) {
      setUrl(null);
      return;
    }
    (async () => {
      const result = await getCoverImageUrlByIdAsync(coverId);
      if (!cancelled) {
        setUrl(result);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [coverId]);

  return url;
};



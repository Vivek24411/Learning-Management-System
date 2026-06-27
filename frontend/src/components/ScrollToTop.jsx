import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Only scroll to top if there is no specific scrollTo state
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

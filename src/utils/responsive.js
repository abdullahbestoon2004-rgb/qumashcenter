import { useState, useEffect } from "react";

export const useIsMobile = (bp = 640) => {
  const [m, setM] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const h = () => setM(window.innerWidth < bp);
    window.addEventListener("resize", h, { passive: true });
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return m;
};

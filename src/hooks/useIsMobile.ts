import { useEffect, useState } from "react";

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);

    const handleResize = () => {
      setIsMobile(mediaQuery.matches);
    };

    // Initial check
    handleResize();

    // Add listener for changes
    mediaQuery.addEventListener("change", handleResize);

    // Cleanup listener on unmount
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, [breakpoint]);

  return isMobile;
}

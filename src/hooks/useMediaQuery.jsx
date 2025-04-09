import { useState, useEffect } from "react";

function useMediaQuery(query) {
  // 初期値を window.matchMedia(query).matches から求める（SSR時は false）
  const [matches, setMatches] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = (event) => {
      setMatches(event.matches);
    };
    media.addEventListener("change", listener);
    // マウント時にも念のため現在の状態をセット
    setMatches(media.matches);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export default useMediaQuery;

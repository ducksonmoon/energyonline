import { useEffect, useState } from "react";
import { toFa } from "@/lib/format";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function useHmsCountdown(target: Date | null) {
  const [state, setState] = useState<{ text: string; expired: boolean }>({ text: "", expired: true });

  useEffect(() => {
    if (!target) return;
    function tick() {
      const diff = target!.getTime() - Date.now();
      if (diff <= 0) {
        setState({ text: toFa("00:00:00"), expired: true });
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setState({ text: toFa(`${pad(hours)}:${pad(mins)}:${pad(secs)}`), expired: false });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return target ? state : { text: "", expired: true };
}

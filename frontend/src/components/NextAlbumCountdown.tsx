import { useState, useEffect } from 'react';

interface NextAlbumCountdownProps {
  targetDate?: string;
  onTimeUp?: () => void;
}

export function NextAlbumCountdown({ targetDate, onTimeUp }: NextAlbumCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isReady: false,
  });

  useEffect(() => {
    const calculateRemaining = () => {
      const now = Date.now();
      let target: number;

      if (targetDate) {
        target = new Date(targetDate).getTime();
      } else {
        // Próxima meia-noite (00:00:00) por padrão
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        target = midnight.getTime();
      }

      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isReady: true });
        onTimeUp?.();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, isReady: false });
    };

    calculateRemaining();
    const timer = setInterval(calculateRemaining, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onTimeUp]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-right min-w-36.25">
      <div className="text-[11px] text-neutral-400 flex items-center justify-end gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Próximo álbum</span>
      </div>
      <div className="font-mono text-sm font-bold text-neutral-100 mt-0.5">
        {timeLeft.isReady ? (
          <span className="text-emerald-400 animate-bounce">Pronto! ↻</span>
        ) : (
          <span>
            {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s
          </span>
        )}
      </div>
    </div>
  );
}
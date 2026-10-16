import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaRedo } from 'react-icons/fa';

/**
 * Format seconds into mm:ss or hh:mm:ss
 */
const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainder = totalSeconds % 60;
  const clock = `${minutes}:${String(remainder).padStart(2, '0')}`;
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}` : clock;
};

export default function AudioPlayer({ src, initialDuration = null, className = '' }) {
  const audioRef = useRef(null);
  const durationSeekAttemptedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(() => (Number.isFinite(initialDuration) && initialDuration > 0 ? initialDuration : 0));
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  // Reset the underlying media element when a reused player changes recordings.
  useEffect(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
      el.load();
    }
    setHasPlayed(false);
  }, [src]);

  // Decode audio buffer using Web Audio API to guarantee 100% accurate duration
  // especially for WebM/Opus blobs and streams without EBML duration headers.
  useEffect(() => {
    if (!src) return;

    let isMounted = true;
    const resolveDuration = async () => {
      let ctx;
      try {
        const response = await fetch(src);
        if (!response.ok) return;
        const arrayBuffer = await response.arrayBuffer();
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        ctx = new AudioCtx();
        const decoded = await ctx.decodeAudioData(arrayBuffer);
        if (isMounted && decoded && Number.isFinite(decoded.duration) && decoded.duration > 0) {
          setDuration(decoded.duration);
        }
      } catch {
        // Fallback to HTMLAudioElement duration calculation
      } finally {
        if (ctx && ctx.state !== 'closed') {
          ctx.close().catch(() => {});
        }
      }
    };

    resolveDuration();

    return () => {
      isMounted = false;
    };
  }, [src]);

  // Handle duration from HTMLAudioElement with Chrome WebM seek fix
  const handleLoadedMetadata = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;

    const d = el.duration;
    if (Number.isFinite(d) && d > 0) {
      setDuration(d);
      setIsLoading(false);
    } else if (d === Infinity) {
      // Chromium WebM infinite duration fix: seek to end then back to 0
      if (durationSeekAttemptedRef.current) return;
      durationSeekAttemptedRef.current = true;
      const onSeekEnd = () => {
        el.currentTime = 0;
        el.removeEventListener('timeupdate', onSeekEnd);
        if (Number.isFinite(el.duration) && el.duration > 0) {
          setDuration(el.duration);
          setIsLoading(false);
        }
      };
      el.addEventListener('timeupdate', onSeekEnd);
      try {
        el.currentTime = Number.MAX_SAFE_INTEGER;
      } catch {
        el.removeEventListener('timeupdate', onSeekEnd);
      }
    }
  }, []);

  const handleTimeUpdate = () => {
    const el = audioRef.current;
    if (!el) return;
    setCurrentTime(el.currentTime || 0);

    // If duration wasn't set yet, check if it's available now
    if ((!duration || duration === 0) && Number.isFinite(el.duration) && el.duration > 0) {
      setDuration(el.duration);
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;

    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      setHasPlayed(true);
      el.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn('Audio playback error:', err);
          setIsPlaying(false);
          setIsLoading(false);
        });
    }
  };

  const handleSeek = (e) => {
    const el = audioRef.current;
    if (!el) return;
    const newTime = parseFloat(e.target.value);
    el.currentTime = newTime;
    setCurrentTime(newTime);
    setHasPlayed(true);
  };

  const toggleMute = () => {
    const el = audioRef.current;
    if (!el) return;
    el.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setHasPlayed(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleRestart = () => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = 0;
    setCurrentTime(0);
    setHasPlayed(true);
    el.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  if (!src) return null;

  return (
    <div
      className={`bg-gradient-to-r from-[#fbf8ee] to-[#f4ecd8] border border-[#c5b597] rounded-xl p-2.5 shadow-sm ${className}`}
    >
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        onLoadStart={() => {
          durationSeekAttemptedRef.current = false;
          setIsPlaying(false);
          setIsLoading(true);
          setCurrentTime(0);
          setHasPlayed(false);
          setDuration(Number.isFinite(initialDuration) && initialDuration > 0 ? initialDuration : 0);
        }}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
          setHasPlayed(true);
        }}
        onPause={() => setIsPlaying(false)}
      />

      {/* Custom Audio Controller */}
      <div className="flex items-center gap-2.5">
        {/* Play / Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-[#163828] hover:bg-[#25583f] text-[#edd48e] flex items-center justify-center flex-shrink-0 shadow-md transition transform active:scale-95 cursor-pointer border border-[#caa85d]"
          title={isPlaying ? 'Pause' : 'Play audio'}
          aria-label={isPlaying ? 'Pause' : 'Play audio'}
        >
          {isPlaying ? (
            <FaPause className="text-xs" />
          ) : (
            <FaPlay className="text-xs ml-0.5" />
          )}
        </button>

        {/* Timeline Scrubber & Timing Display */}
        <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
          <div className="relative w-full flex items-center">
            {/* Custom Range Slider */}
            <input
              type="range"
              min="0"
              max={duration > 0 ? duration : 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              disabled={duration <= 0}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-[#e4d7bf] accent-[#163828] focus:outline-none focus:ring-1 focus:ring-[#caa85d]"
              style={{
                background: `linear-gradient(to right, #163828 ${progressPercent}%, #e2d4bc ${progressPercent}%)`,
              }}
              title="Seek audio position"
            />
          </div>

          <div className="flex items-center text-[11px] font-mono font-bold text-[#163828] tabular-nums select-none">
            <span>
              {!hasPlayed && !isPlaying && currentTime === 0
                ? (duration > 0 ? formatTime(duration) : (isLoading ? '...' : '--:--'))
                : formatTime(currentTime)}
            </span>
          </div>
        </div>

        {/* Restart Button */}
        <button
          type="button"
          onClick={handleRestart}
          className="p-1.5 text-gray-600 hover:text-[#163828] rounded transition cursor-pointer"
          title="Restart audio"
          aria-label="Restart audio"
        >
          <FaRedo className="text-xs" />
        </button>

        {/* Mute / Unmute Button */}
        <button
          type="button"
          onClick={toggleMute}
          className="p-1.5 text-gray-600 hover:text-[#163828] rounded transition cursor-pointer"
          title={isMuted ? 'Unmute' : 'Mute'}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <FaVolumeMute className="text-xs text-red-600" />
          ) : (
            <FaVolumeUp className="text-xs" />
          )}
        </button>
      </div>
    </div>
  );
}

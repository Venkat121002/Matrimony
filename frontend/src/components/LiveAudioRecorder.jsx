import React, { useState, useRef, useEffect } from 'react';
import {
  FaMicrophone,
  FaStop,
  FaRedo,
  FaTrashAlt,
  FaUpload,
  FaFileAudio,
  FaExclamationTriangle,
  FaCheckCircle,
} from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

export default function LiveAudioRecorder({
  onAudioReady,
  onAudioRemove,
  currentAudioUrl = '',
  currentAudioFile = null,
  isEditMode = false,
}) {
  const { language } = useLanguage();
  const isTamil = language === 'ta';

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState(currentAudioUrl || '');
  const [activeFile, setActiveFile] = useState(currentAudioFile || null);
  const [isLiveRecorded, setIsLiveRecorded] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // Sync if external props change
  useEffect(() => {
    if (currentAudioUrl && !previewUrl) {
      setPreviewUrl(currentAudioUrl);
    }
    if (currentAudioFile && !activeFile) {
      setActiveFile(currentAudioFile);
    }
  }, [currentAudioUrl, currentAudioFile]);

  // Clean up streams & timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Start live voice recording
  const startRecording = async () => {
    setErrorMsg('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg(
        isTamil
          ? 'உங்கள் உலாவியில் நேரடி குரல் பதிவு வசதி ஆதரிக்கப்படவில்லை.'
          : 'Live audio recording is not supported in this browser. Please use the file upload option.'
      );
      return;
    }

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: { ideal: 1 },
            echoCancellation: { ideal: true },
            autoGainControl: { ideal: true },
            noiseSuppression: { ideal: false },
          },
        });
      } catch (err) {
        console.warn('Initial mic constraint failed, falling back to basic audio:', err);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      // Ensure audio track is enabled
      const tracks = stream.getAudioTracks();
      if (!tracks || tracks.length === 0) {
        throw new Error('No audio microphone track detected.');
      }
      tracks.forEach((track) => {
        track.enabled = true;
      });

      streamRef.current = stream;

      // Setup AudioContext & Analyser for real-time voice feedback
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        try {
          const audioCtx = new AudioCtx();
          if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
          }
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkLevel = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const level = Math.min(100, Math.round((avg / 64) * 100));
            setAudioLevel(level);
            animFrameRef.current = requestAnimationFrame(checkLevel);
          };
          checkLevel();
        } catch (ctxErr) {
          console.warn('[AudioContext] Could not attach visualizer:', ctxErr);
        }
      }

      // Determine supported mime type
      const supportedTypes = [
        { mime: 'audio/webm;codecs=opus', ext: 'webm' },
        { mime: 'audio/webm', ext: 'webm' },
        { mime: 'audio/ogg;codecs=opus', ext: 'ogg' },
        { mime: 'audio/mp4', ext: 'mp4' },
        { mime: 'audio/aac', ext: 'aac' },
      ];
      let mimeType = '';
      let extension = 'webm';
      if (typeof MediaRecorder !== 'undefined') {
        for (const t of supportedTypes) {
          if (MediaRecorder.isTypeSupported(t.mime)) {
            mimeType = t.mime;
            extension = t.ext;
            break;
          }
        }
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
        }
        analyserRef.current = null;
        setAudioLevel(0);

        const chosenMime = recorder.mimeType || mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, {
          type: chosenMime,
        });

        const file = new File(
          [audioBlob],
          `live_recording_${Date.now()}.${extension}`,
          { type: chosenMime }
        );

        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }

        const newPreview = URL.createObjectURL(audioBlob);
        setPreviewUrl(newPreview);
        setActiveFile(file);
        setIsLiveRecorded(true);

        // Notify parent form
        if (onAudioReady) {
          onAudioReady(file, newPreview, true);
        }

        // Clean stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      // Continuous encoding to ensure valid WebM EBML headers
      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer (maximum 3 minutes = 180 seconds)
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= 180) {
            stopRecording();
            return 180;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('[AudioRecorder] Mic access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg(
          isTamil
            ? 'மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது. தயவுசெய்து உங்கள் உலாவி அமைப்புகளில் மைக் அணுகலை அனுமதிக்கவும்.'
            : 'Microphone permission denied. Please allow microphone access in your browser.'
        );
      } else {
        setErrorMsg(
          isTamil
            ? `குரல் பதிவைத் தொடங்க இயலவில்லை: ${err.message}`
            : `Could not start audio recording: ${err.message}`
        );
      }
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.requestData();
      } catch {
        // Fallback if not supported
      }
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Cancel recording in progress
  const cancelRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingDuration(0);
  };

  // Handle uploaded audio file
  const handleFileSelect = (e) => {
    setErrorMsg('');
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Validate type & size (25MB max)
    if (
      !file.type.startsWith('audio/') &&
      !file.name.match(/\.(mp3|wav|m4a|aac|ogg|webm|amr|3gp|flac|opus)$/i)
    ) {
      setErrorMsg(
        isTamil
          ? 'சரியான ஆடியோ கோப்பை (MP3, WAV, M4A, AAC, WEBM) தேர்வு செய்யவும்.'
          : 'Please select a valid audio file (MP3, WAV, M4A, AAC, WEBM).'
      );
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg(
        isTamil
          ? 'ஆடியோ கோப்பு 25MB-க்குள் இருக்க வேண்டும்.'
          : 'Audio file must be under 25MB.'
      );
      return;
    }

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreview = URL.createObjectURL(file);
    setPreviewUrl(newPreview);
    setActiveFile(file);
    setIsLiveRecorded(false);

    if (onAudioReady) {
      onAudioReady(file, newPreview, false);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Clear / remove current audio
  const handleRemove = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setActiveFile(null);
    setIsLiveRecorded(false);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onAudioRemove) {
      onAudioRemove();
    }
  };

  return (
    <div className="space-y-3">
      {/* Error Alert */}
      {errorMsg && (
        <div className="p-2.5 bg-red-50 border border-red-300 text-red-700 text-xs rounded-lg flex items-center gap-2 font-medium">
          <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── Active Recording Live Bar ── */}
      {isRecording ? (
        <div className="bg-gradient-to-r from-[#2c0e0e] via-[#481818] to-[#2c0e0e] text-white p-3.5 rounded-xl border-2 border-red-500 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span>
            </span>
            <div>
              <p className="text-xs sm:text-sm font-extrabold text-red-200 uppercase tracking-wide">
                {isTamil ? '● நேரடி குரல் பதிவு செய்யப்படுகிறது...' : '● Recording Live Audio...'}
              </p>
              <p className="text-[11px] text-gray-300">
                {isTamil ? 'பேசி முடித்ததும் "முடி (Stop)" அழுத்தவும்' : 'Speak clearly and click Stop when done'}
              </p>
            </div>
          </div>

          {/* Real-time Voice Activity VU Meter */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 rounded-xl border border-red-400/40">
            <span className="text-[10px] font-bold text-amber-300 whitespace-nowrap">
              {audioLevel > 5
                ? (isTamil ? '🎙️ குரல் கேட்கிறது' : '🎙️ Voice Active')
                : (isTamil ? 'மைக்ரோஃபோனில் பேசவும்...' : 'Please speak...')}
            </span>
            <div className="flex items-end gap-1 h-5 w-16">
              {[12, 25, 40, 60, 80, 50, 30].map((threshold, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 rounded-full transition-all duration-75 ${
                    audioLevel >= threshold
                      ? 'bg-amber-400 shadow-sm shadow-amber-300'
                      : 'bg-white/20'
                  }`}
                  style={{
                    height: `${Math.max(4, audioLevel >= threshold ? 18 : 4)}px`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-black px-3 py-1 bg-black/50 rounded-lg text-amber-300 border border-amber-400/40">
              {formatTime(recordingDuration)}
            </span>

            <button
              type="button"
              onClick={stopRecording}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md border border-emerald-400 transition cursor-pointer"
            >
              <FaStop className="text-xs" />
              <span>{isTamil ? 'பதிவை முடி (Stop & Save)' : 'Stop & Save'}</span>
            </button>

            <button
              type="button"
              onClick={cancelRecording}
              className="px-2.5 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-gray-300 hover:text-white text-xs transition cursor-pointer"
              title={isTamil ? 'ரத்து செய்' : 'Cancel'}
            >
              ✕
            </button>
          </div>
        </div>
      ) : previewUrl ? (
        /* ── Audio Playback & Actions Card ── */
        <div className="bg-[#fcf8f0] p-3 rounded-xl border-2 border-[#caa85d] shadow-sm space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#dfd2ba] pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-amber-200 flex items-center justify-center text-xs shadow-xs">
                {isLiveRecorded ? <FaMicrophone /> : <FaFileAudio />}
              </div>
              <div>
                <span className="text-xs font-black text-[#163828] flex items-center gap-1">
                  <span>
                    {isLiveRecorded
                      ? (isTamil ? '🎙️ நேரடி குரல் பதிவு (Live Voice)' : '🎙️ Live Voice Recording')
                      : activeFile
                      ? activeFile.name
                      : (isTamil ? 'குரல் பதிவு (Audio Note)' : 'Audio Note')}
                  </span>
                  <FaCheckCircle className="text-emerald-700 text-xs" />
                </span>
                {activeFile && (
                  <span className="text-[10px] text-gray-500 font-mono block">
                    {(activeFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                )}
              </div>
            </div>

            {/* Actions: Re-record / Upload Another / Remove */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={startRecording}
                className="px-2.5 py-1 text-[11px] font-bold bg-[#163828] text-amber-200 hover:bg-[#204e39] rounded border border-[#caa85d] flex items-center gap-1 shadow-xs transition"
                title={isTamil ? 'மீண்டும் பதிவு செய்' : 'Re-record live audio'}
              >
                <FaRedo className="text-[10px]" />
                <span>{isTamil ? 'மீண்டும் பதிவு' : 'Re-record'}</span>
              </button>

              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                title={isTamil ? 'நீக்குக' : 'Remove audio'}
              >
                <FaTrashAlt className="text-xs" />
              </button>
            </div>
          </div>

          {/* Audio Player */}
          <div className="pt-0.5">
            <audio controls src={previewUrl} className="w-full h-8" />
          </div>
        </div>
      ) : (
        /* ── Idle Options: Record Live OR Upload Audio File ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Option 1: Live Voice Recording Button */}
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-[#163828] via-[#21543c] to-[#163828] hover:from-[#1d4633] hover:to-[#1d4633] text-[#edd48e] font-extrabold text-xs sm:text-sm border-2 border-[#caa85d] shadow-md transition group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[#caa85d] text-[#163828] flex items-center justify-center text-xs group-hover:scale-110 transition shadow">
              <FaMicrophone />
            </div>
            <div className="text-left">
              <span className="block leading-tight">
                {isTamil ? '🎙️ நேரடி குரல் பதிவு (Record Lively)' : '🎙️ Record Audio Lively'}
              </span>
              <span className="text-[10px] text-gray-300 font-normal">
                {isTamil ? 'மைக்ரோஃபோன் மூலம் உடனடியாகப் பேசவும்' : 'Speak into mic & upload instantly'}
              </span>
            </div>
          </button>

          {/* Option 2: Upload File Button */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="audio/*,video/webm,.mp3,.wav,.m4a,.aac,.ogg,.webm,.amr,.3gp,.flac,.opus"
              className="hidden"
              id="live-audio-file-input"
            />
            <label
              htmlFor="live-audio-file-input"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#fcf8f0] hover:bg-[#f6eee0] text-[#44351b] font-bold text-xs sm:text-sm border-2 border-dashed border-[#caa85d] shadow-xs transition group cursor-pointer h-full"
            >
              <div className="w-7 h-7 rounded-full bg-[#ede4d1] text-[#8a6d2f] flex items-center justify-center text-xs group-hover:scale-110 transition">
                <FaUpload />
              </div>
              <div className="text-left">
                <span className="block leading-tight">
                  {isTamil ? '📁 ஆடியோ கோப்பு பதிவேற்றுக' : '📁 Upload Audio File'}
                </span>
                <span className="text-[10px] text-gray-500 font-normal">
                  {isTamil ? 'MP3, WAV, M4A, WEBM (அதிகபட்சம் 25MB)' : 'MP3, WAV, M4A, WEBM (Max 25MB)'}
                </span>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useCallback, useEffect } from 'react';

interface SpeechRecognitionHook {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const SpeechRecognition = typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

  const isSupported = !!SpeechRecognition;

  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) { setError('Speech recognition is not supported in this browser.'); return; }
    setError(null);
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      if (final) setTranscript(prev => prev + ' ' + final);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') setError('Microphone permission denied. Please allow microphone access and try again.');
      else if (event.error === 'no-speech') setError('No speech detected. Please try again.');
      else setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => { setIsListening(false); setInterimTranscript(''); };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isSupported, SpeechRecognition]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return { isSupported, isListening, transcript, interimTranscript, error, startListening, stopListening, resetTranscript };
}

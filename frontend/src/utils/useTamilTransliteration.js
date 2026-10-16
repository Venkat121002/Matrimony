import { useEffect, useRef } from 'react';
import { transliterateSentence } from './tamilTransliterate';

export default function useTamilTransliteration({ value, onChange, isTamil, name, inputRef }) {
  const rawValue = useRef(String(value || ''));
  const renderedValue = useRef(String(value || ''));
  const emittedValue = useRef(String(value || ''));
  const previousLanguage = useRef(isTamil);

  useEffect(() => {
    const incomingValue = String(value || '');
    if (previousLanguage.current !== isTamil) {
      previousLanguage.current = isTamil;
      rawValue.current = incomingValue;
      renderedValue.current = incomingValue;
      emittedValue.current = incomingValue;
    } else if (incomingValue !== emittedValue.current) {
      rawValue.current = incomingValue;
      renderedValue.current = incomingValue;
      emittedValue.current = incomingValue;
    }
  }, [value, isTamil]);

  const emit = (value) => onChange({ target: { name, value } });

  const handleChange = (event) => {
    const inputValue = event.target.value;
    if (!isTamil) {
      rawValue.current = inputValue;
      renderedValue.current = inputValue;
      emittedValue.current = inputValue;
      emit(inputValue);
      return;
    }

    const previousValue = renderedValue.current;
    const isAppend = inputValue.startsWith(previousValue);
    const nextRawValue = isAppend
      ? rawValue.current + inputValue.slice(previousValue.length)
      : inputValue;
    const nextValue = transliterateSentence(nextRawValue);
    const caretPosition = event.target.selectionStart ?? inputValue.length;
    const nextCaret = isAppend
      ? nextValue.length
      : transliterateSentence(inputValue.slice(0, caretPosition)).length;

    rawValue.current = nextRawValue;
    renderedValue.current = nextValue;
    emittedValue.current = nextValue;
    emit(nextValue);

    if (nextValue !== inputValue && inputRef?.current && typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => {
        inputRef.current?.setSelectionRange(nextCaret, nextCaret);
      });
    }
  };

  const handleBlur = (event) => {
    if (!isTamil) return;
    const inputValue = event.currentTarget.value;
    const nextValue = transliterateSentence(inputValue);
    renderedValue.current = nextValue;
    emittedValue.current = nextValue;
    if (nextValue !== inputValue) emit(nextValue);
  };

  const setValue = (value) => {
    rawValue.current = value;
    renderedValue.current = value;
    emittedValue.current = value;
    emit(value);
  };

  return { handleChange, handleBlur, setValue };
}

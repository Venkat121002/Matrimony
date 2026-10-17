import { useRef } from 'react';

/**
 * Custom hook to safely handle modal backdrop clicks without accidentally dismissing
 * the modal when a user selects text with the mouse, drags across DOM boundaries,
 * or interacts with modal scrollbars.
 *
 * @param {Function} onClose - Callback invoked when the user intentionally clicks the backdrop
 * @returns {{ backdropProps: object, modalContentProps: object }}
 */
export function useModalBackdrop(onClose) {
  const backdropMouseDownRef = useRef(false);
  const isScrollingRef = useRef(false);

  const handleBackdropMouseDown = (e) => {
    // Only register if mousedown was directly on the backdrop container itself
    if (e.target === e.currentTarget) {
      backdropMouseDownRef.current = true;
    } else {
      backdropMouseDownRef.current = false;
    }
  };

  const handleBackdropScroll = () => {
    isScrollingRef.current = true;
  };

  const handleBackdropClick = (e) => {
    // 1. If user was scrolling or interacting with scrollbar, do NOT close
    if (isScrollingRef.current) {
      isScrollingRef.current = false;
      backdropMouseDownRef.current = false;
      return;
    }

    // 2. If text is currently selected in document, do NOT close
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      backdropMouseDownRef.current = false;
      return;
    }

    // 3. If an input or textarea has text selected, do NOT close
    const activeEl = document.activeElement;
    if (
      activeEl &&
      (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') &&
      typeof activeEl.selectionStart === 'number' &&
      activeEl.selectionStart !== activeEl.selectionEnd
    ) {
      backdropMouseDownRef.current = false;
      return;
    }

    // 4. Only close if both mousedown and click originated and completed directly on the backdrop
    if (e.target === e.currentTarget && backdropMouseDownRef.current) {
      backdropMouseDownRef.current = false;
      if (onClose) onClose();
    }
    backdropMouseDownRef.current = false;
  };

  const handleModalContentMouseDown = (e) => {
    e.stopPropagation();
    backdropMouseDownRef.current = false;
  };

  const handleModalContentMouseUp = (e) => {
    e.stopPropagation();
  };

  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return {
    backdropProps: {
      onMouseDown: handleBackdropMouseDown,
      onClick: handleBackdropClick,
      onScroll: handleBackdropScroll,
    },
    modalContentProps: {
      onMouseDown: handleModalContentMouseDown,
      onMouseUp: handleModalContentMouseUp,
      onClick: handleModalContentClick,
    },
  };
}

export default useModalBackdrop;

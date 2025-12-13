import { useEffect, useCallback } from 'react';

const useKeyboardShortcuts = (shortcuts) => {
  const handleKeyDown = useCallback((event) => {
    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey;
    const shift = event.shiftKey;
    const alt = event.altKey;

    for (const [shortcut, callback] of Object.entries(shortcuts)) {
      const keys = shortcut.toLowerCase().split('+');
      let matches = true;

      // Check modifiers
      if (keys.includes('ctrl') !== ctrl) matches = false;
      if (keys.includes('shift') !== shift) matches = false;
      if (keys.includes('alt') !== alt) matches = false;

      // Check main key
      const mainKey = keys.find(k => !['ctrl', 'shift', 'alt'].includes(k));
      if (mainKey && mainKey !== key) matches = false;

      if (matches) {
        event.preventDefault();
        callback(event);
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

export default useKeyboardShortcuts;

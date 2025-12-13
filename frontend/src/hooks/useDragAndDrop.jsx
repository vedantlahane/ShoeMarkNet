import { useState, useCallback } from 'react';

const matchFileType = (file, accept = []) => {
  if (!accept.length) {
    return true;
  }

  return accept.some((rule) => {
    if (!rule) return false;

    if (rule === '*') return true;

    if (rule.endsWith('/*')) {
      const baseType = rule.replace('/*', '');
      return file.type?.startsWith(`${baseType}/`);
    }

    if (rule.startsWith('.')) {
      return file.name?.toLowerCase().endsWith(rule.toLowerCase());
    }

    return file.type === rule;
  });
};

const useDragAndDrop = ({ onDrop, accept = [], multiple = true } = {}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }, [isDragging]);

  const endDrag = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const fileList = Array.from(event.dataTransfer?.files || []);
    if (fileList.length === 0) {
      return;
    }

    const acceptedFiles = fileList.filter((file) => matchFileType(file, accept));
    if (acceptedFiles.length === 0) {
      return;
    }

    const payload = multiple ? acceptedFiles : acceptedFiles.slice(0, 1);
    if (typeof onDrop === 'function') {
      onDrop(payload);
    }
  }, [accept, multiple, onDrop]);

  const dragProps = {
    onDragOver: handleDragOver,
    onDragEnter: handleDragOver,
    onDragLeave: endDrag,
    onDragEnd: endDrag,
    onDrop: handleDrop
  };

  return {
    isDragging,
    dragProps
  };
};

export default useDragAndDrop;

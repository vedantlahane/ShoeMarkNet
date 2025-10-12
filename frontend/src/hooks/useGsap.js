import { useEffect, useRef } from 'react';

/**
 * Legacy helper hook kept for backward compatibility after removing GSAP.
 * It simply executes the provided callback once the referenced element is mounted.
 *
 * @param {(element: HTMLElement | null) => (void | (() => void))} animationFactory
 * @param {Array<unknown>} deps
 * @returns {React.MutableRefObject<HTMLElement | null>}
 */
const useGsap = (animationFactory, deps = []) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (typeof animationFactory !== 'function') {
      return undefined;
    }

    return animationFactory(element);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return elementRef;
};

export default useGsap;

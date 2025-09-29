import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * Custom hook for creating and managing GSAP animations with automatic cleanup.
 *
 * @param {Function} animationFactory - A function that receives a GSAP context and creates animations.
 * @param {Array} [deps=[]] - Dependencies for the useLayoutEffect hook.
 * @returns {React.RefObject} A ref to be attached to the scope of the animations.
 */
const useGsap = (animationFactory, deps = []) => {
  const scopeRef = useRef(null);

  useLayoutEffect(() => {
    if (!scopeRef.current || typeof animationFactory !== 'function') {
      return undefined;
    }

    let cleanup;

    const ctx = gsap.context((context) => {
      cleanup = animationFactory(context, scopeRef.current);
    }, scopeRef);

    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
      ctx.revert();
    };
  }, deps);

  return scopeRef;
};

export default useGsap;

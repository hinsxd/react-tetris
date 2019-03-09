import { useEffect, useRef } from 'react';

export default function useInterval(callback: Function, delay: number | null) {
  const savedCallback: { current: Function } = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

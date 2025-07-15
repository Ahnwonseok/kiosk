import { useEffect, MutableRefObject } from 'react';

const useOutsideClick = <T extends HTMLElement>(
  ref: MutableRefObject<T | null>, 
  callback: () => void
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]); // 의존성 추가
};

export default useOutsideClick;

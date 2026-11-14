import { useEffect, useState } from 'react';
export function useToast() {
  const [notice, setNotice] = useState({ text: '', id: 0 });
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const receive = (event: Event) => {
      clearTimeout(timer);
      const text = (event as CustomEvent<string>).detail;
      setNotice(previous => ({ text, id: previous.id + 1 }));
      timer = setTimeout(() => setNotice(previous => ({ ...previous, text: '' })), 3000);
    };
    window.addEventListener('affordly:toast', receive);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('affordly:toast', receive);
    };
  }, []);
  return {
    message: notice.text, id: notice.id, notify: (text: string) => {
      window.dispatchEvent(new CustomEvent('affordly:toast', { detail: text }));
    }
  };
}

import './RecipeDialog.css';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Button } from './Button';

export function Overlay({ children, title, onClose, drawer = false }: {
  children: ReactNode;
  title: string;
  onClose: () => void;
  drawer?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    // A route change (Back button, bottom bar) must not leave the dialog over the new screen.
    window.addEventListener('hashchange', onClose);
    return () => {
      window.removeEventListener('hashchange', onClose);
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={drawer ? 'overlay drawer' : 'overlay'}
      onCancel={event => {
        event.preventDefault();
        onClose();
      }}
      onClick={event => {
        if (event.target === event.currentTarget)
          onClose();
      }}
    >
      <div className="overlay-heading">
        <h2>{title}</h2>
        <Button aria-label={`Close ${title}`} onClick={onClose}>Close</Button>
      </div>
      {children}
    </dialog>
  );
}

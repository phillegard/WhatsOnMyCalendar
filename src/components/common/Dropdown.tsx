import { useState, useRef, useEffect, ReactNode } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  width?: string;
  onOpenChange?: (isOpen: boolean) => void;
}

export function Dropdown({
  trigger,
  children,
  align = 'right',
  width = 'w-56',
  onOpenChange,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setIsOpen(false));

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Notify parent of open state changes
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  return (
    <div className="relative" ref={ref}>
      <div onClick={toggleOpen}>{trigger}</div>
      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-2 ${width} origin-top-${align} rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-fade-in`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

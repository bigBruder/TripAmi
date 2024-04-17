import { FC, ReactNode, useEffect, useRef, useState } from 'react';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface Props {
  trigger: ReactNode;
  content: ReactNode;
  side?: 'top' | 'bottom' | 'right' | 'left';
}

export const useOutsideClick = (callback: () => void) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mouseup', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
    };
  }, [callback]);

  return ref;
};

export const DropdownProvider: FC<Props> = ({ trigger, content, side }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useOutsideClick(() => setIsOpen(false));
  return (
    <div ref={ref}>
      <DropdownMenu.Root onOpenChange={(open) => setIsOpen(open)} open={isOpen}>
        <DropdownMenu.Trigger>{trigger}</DropdownMenu.Trigger>
        <DropdownMenu.Content style={{ zIndex: '5' }} side={side ? side : 'bottom'}>
          {/* This is the content of the dropdown */}
          <DropdownMenu.Group>
            <DropdownMenu.Item
              onSelect={() => {}}
              style={{ position: 'relative', marginLeft: '20px' }}
            >
              {content}
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
};

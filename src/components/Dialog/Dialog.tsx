import { FC, ReactNode } from 'react';

import * as Window from '@radix-ui/react-dialog';

import styles from './dialog.module.css';

type Props = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
};

export const Dialog: FC<Props> = ({ isOpen, onClose, children, title }) => {
  return (
    <Window.Root open={isOpen} onOpenChange={() => onClose()}>
      <Window.Portal>
        <Window.Overlay className={styles.dialogOverlay} />
        <Window.Content className={styles.dialogContent}>
          {title && <Window.Title className='DialogTitle'>{title}</Window.Title>}
          {children}
        </Window.Content>
      </Window.Portal>
    </Window.Root>
  );
};

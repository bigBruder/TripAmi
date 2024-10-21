import React from 'react';

import styles from './CustomModalDeleteAccount.module.css';

interface CustomModalDeleteAccountProps {
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  handleDeleteAccoount: () => void;
}

const CustomModalDeleteAccount: React.FC<CustomModalDeleteAccountProps> = ({
  onClose,
  isOpen,
  handleDeleteAccoount,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={() => onClose(false)}>
          &times;
        </button>
        <h3 className={styles.title}>Are you sure you want to delete your account?</h3>
        <div className={styles.buttonsContainer}>
          <div
            className={`${styles.content} ${styles.yesButton}`}
            onClick={() => handleDeleteAccoount()}
          >
            Yes
          </div>
          <div className={`${styles.content} ${styles.noButton}`} onClick={() => onClose(false)}>
            Close
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomModalDeleteAccount;

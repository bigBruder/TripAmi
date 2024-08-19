import React from 'react';

import styles from './DeleteFolderModal.module.css';

interface DeleteFolderModalProps {
  setIsDeleteFolderOpen: (value: boolean) => void;
  handleDeleteFolder: () => void;
}

const DeleteFolderModal: React.FC<DeleteFolderModalProps> = ({
  setIsDeleteFolderOpen,
  handleDeleteFolder,
}) => {
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const target = e.target as HTMLDivElement;
    if (target.className.includes(styles.modalBackground)) {
      setIsDeleteFolderOpen(false);
    }
  };

  return (
    <div className={styles.modalBackground} onClick={handleBackgroundClick}>
      <div className={styles.modalContent}>
        <div>Are you sure you want to delete the folder?</div>
        <div className={styles.sugestContainer}>
          <button className={styles.saveEditButton} onClick={handleDeleteFolder}>
            Delete
          </button>
          <button className={styles.cancelEditButton} onClick={() => setIsDeleteFolderOpen(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteFolderModal;

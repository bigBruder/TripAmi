import React from 'react';
import ReactModal from 'react-modal';

import styles from './PhotoModal.module.css';

interface PhotoModalProps {
  photoForModal: string;
  setIsPhotoOpen: (isOpen: boolean) => void;
  isPhotoOpen: boolean;
}

const PhotoModal: React.FC<PhotoModalProps> = ({ photoForModal, setIsPhotoOpen, isPhotoOpen }) => {
  return (
    <ReactModal
      closeTimeoutMS={500}
      isOpen={isPhotoOpen}
      style={{
        content: {
          padding: 0,
          height: 'fit-content',
          width: 'fit-content',
          margin: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
      contentLabel='Example Modal'
      onRequestClose={() => {
        setIsPhotoOpen(false);
      }}
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
    >
      <img src={photoForModal} alt='photo' className={styles.image} />
    </ReactModal>
  );
};

export default PhotoModal;

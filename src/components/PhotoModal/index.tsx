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
          padding: '0',
          border: 'none',
          height: 'fit-content',
          width: 'fit-content',
          marginBlock: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          alignSelf: 'center',
          position: 'static',
          boxSizing: 'border-box',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          paddingBlock: '20px',
          boxSizing: 'border-box',
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

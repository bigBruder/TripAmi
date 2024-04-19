import React, { FC, useEffect } from 'react';

import * as Dialog from '@radix-ui/react-dialog';

import styles from './gallery.module.css';

interface Props {
  images: { type: string; url: string; description: string }[];
  onClose: () => void;
  isOpen: boolean;
}

export const Gallery: FC<Props> = ({ images, isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = React.useState<{
    type: string;
    url: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    if (images.length > 0) {
      setSelectedImage(images[0]);
    }
  }, [images]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.dialogOverlay} />
        <Dialog.Content className={styles.dialogContent}>
          <div className={styles.imagesContainer}>
            {images.map((image, index) =>
              image.type.includes('image') ? (
                <img
                  key={image.url + index}
                  src={image.url}
                  alt='image'
                  className={styles.image}
                  onClick={() => setSelectedImage(image)}
                />
              ) : (
                <video
                  key={image.url + index}
                  src={image.url}
                  className={styles.image}
                  onClick={() => setSelectedImage(image)}
                ></video>
              )
            )}
          </div>
          <div className={styles.selectedImageContainer}>
            {selectedImage?.type.includes('image') ? (
              <img src={selectedImage.url} alt='selected image' className={styles.selectedImage} />
            ) : (
              <video src={selectedImage?.url} className={styles.selectedImage} controls></video>
            )}

            <div className={styles.descriptionContainer}>
              <p>{selectedImage?.description}</p>
            </div>
          </div>
          <Dialog.Close asChild>
            <button className={styles.close} aria-label='Close' onClick={onClose}>
              {' '}
              X
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

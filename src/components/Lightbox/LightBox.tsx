import React from 'react';
import Modal from 'react-modal';
import styles from './lightbox.module.css';
import { CSSTransition } from 'react-transition-group';

interface Props {
  children: React.ReactNode;
  isOpen: boolean;
  onCloseModal: () => void;
  images?: {
    url: string;
    type: string;
  }[],
  selectedImage: {
    url: string;
    type: string;
    description: string;
  } | null;
  onChangeSelectedPhoto: (photo: {url: string; type: string}) => void;
}


export const LightBox: React.FC<Props> = ({isOpen, onCloseModal, selectedImage, images, onChangeSelectedPhoto }) => {
  // console.log(images);
  
    console.log(selectedImage?.description);
    return (
        <CSSTransition
          in={isOpen}
          timeout={300}
          classNames="dialog"
        >
          <Modal
            closeTimeoutMS={500}
            isOpen={isOpen}
            style={{
              content: {
                padding: 0,
              },
            }}
            contentLabel="Example Modal"
            onRequestClose={onCloseModal}
            shouldCloseOnOverlayClick
            shouldCloseOnEsc
          >

            <div className={styles.modal}>
              <div className={styles.selectedImageContainer}>
              {
                selectedImage?.type === 'image/jpeg' ? (
                  <img
                    src={selectedImage.url}
                    alt="travel"
                    className={styles.selectedImage}
                  />
                ) : (
                  <video
                    src={selectedImage?.url}
                    className={styles.selectedImage}
                    controls
                    onClick={() => {}}
                  />
                )
            }
              
              </div>
              {selectedImage?.description && (<p>{selectedImage?.description}l;k;lk;lkl;k</p>)}
              <div className={styles.slider}>
              {
                  images && images.map((image, index) => {
                      if (image.type === 'image/jpeg') {
                        return (
                          <img
                            key={index}
                            src={image.url}
                            alt="travel"
                            className={styles.image}
                            onClick={() => {
                              onChangeSelectedPhoto(image);
                            }}
                          />
                        )
                      } else if(image.type === 'video/mp4') {
                        return (
                          <video
                            key={index}
                            src={image.url}
                            className={styles.image}
                            controls={false}
                            onClick={() => {
                              onChangeSelectedPhoto(image);
                            }}
                          />
                        )
                      }
                      })
                  }
              </div>


            </div>
          </Modal>
        </CSSTransition>
      );
};
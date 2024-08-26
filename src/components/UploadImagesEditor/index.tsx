import React, { useEffect, useRef, useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';

import { Navigation } from 'swiper/modules';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';

import arrow_right from '../../assets/icons/arrow_right.svg';
import deleteButton from '../../assets/icons/deleteButton.svg';
import downloadButton from '../../assets/icons/downloadButton.svg';
import plus from '../../assets/icons/lucide_plus.svg';
import styles from './UploadImagesEditor.module.css';

interface Props {
  file: File[];
  handleChange: (files: FileList) => void;
  handleRemove: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    photoName: string,
    index: number
  ) => void;
}

const UploadImagesEditor: React.FC<Props> = ({ file, handleChange, handleRemove }) => {
  const fileTypes = ['JPEG', 'PNG', 'JPG', 'MP4', 'HEIC'];

  const sliderRef = useRef<SwiperRef>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (sliderRef.current && sliderRef.current.swiper) {
      const swiperInstance = sliderRef.current.swiper;
      swiperInstance.on('slideChange', () => {
        setCurrentSlide(swiperInstance.realIndex);
      });
    }
  }, [file, currentSlide]);

  const handlePrev = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | null) => {
    if (!sliderRef.current || !event) {
      return;
    }
    event.preventDefault();
    sliderRef.current.swiper.slidePrev();
  };

  const handleNext = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | null) => {
    if (!sliderRef.current || !event) {
      return;
    }
    event.preventDefault();
    sliderRef.current.swiper.slideNext();
  };

  const isVideo = (file: File) => file.type.startsWith('video');

  const countSlides = (fileLength: number): number => {
    const width = window.innerWidth;
    let slidesToShow = width >= 1420 ? 3 : width >= 834 ? 2 : 1;

    if (width < 1400 && fileLength === 2) {
      slidesToShow = 2;
    }

    if (width < 800 && fileLength >= 2) {
      slidesToShow = 1;
    }

    return Math.min(slidesToShow, fileLength);
  };

  const shouldShowArrows = (fileLength: number): boolean => {
    const slidesToShow = countSlides(fileLength);
    return fileLength > slidesToShow;
  };

  const showArrows = shouldShowArrows(file.length);
  const slidesToShow = countSlides(file.length);

  return (
    <div className={styles.fileLoaderContainer}>
      {file.length === 0 ? (
        <FileUploader
          multiple={true}
          handleChange={handleChange}
          name='file'
          types={fileTypes}
          hoverTitle={' '}
        >
          <div className={styles.uploadContainer}>
            <p className={styles.text}>Drag and drop image/video or click on </p>
            <div className={styles.buttonUploadContainer}>
              <img src={downloadButton} alt='downloadButton' className={styles.buttonUpload} />
            </div>
          </div>
        </FileUploader>
      ) : file.length === 1 ? (
        <div className={styles.singleImageContainer}>
          {isVideo(file[0]) ? (
            <video src={URL.createObjectURL(file[0])} controls className={styles.singleImage} />
          ) : (
            <img src={URL.createObjectURL(file[0])} alt='Uploaded' className={styles.singleImage} />
          )}
          <button
            onClick={(e) => handleRemove(e, file[0].name, 0)}
            className={styles.removePhotoButton}
          >
            <img src={deleteButton} alt='deleteButton' />
          </button>
          <FileUploader
            multiple={true}
            handleChange={handleChange}
            name='file'
            types={fileTypes}
            hoverTitle={' '}
          >
            <div
              className={
                isVideo(file[0])
                  ? styles.uploadContainerWithVideoSingle
                  : styles.uploadContainerWithImagesSingle
              }
            >
              <div className={styles.buttonUploadPlus}>
                <img src={plus} alt='downloadButton' />
              </div>
              <p className={styles.text}>Add image/video</p>
            </div>
          </FileUploader>
        </div>
      ) : (
        <div className={styles.multyImageContainer}>
          <div className={styles.swiperContainerWrap}>
            <Swiper
              ref={sliderRef}
              spaceBetween={0}
              slidesPerView={countSlides(file.length)}
              className={styles.swiperContainer}
              modules={[Navigation]}
            >
              {file.map((file, index) => (
                <SwiperSlide key={file.name + index} className={styles.swiperSlide}>
                  {isVideo(file) ? (
                    <video src={URL.createObjectURL(file)} controls className={styles.image} />
                  ) : (
                    <img src={URL.createObjectURL(file)} alt='Uploaded' className={styles.image} />
                  )}
                  <button
                    onClick={(e) => handleRemove(e, file.name, index)}
                    className={styles.removePhotoButton}
                  >
                    <img src={deleteButton} alt='deleteButton' />
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
            {showArrows && (
              <>
                <div
                  className={`${styles.prev_arrow} ${currentSlide === 0 ? styles.disabled : ''}`}
                  onClick={currentSlide !== 0 ? handlePrev : undefined}
                >
                  <img src={arrow_right} alt='arrow-left' className={styles.arrow_left} />
                </div>
                <div
                  className={`${styles.next_arrow} ${currentSlide + slidesToShow >= file.length ? styles.disabled : ''}`}
                  onClick={currentSlide + slidesToShow < file.length ? handleNext : undefined}
                >
                  <img src={arrow_right} alt='arrow-right' className={styles.arrow_right} />
                </div>
              </>
            )}
          </div>
          <FileUploader
            multiple={true}
            handleChange={handleChange}
            name='file'
            types={fileTypes}
            hoverTitle={' '}
          >
            <div className={styles.uploadContainerWithImages}>
              <div className={styles.buttonUploadPlus}>
                <img src={plus} alt='downloadButton' />
              </div>
              <p className={styles.text}>Add image/video</p>
            </div>
          </FileUploader>
        </div>
      )}
    </div>
  );
};

export default UploadImagesEditor;

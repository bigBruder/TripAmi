import React, { useEffect, useRef, useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';

import { Navigation } from 'swiper/modules';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';

import arrow_right from '../../assets/icons/arrow_right.svg';
import deleteButton from '../../assets/icons/deleteButton.svg';
import downloadButton from '../../assets/icons/downloadButton.svg';
import plus from '../../assets/icons/lucide_plus.svg';
import styles from './DailyUploadImagesEditor.module.css';

interface Props {
  dailyInfo: File[];
  handleChange: (files: FileList) => void;
  handleRemove: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, photoName: string, index: number) => void;
}

const DailyUploadImagesEditor: React.FC<Props> = ({ dailyInfo, handleChange, handleRemove }) => {
  const fileTypes = ['JPEG', 'PNG', 'JPG', 'MP4'];

  const sliderRef = useRef<SwiperRef | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (sliderRef.current && sliderRef.current.swiper) {
      sliderRef.current.swiper.on('slideChange', () => {
        if (sliderRef.current && sliderRef.current.swiper) {
          setCurrentSlide(sliderRef.current.swiper.realIndex as number);
        }
      });
    }
  }, [currentSlide, dailyInfo]);

  useEffect(() => {
    if (sliderRef.current && sliderRef.current.swiper) {
      setCurrentSlide(sliderRef.current.swiper.realIndex);
    }
  }, []);

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

  function countSlides(fileLength: number): number {
    const width = window.innerWidth;
    let slidesToShow = width >= 1420 ? 3 : width >= 860 ? 2 : 1;

    if (width < 1400 && fileLength === 2) {
      slidesToShow = 2;
    }

    if (width < 800 && fileLength >= 2) {
      slidesToShow = 1;
    }

    return Math.min(slidesToShow, fileLength);
  }

  function shouldShowArrows(fileLength: number): boolean {
    const slidesToShow = countSlides(fileLength);
    return fileLength > slidesToShow;
  }

  const showArrows = shouldShowArrows(dailyInfo.length);
  const slidesToShow = countSlides(dailyInfo.length);

  return (
    <div className={styles.fileLoaderContainer}>
      {dailyInfo.length === 0 ? (
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
      ) : dailyInfo.length === 1 ? (
        <div className={styles.singleImageContainer}>
          {dailyInfo[0].type.startsWith('image/') ? (
            <img
              src={URL.createObjectURL(dailyInfo[0])}
              alt='Uploaded'
              className={styles.singleImage}
            />
          ) : dailyInfo[0].type.startsWith('video/') ? (
            <video
              src={URL.createObjectURL(dailyInfo[0])}
              className={styles.singleImage}
              controls
            />
          ) : null}
          <button
            onClick={(e) => handleRemove(e, dailyInfo[0].name, 0)}
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
                dailyInfo[0].type.startsWith('image/')
                  ? styles.uploadContainerWithImagesSingle
                  : styles.uploadContainerWithVideoSingle
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
              slidesPerView={countSlides(dailyInfo.length)}
              className={styles.swiperContainer}
              modules={[Navigation]}
            >
              {dailyInfo.map((item, index) => (
                <SwiperSlide key={`${item}${index}`} className={styles.swiperSlide}>
                  {item.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(item)} alt='Uploaded' className={styles.image} />
                  ) : item.type.startsWith('video/') ? (
                    <video src={URL.createObjectURL(item)} className={styles.image} controls />
                  ) : null}
                  <button
                    onClick={(e) => handleRemove(e, item.name, index)}
                    className={styles.removePhotoButton}
                  >
                    <img src={deleteButton} alt='deleteButton' />
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
            <div
              className={`${styles.prev_arrow} ${currentSlide === 0 ? styles.disabled : ''}`}
              onClick={currentSlide !== 0 ? handlePrev : undefined}
            >
              <img src={arrow_right} alt='arrow-left' className={styles.arrow_left} />
            </div>
            {showArrows && (
              <>
                <div
                  className={`${styles.prev_arrow} ${currentSlide === 0 ? styles.disabled : ''}`}
                  onClick={currentSlide !== 0 ? handlePrev : undefined}
                >
                  <img src={arrow_right} alt='arrow-left' className={styles.arrow_left} />
                </div>
                <div
                  className={`${styles.next_arrow} ${currentSlide + slidesToShow >= dailyInfo.length ? styles.disabled : ''}`}
                  onClick={currentSlide + slidesToShow < dailyInfo.length ? handleNext : undefined}
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

export default DailyUploadImagesEditor;

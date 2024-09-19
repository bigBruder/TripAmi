import React, { useEffect, useRef, useState } from 'react';

import { Navigation } from 'swiper/modules';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';

import arrow_right from '../../assets/icons/arrow_right.svg';
import plus from '../../assets/icons/plus.svg';
import styles from './SwiperTrip.module.css';

interface Props {
  file: { url: string; type: string; description: string | undefined }[];
  handleSelectImage: (index: number) => void;
  setIsPhotoOpen: (isOpen: boolean) => void;
  setPhotoForModal: (photo: string) => void;
}

const SwiperTrip: React.FC<Props> = ({ file, setIsPhotoOpen, setPhotoForModal }) => {
  const sliderRef = useRef<SwiperRef>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (sliderRef.current && sliderRef.current.swiper) {
      sliderRef.current.swiper.on('slideChange', () => {
        if (sliderRef.current && sliderRef.current.swiper) {
          setCurrentSlide(sliderRef.current.swiper.realIndex as number);
        }
      });
    }
  }, [currentSlide, file]);

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

    return Math.min(slidesToShow, fileLength);
  }

  function shouldShowArrows(fileLength: number): boolean {
    const slidesToShow = countSlides(fileLength);
    return fileLength > slidesToShow;
  }

  const showArrows = shouldShowArrows(file.length);
  const slidesToShow = countSlides(file.length);

  return (
    <div className={styles.fileLoaderContainer}>
      {file.length === 1 ? (
        <div className={styles.singleImageContainer}>
          {file[0].type.includes('image') ? (
            <img
              src={file[0].url}
              alt='Uploaded'
              className={styles.singleImage}
              onClick={() => {
                setPhotoForModal(file[0].url);
                setIsPhotoOpen(true);
              }}
            />
          ) : (
            <video src={file[0].url} controls className={styles.singleImage} />
          )}
        </div>
      ) : (
        <div className={styles.multyImageContainer}>
          <div className={styles.swiperContainerWrap}>
            <Swiper
              ref={sliderRef}
              spaceBetween={0}
              slidesPerView={slidesToShow}
              className={styles.swiperContainer}
              modules={[Navigation]}
            >
              {file.map((file) => (
                <SwiperSlide key={file.url} className={styles.swiperSlide}>
                  {file.type.includes('image') || file.type === '' ? (
                    <img
                      src={file.url}
                      alt='Uploaded'
                      className={styles.image}
                      onClick={() => {
                        setPhotoForModal(file.url);
                        setIsPhotoOpen(true);
                      }}
                    />
                  ) : (
                    <video src={file.url} controls className={styles.video} />
                  )}
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
                {currentSlide + slidesToShow < file.length && (
                  <div className={styles.countImage}>
                    <img className={styles.plusButton} src={plus} alt='plus' />
                    <span>{`${file.length - (currentSlide + slidesToShow)} ${file.length - (currentSlide + 1) > 1 ? 'Photos' : 'Photo'}`}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SwiperTrip;

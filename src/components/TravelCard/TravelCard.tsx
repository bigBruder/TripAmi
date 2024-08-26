import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import Modal from 'react-modal';
// import ReactQuill from 'react-quill';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import cn from 'classnames';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getDownloadURL } from 'firebase/storage';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import CreateTripModal from '~/components/CreateTripModal';
import CustomModal from '~/components/CustomModal';
import Rating from '~/components/Rating';
import { db, storage } from '~/firebase';
import { AuthContext } from '~/providers/authContext';
import { commentsCollection, usersCollection } from '~/types/firestoreCollections';
import { ITravel } from '~/types/travel';
import { IUser } from '~/types/user';
import { timeAgo } from '~/utils/daysAgo';

import BinIcon from '@assets/icons/BinIcon.svg';
import commentsIcon from '@assets/icons/comments.svg';
import Dots from '@assets/icons/dots.svg';
import plus from '@assets/icons/plus.svg';
import shareIcon from '@assets/icons/share.svg';
import TouchIcon from '@assets/icons/touch.svg';
import { deleteDoc, doc, documentId } from '@firebase/firestore';
import { ref } from '@firebase/storage';

import { UserPostInfo } from '../BigPost/UserPostInfo';
import { DropdownProvider } from '../DropdownProvider/DropdownProvider';
import { LightBox } from '../Lightbox/LightBox';
import ShareModal from '../ShareModal/ShareModal';
import styles from './travelCard.module.css';

interface Props {
  travel: ITravel;
  isSwiper?: boolean;
  isSearch?: boolean;
}

const notifyInfo = (message: string) => {
  if (!toast.isActive('info')) {
    toast.info(message, { toastId: 'info' });
  }
};
const notifyError = (message: string) => toast.error(message);

const TravelCard: FC<Props> = ({ travel, isSwiper = false, isSearch = false }) => {
  const { firestoreUser, updateFirestoreUser } = useContext(AuthContext);
  const [imageDownloadUrls, setImageDownloadUrls] = useState<
    { url: string; type: string; description: string }[]
  >([]);
  const [userData, setUserData] = useState<IUser>();
  const [isImageLoading, setIsImageLoading] = useState(true);

  const {
    startDate,
    endDate,
    rate,
    imageUrl,
    text,
    userId,
    tripName,
    id,
    createdAt,
    stage,
    usersSaved,
    photo,
  } = travel;
  const navigate = useNavigate();
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [isModalShareOpen, setIsModalShareOpen] = useState(false);
  const [inFavourites, setInFavourites] = useState(travel.usersSaved?.includes(firestoreUser?.id));

  const handleDeleteTrip = useCallback(async () => {
    try {
      await deleteDoc(doc(db, 'trips', id));

      const subcollectionCities = collection(db, `trips/${id}/cities`);
      const subcollectionPlaces = collection(db, `trips/${id}/places`);

      const queryCities = query(subcollectionCities);
      const queryPlaces = query(subcollectionPlaces);

      const [querySnapshotCities, querySnapshotPlaces] = await Promise.all([
        getDocs(queryCities),
        getDocs(queryPlaces),
      ]);

      const deleteCitiesPromises = querySnapshotCities.docs.map((doc) => deleteDoc(doc.ref));
      const deletePlacesPromises = querySnapshotPlaces.docs.map((doc) => deleteDoc(doc.ref));

      await Promise.all([...deleteCitiesPromises, ...deletePlacesPromises]);

      const queryComments = query(commentsCollection, where('postId', '==', id));
      const querySnapshotComments = await getDocs(queryComments);
      querySnapshotComments.docs.map((doc) => deleteDoc(doc.ref));

      updateFirestoreUser({
        tripCount: firestoreUser?.tripCount ? firestoreUser?.tripCount - 1 : 0,
      });
      notifyInfo('Trip deleted successfully');
    } catch (err) {
      notifyError('Error deleting trip');
      console.log('[ERROR deleting trip] => ', err);
    }
  }, [firestoreUser?.tripCount, id, updateFirestoreUser]);

  useEffect(() => {
    (async () => {
      try {
        setIsImageLoading(true);
        const downloadedUrls = [];

        for (let i = 0; i < imageUrl.length; i++) {
          let url;
          if (imageUrl[i].url.includes('htttp://firebasestorage.googleapis.com')) {
            url = imageUrl[i].url;
          } else {
            url = await getDownloadURL(ref(storage, imageUrl[i].url));
          }
          downloadedUrls.push({
            url,
            type: imageUrl[i].type,
            description: imageUrl[i].description,
          });
        }

        setImageDownloadUrls(downloadedUrls);
      } catch (err) {
        console.log('[ERROR getting download url for the image] => ', err);
      } finally {
        setIsImageLoading(false);
      }
    })();
  }, [imageUrl]);

  const handleCloseEditModal = useCallback(() => {
    setEditModalIsOpen(false);
  }, []);

  const currentTimestamp = () => {
    const now = new Date();
    const seconds = Math.floor(now.getTime() / 1000);
    const nanoseconds = (now.getTime() % 1000) * 1000000;
    return { seconds, nanoseconds };
  };

  const timestamp = currentTimestamp();

  useEffect(() => {
    (async () => {
      if (userId) {
        try {
          const q = query(usersCollection, where(documentId(), '==', userId));
          const querySnapshot = await getDocs(q);
          const fetchedUser = querySnapshot.docs[0].data() as IUser;
          setUserData(fetchedUser as IUser);
        } catch (error) {
          console.log('[ERROR getting user from firestore] => ', error);
        }
      }
    })();
  }, [userId]);

  const handleOpenTrip = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/trip/' + id, { state: { id: id } });
    window.scrollTo(0, 0);
  };

  return (
    <div
      className={cn(styles.container, { [styles.containerSwiper]: isSwiper , [styles.containerSearch]: isSearch })}
      onClick={(e) => {
        handleOpenTrip(e);
      }}
    >
      <div className={styles.mainContainer}>
        <div className={styles.mainPhotoContainer}>
          {imageDownloadUrls.length === 0 ? (
            <div className={styles.imageContainer}>
              <img
                src={'/photoNotFound.jpg'}
                alt='travel'
                className={styles.image}
                onClick={() => {
                  navigate('/trip/' + id, { state: { id: id } });
                  window.scrollTo(0, 0);
                }}
              />
              <div
                className={`${styles.stage} ${stage === 'Finished' ? styles.finishedTrip : styles.currentTrip}`}
              >
                {stage === 'Finished' ? 'Finished' : 'Current'}
              </div>
            </div>
          ) : imageDownloadUrls[0] && imageDownloadUrls[0].type.includes('image') ? (
            <div className={styles.imageContainer}>
              <img
                src={
                  imageDownloadUrls && imageDownloadUrls.length
                    ? imageDownloadUrls[0].url
                    : '/photoNotFound.jpg'
                }
                alt='travel'
                className={styles.image}
                onClick={() => {
                  navigate('/trip/' + id, { state: { id: id } });
                  window.scrollTo(0, 0);
                }}
              />

              {imageDownloadUrls.length > 2 && (
                <div className={styles.photoCount}>
                  <img src={plus} alt='plus' />
                  {`${imageDownloadUrls.length - 1} photos`}
                </div>
              )}
              <div
                className={`${styles.stage} ${stage === 'Finished' ? styles.finishedTrip : styles.currentTrip}`}
              >
                {stage === 'Finished' ? 'Finished' : 'Current'}
              </div>
            </div>
          ) : (
            imageDownloadUrls &&
            imageDownloadUrls[0] && (
              <div className={styles.imageContainer}>
                <video
                  src={imageDownloadUrls[0].url}
                  className={styles.image}
                  controls
                  onClick={() => {
                    navigate('/trip/' + id);
                    window.scrollTo(0, 0);
                  }}
                />
                {imageDownloadUrls.length > 1 && (
                  <div className={styles.photoCount}>
                    <img src={plus} alt='plus' />
                    {`${imageDownloadUrls.length - 1} photos`}
                  </div>
                )}
                <div
                  className={`${styles.stage} ${stage === 'Finished' ? styles.finishedTrip : styles.currentTrip}`}
                >
                  {stage === 'Finished' ? 'Finished' : 'Current'}
                </div>
              </div>
            )
          )}
        </div>
      </div>
      <div className={styles.mainFooterContainer}>
        <div className={styles.textContainer}>
          <h3 className={styles.tripName}>{tripName}</h3>
          <div className={styles.topContainer}>
            <Rating disabled selectedStars={rate} />
          </div>
          <div className={styles.tripText}>{text.replaceAll('<br />', '\n')}</div>
        </div>
        <div className={styles.footer}>
          <p className={styles.postedTimeTitle}>{`Posted: ${timeAgo(createdAt)}`}</p>
          <div className={styles.actionsButtons}>
            <div className={styles.shareContainer}>
              <img
                className={styles.commentsIcon}
                src={commentsIcon}
                alt='comments'
                onClick={() => {
                  navigate('/trip/' + id);
                }}
              />
            </div>
            <div
              className={styles.shareContainer}
              onClick={(e) => {
                e.stopPropagation();
                setIsModalShareOpen(true);
              }}
            >
              <img className={styles.shareIcon} src={shareIcon} alt='share' />
            </div>
            {firestoreUser?.id === userId ? (
              <>
                <div
                  className={styles.shareContainer}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModalDeleteOpen(true);
                  }}
                >
                  <img className={styles.dotsIcon} src={BinIcon} alt='dots' />
                </div>
                <div
                  className={styles.shareContainer}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/trip/create', { state: { data: travel, isEdit: true } });
                    window.scrollTo(0, 0);
                  }}
                >
                  {' '}
                  <img className={styles.dotsIcon} src={Dots} alt='dots' />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={isModalShareOpen}
        onRequestClose={() => setIsModalShareOpen(false)}
        linkTo={'https://tripamimain.netlify.app/#/trip/' + travel.id}
      />

      <CustomModal isOpen={editModalIsOpen} onCloseModal={handleCloseEditModal}>
        <CreateTripModal
          closeModal={handleCloseEditModal}
          isEdit
          data={{
            id: id,
            imageUrl: travel.imageUrl,
            rate: travel.rate,
            startDate: startDate,
            endDate: endDate,
            geoTags: travel.geoTags,
            cities: travel.cities,
            tripName: tripName,
            pinColor: travel.pinColor || 'blue',
            dayDescription: travel.dayDescription,
            text: travel.text,
          }}
        />
      </CustomModal>

      <Modal
        closeTimeoutMS={500}
        isOpen={isModalDeleteOpen}
        style={{
          content: {
            padding: 0,
            margin: 'auto',
            height: 300,
          },
        }}
        contentLabel='Example Modal'
        onRequestClose={() => setIsModalDeleteOpen(false)}
        shouldCloseOnOverlayClick
        shouldCloseOnEsc
      >
        <div className={styles.deleteModalContainer}>
          <div className={styles.deleteModal}>
            <h3 className={styles.deleteModal_title}>Delete Trip</h3>
            <p>Are you sure you want to delete the trip?</p>
            <div className={styles.deleteControlContainer}>
              <button
                className={`${styles.buttonModal}, ${styles.buttonModal_delete}`}
                onClick={handleDeleteTrip}
              >
                Delete
              </button>
              <button
                className={`${styles.buttonModal}, ${styles.buttonModal_cancel}`}
                onClick={() => setIsModalDeleteOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <LightBox
        isOpen={isPhotosModalOpen}
        onCloseModal={() => {
          setIsPhotosModalOpen(false);
          document.body.style.overflow = 'auto';
        }}
        selectedImage={selectedImage}
        onChangeSelectedPhoto={setSelectedImage}
        images={imageDownloadUrls}
      />
    </div>
  );
};

export default TravelCard;

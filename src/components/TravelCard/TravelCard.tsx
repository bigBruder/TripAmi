import {ITravel} from "~/types/travel";
import {FC, useCallback, useContext, useEffect, useMemo, useState} from "react";
import styles from './travelCard.module.css';
import Rating from "~/components/Rating";
import {getDownloadURL} from "firebase/storage";
import {ref} from "@firebase/storage";
import {db, storage} from "~/firebase";
import commentsIcon from "@assets/icons/comments.svg";
import shareIcon from "@assets/icons/share.svg";
import BinIcon from "@assets/icons/BinIcon.svg";
import {AuthContext} from "~/providers/authContext";
import {deleteDoc, doc} from "@firebase/firestore";
import {useNavigate} from "react-router-dom";
import {ReactPhotoCollage} from "react-photo-collage";
import Dots from '@assets/icons/dots.svg';
import CreateTripModal from "~/components/CreateTripModal";
import CustomModal from "~/components/CustomModal";

interface Props {
  travel: ITravel;
}

const TravelCard: FC<Props> = ({travel}) => {
  const {firestoreUser, updateFirestoreUser} = useContext(AuthContext);
  const [imageDownloadUrls, setImageDownloadUrls] = useState<{url: string; type: string}[]>([]);
  const {
    location,
    when,
    rate,
    imageUrl,
    text,
    userId,
    comments_count,
    tripName,
    id,
  } = travel;
  const navigate = useNavigate();
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);

  const handleDeleteTrip = useCallback(async () => {
    try {
      await deleteDoc(doc(db, 'trips', id));

      updateFirestoreUser({
        tripCount: firestoreUser?.tripCount ? firestoreUser?.tripCount - 1 : 0,
      });
    } catch (err) {
      console.log('[ERROR deleting trip] => ', err);
    }
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const downloadedUrls = [];

        for (let i = 0; i < imageUrl.length; i++) {
          const url = await getDownloadURL(ref(storage, imageUrl[i].url));
          downloadedUrls.push({url, type: imageUrl[i].type});
        }

        setImageDownloadUrls(downloadedUrls);
      } catch (err) {
        console.log('[ERROR getting download url for the image] => ', err)
      }
    })();
  }, []);

  const getLayout = useMemo(() => {
    switch (imageDownloadUrls?.length) {
      case 1:
        return [1];
      case 2:
        return [1, 1];
      case 3:
        return [1, 2];
      case 4:
        return [2, 2];
      case 5:
        return [1, 4];
      default:
        return [];
    }
  }, [imageDownloadUrls?.length]);

  const getHeight = useMemo(() => {
    switch (imageDownloadUrls?.length) {
      case 1:
        return ['250px'];
      case 2:
        return ['150px', '100px'];
      case 3:
        return ['150px', '100px'];
      case 4:
        return ['125px', '125px'];
      case 5:
        return ['150px', '100px'];
      default:
        return [];
    }
  }, [imageDownloadUrls?.length]);

  const setting = useMemo(() => {
    return {
      width: '400px',
      height: getHeight,
      layout: getLayout,
      photos: imageDownloadUrls.map(item => ({source: item.url})),
      showNumOfRemainingPhotos: true
    }
  }, [getHeight, getLayout, imageDownloadUrls]);

  const handleCloseEditModal = useCallback(() => {
    setEditModalIsOpen(false);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.topContainer}>
        <ul className={styles.list}>
          <li className={styles.location}>{location?.name}</li>
        </ul>
        <div className={styles.dateContainer}>
          <p className={styles.location}>Date</p>
          <p className={styles.date}>{when}</p>
        </div>
      </div>

      <Rating disabled selectedStars={rate} />

      <div className={styles.mainContainer}>
        <div>
          {setting.photos.length > 0 && getLayout.length && getHeight.length ? (
            <ReactPhotoCollage {...setting} />
          ) : null}
        </div>

        <div className={styles.textContainer}>
          <p className={styles.text}>{tripName}</p>
          <p className={styles.text}>{text}</p>

          <div>
            <p>Places visited: </p>
            {travel?.geoTags?.map(tag => (
              <p
                onClick={() => navigate('/place/' + tag.placeID)}
                key={tag.placeID}
                className={styles.tag}
              >
                {tag.address}
              </p>
            ))}
          </div>

          <div className={styles.footer}>
            <div className={styles.shareContainer}>
              <img
                className={styles.commentsIcon}
                src={commentsIcon}
                alt="comments"
              />
              <span className={styles.comments}>{comments_count} Comments</span>
            </div>
            <div className={styles.shareContainer}>
              <img className={styles.shareIcon} src={shareIcon} alt="share" />
              <span className={styles.share}>Share</span>
            </div>
            {firestoreUser?.id === userId ? (
              <>
                <div className={styles.shareContainer} onClick={handleDeleteTrip}>
                  <img className={styles.dotsIcon} src={BinIcon} alt="dots"/>
                  <span className={styles.share}>Delete</span>
                </div>
                <div className={styles.shareContainer} onClick={() => setEditModalIsOpen(true)}>
                  <img className={styles.dotsIcon} src={Dots} alt="dots"/>
                  <span className={styles.share}>Edit</span>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <CustomModal isOpen={editModalIsOpen} onCloseModal={handleCloseEditModal}>
        <CreateTripModal
          closeModal={handleCloseEditModal}
          isEdit
          data={{
            description: text,
            rating: rate,
            locationName: location.name,
            isPublic: true,
            geoTags: travel.geoTags,
            when: when,
            imageUrls: imageDownloadUrls,
          }}
        />
      </CustomModal>
    </div>
  );
};

export default TravelCard;

import {ITravel} from "~/types/travel";
import {FC, useCallback, useContext, useEffect, useState} from "react";
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
import Pin from '@assets/icons/map-pin.svg';
import MediaContainer from "../MediaContainer/MediaContainer";

interface Props {
  travel: ITravel;
}

const TravelCard: FC<Props> = ({travel}) => {
  const {firestoreUser} = useContext(AuthContext);
  const [imageDownloadUrl, setImageDownloadUrl] = useState<string>('');
  const {
    location,
    when,
    rate,
    imageUrl,
    text,
    userId,
    comments_count,
    id,
  } = travel;

  const handleDeleteTrip = useCallback(async () => {
    try {
      await deleteDoc(doc(db, 'trips', id));
    } catch (err) {
      console.log('[ERROR deleting trip] => ', err);
    }
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const url = await getDownloadURL(ref(storage, imageUrl));
        // console.log('url:', url);
        setImageDownloadUrl(url);
      } catch (err) {
        console.log('[ERROR getting download url for the image] => ', err)
      }
    })();
  }, []);


  return (
    <div className={styles.container}>
      <div className={styles.topContainer}>
        <div className={styles.list}>
          <img src={Pin} alt="pin icon" className={styles.pinIcon}/>
          <p className={styles.location}>{location?.name}</p>
        </div>
        <div className={styles.dateContainer}>
          {/* <p className={styles.location}>Date</p> */}
          <p className={styles.date}>{when}</p>
        </div>
      </div>


      <div className={styles.mainContainer}>
        <div className={styles.imageContainer}>
          <MediaContainer mediaUrl={imageDownloadUrl}/>
          {/* {
            imageDownloadUrl.toLowerCase().includes('mp4') ? (
              <video src={imageDownloadUrl} controls></video>
            ) : (
              <img src={imageDownloadUrl} alt="Travel photo" className={styles.image} />
            )
          } */}

        </div>
        <div className={styles.textContainer}>
          <p className={styles.text}>{text}</p>
        </div>
      </div>
      <div className={styles.footer}>
        <Rating disabled selectedStars={rate} />

            <div className={styles.sharing}>
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
                <div className={styles.shareContainer} onClick={handleDeleteTrip}>
                  <img className={styles.dotsIcon} src={BinIcon} alt="dots" />
                  <span className={styles.share}>Delete</span>
                </div>
              ) : null}
              </div>
          </div>
    </div>
  );
};

export default TravelCard;

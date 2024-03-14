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
import Dots from '@assets/icons/dots.svg';
import CreateTripModal from "~/components/CreateTripModal";
import CustomModal from "~/components/CustomModal";
import { Marker } from "~/assets/icons/map/Marker";
import { ReactPhotoCollage } from "react-photo-collage";
import { LightBox } from "../Lightbox/LightBox";


interface Props {
  travel: ITravel;
}

const TravelCard: FC<Props> = ({travel}) => {
  const {firestoreUser, updateFirestoreUser} = useContext(AuthContext);
  const [imageDownloadUrls, setImageDownloadUrls] = useState<{url: string; type: string, description: string}[]>([]);
  const {
    location,
    startDate,
    endDate,
    rate,
    imageUrl,
    text,
    userId,
    comments_count,
    tripName,
    dayDescription,
    cities,
    id,
  } = travel;
  const navigate = useNavigate();
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // const handleOpenImage = useCallback((URL: string) => {
  //   // window.open(URL, '_blank');
  // }, []);

  // console.log(imageDownloadUrls);

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
          downloadedUrls.push({url, type: imageUrl[i].type, description: imageUrl[i].description});
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
          <p className={styles.location}>{location?.name.slice(0, 50)}{location.name.length > 50 && '...'}</p>
        <Rating disabled selectedStars={rate} />
        <div className={styles.dateContainer}>
          {/* <p className={styles.location}>Date</p> */}
          <p className={styles.date}>{startDate} - {endDate}</p>
        </div>
      </div>



      <div className={styles.mainContainer}>
        <div className={styles.gallery}>
          {/* {setting.photos.length > 0 && getLayout.length && getHeight.length ? (
            <ReactPhotoCollage {...setting}/>
          ) : null} */}

          {
            imageDownloadUrls.map((image, index) => {
              if (image.type === 'image/jpeg') {
                return (
                  <img
                    key={index}
                    src={image.url}
                    alt="travel"
                    className={styles.image}
                    onClick={() => {
                      setSelectedImage(image);
                      setIsPhotosModalOpen(true);
                    }}
                  />
                )
              } else if(image.type === 'video/mp4') {
                return (
                  <video
                    key={index}
                    src={image.url}
                    className={styles.image}
                    controls
                    onClick={() => {
                      setSelectedImage(image);
                      setIsPhotosModalOpen(true);
                    }}
                    // onClick={() => setIsPhotosModalOpen(true)}
                  />
                )
              }
              })
          }
        </div>

        <div className={styles.textContainer}>
          <h3 className={styles.tripName}>{tripName}</h3>

         
          <p className={styles.text}>{text}</p>


          <div className={styles.daysDescriptionContainer}>
          {
            dayDescription && dayDescription.map((day, index) => (
              <div key={`day_${index}`} className={styles.dayDescription}>
                <p className={styles.date}>{day.date}</p>
                <p>{day.description}</p>
              </div>
            ))
          }
          </div>

          <div className={styles.visitedContainer}>
          <div>
              <p className={styles.text}>Places: </p>
              <div className={styles.tagsContainer}>
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
                
            </div>

            {
              cities && (
                <div>
                  <p className={styles.text}>Cities: </p>
                  <div className={styles.tagsContainer}>
                  {travel?.cities?.map(tag => (
                    <p
                      onClick={() => navigate('/place/' + tag.placeID)}
                      key={tag.placeID}
                      className={styles.tag}
                    >
                      {tag.address}
                    </p>
                  ))}
                </div>
              </div>
              )
            }
          </div>
          

          
        </div>
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

      <CustomModal isOpen={editModalIsOpen} onCloseModal={handleCloseEditModal}>
        <CreateTripModal
          closeModal={handleCloseEditModal}
          isEdit
          data={{
            imageUrl: travel.imageUrl,
            rate: travel.rate,
            startDate: startDate,
            endDate: endDate,
            public: travel.public,
            geoTags: travel.geoTags,
            cities: travel.cities,
            tripName: tripName,
            location: travel.location,
            dayDescription: travel.dayDescription,
            text: travel.text,
          }}
        />
      </CustomModal>

      <LightBox 
        isOpen={isPhotosModalOpen} 
        onCloseModal={() => setIsPhotosModalOpen(false)} 
        selectedImage={selectedImage} 
        onChangeSelectedPhoto={setSelectedImage} 
        images={imageDownloadUrls}
      />
    </div>
  );
};

export default TravelCard;

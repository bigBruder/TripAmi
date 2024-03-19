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
import { LightBox } from "../Lightbox/LightBox";
import {EmailIcon, EmailShareButton, TelegramIcon, TelegramShareButton, WhatsappIcon, WhatsappShareButton} from "react-share";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Done from '@assets/icons/done.svg';

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
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [isModalShareOpen, setIsModalShareOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);


  const handleDeleteTrip = useCallback(async () => {
    try {
      await deleteDoc(doc(db, 'trips', id));

      updateFirestoreUser({
        tripCount: firestoreUser?.tripCount ? firestoreUser?.tripCount - 1 : 0,
      });
    } catch (err) {
      console.log('[ERROR deleting trip] => ', err);
    }
  }, [firestoreUser?.tripCount, id, updateFirestoreUser]);

  useEffect(() => {
    (async () => {
      try {
        const downloadedUrls = [];

        for (let i = 0; i < imageUrl.length; i++) {
          let url;
          if (imageUrl[i].url.includes('htttp://firebasestorage.googleapis.com')) {
            url = imageUrl[i].url;
          } else {
            url = await getDownloadURL(ref(storage, imageUrl[i].url));
          }
          downloadedUrls.push({url, type: imageUrl[i].type, description: imageUrl[i].description});
        }

        setImageDownloadUrls(downloadedUrls);
      } catch (err) {
        console.log('[ERROR getting download url for the image] => ', err)
      }
    })();
  }, [imageUrl]);

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
          {/* <p className={styles.location}>{location?.name.slice(0, 50)}{location.name.length > 50 && '...'}</p> */}
          <p className={styles.location}>{location.name.toString()}</p>
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
          <p className={styles.text} style={{wordBreak: "break-all"}}>{text}</p>
          <div className={styles.daysDescriptionContainer}>
          {
            dayDescription && dayDescription.map((day, index) => (
              <div key={`day_${index}`} className={styles.dayDescription}>
                <p className={styles.date}>{day.date}</p>
                <p className={styles.additionalText}>{day.description}</p>
              </div>
            ))
          }
          </div>

          <div className={styles.visitedContainer}>
          
          {
              cities && cities?.length > 0 && (
                <div>
                  <p className={styles.mark}>Cities: </p>
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

          <div>
            {
              travel.geoTags && travel.geoTags.length > 0 && (
                <>
                <p className={styles.mark}>Places: </p>
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
                </>
              )
            }  
          </div>


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
              <span className={styles.comments} onClick={() => navigate('/trip/' + id)}>{comments_count} Comments</span>
            </div>
            <div className={styles.shareContainer} onClick={() => setIsModalShareOpen(true)}>
              <img className={styles.shareIcon} src={shareIcon} alt="share" />
              <span className={styles.share}>Share</span>
                  {/* <div className="Demo__some-network">
                    <WhatsappShareButton
                      url={'test url'}
                      title={'Check out this trip'}
                      separator=":: "
                      className="Demo__some-network__share-button"
                    >
                      <WhatsappIcon size={20} round />
                    </WhatsappShareButton>
                  </div> */}
            </div>
            {firestoreUser?.id === userId ? (
              <>
                <div className={styles.shareContainer} onClick={() => setIsModalDeleteOpen(true)}>
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

      <CustomModal isOpen={isModalShareOpen} onCloseModal={() => {
        setIsModalShareOpen(false);
        setIsCopied(false)}}
      >
        <div className={styles.shareModalContainer}>
          <h3 className={styles.title}>Share with your friends</h3>
          <div className={styles.shareButtonsContainer}>
            <WhatsappShareButton
              url={'https://tripamicities.netlify.app/oilslNyzo62jvdQNJUh0'}
              title={'Check out this trip'}
              separator=":: "
              className="Demo__some-network__share-button"
            >
              <WhatsappIcon className={styles.socialIcon} round />
            </WhatsappShareButton>
            <TelegramShareButton
              url={'https://tripamicities.netlify.app/oilslNyzo62jvdQNJUh0'}
              title={'Check out this trip'}
              className="Demo__some-network__share-button"
            >
              <TelegramIcon className={styles.socialIcon} round />
            </TelegramShareButton>
            <EmailShareButton
              url={'https://tripamicities.netlify.app/oilslNyzo62jvdQNJUh0'}
              subject={'Check out this trip'}
              body="body"
              className="Demo__some-network__share-button"
            >
              <EmailIcon className={styles.socialIcon} round />
            </EmailShareButton>
            
          </div>
          <CopyToClipboard text={'https://tripamicities.netlify.app/oilslNyzo62jvdQNJUh0'}
          >
            <div className={`${styles.linkContainer} ${isCopied ? styles.copiedActive : ''}`} onClick={() => setIsCopied(true)}>
               <p className={styles.shareLink}>https://tripamicities.netlify.app/oilslNyzo62jvdQNJUh0</p>
            </div>
          </CopyToClipboard>
          {
              isCopied && (
              <div className={styles.doneContainer}>
                <p className={styles.copied}>Copied</p>
                <img src={Done} alt="done" />
              </div>
              )
               
          }
        </div>
      </CustomModal>

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
            isPublic: travel.public,
            geoTags: travel.geoTags,
            cities: travel.cities,
            tripName: tripName,
            location: travel.location,
            dayDescription: travel.dayDescription,
            text: travel.text,
          }}
        />
      </CustomModal>

      <CustomModal isOpen={isModalDeleteOpen} onCloseModal={() => setIsModalDeleteOpen(false)}>

        <div className={styles.deleteModalContainer}>

        <div className={styles.deleteModal}>
          <h3 className={styles.deleteModal_title}>Delete Trip</h3>
          <p>Are you sure to delete the trip?</p>
          <div className={styles.deleteControlContainer}>
            <button className={`${styles.buttonModal}, ${styles.buttonModal_delete}`} onClick={handleDeleteTrip}>Delete</button>
            <button className={`${styles.buttonModal}, ${styles.buttonModal_cancel}`} onClick={() => setIsModalDeleteOpen(false)}>Cancel</button>
          </div>
        </div>
          
        </div>
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

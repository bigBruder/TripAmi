import { doc, documentId, getDocs, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageTitle } from "~/components/PageTitle";
import Header from "~/components/profile/Header";
import { IComment } from "~/types/comments";
import { commentsCollection, tripsCollection, usersCollection } from "~/types/firestoreCollections";

import styles from "./trip.module.css";
import { BigPost } from "~/components/BigPost";
import { UserPostInfo } from "~/components/BigPost/UserPostInfo";
import { Swiper, SwiperSlide } from "swiper/react";
import { ITravel } from "~/types/travel";
import { IUser } from "~/types/user";
import { Pagination } from "swiper/modules";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "~/firebase";
import Rating from "~/components/Rating";
import { LightBox } from "~/components/Lightbox/LightBox";
import { CommentField } from "~/components/CommentField";
import {Comment} from "~/components/Comment";



export const Trip = () => {
  const {state} = useLocation();
  const [trip, setTrip] = useState<ITravel | null>(null);
  const [userData, setUserData] = useState<IUser | null>(null);
  const [imageUrls, setImageUrls] = useState<{
    url: string;
    type: string;
    description: string | undefined;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ 
    url: string; 
    type: string; 
    description: string | undefined;
  } | null>(null);
  const [comments, setComments] = useState<IComment[] | null>(null);
  const navigate = useNavigate();


  useEffect(() => {
    (async () => {
      const q = query(tripsCollection, where(documentId(), '==', state.postId),);
      const querySnapshot = await getDocs(q);
      const fetchedPost = querySnapshot.docs[0].data() as ITravel;
      setTrip(fetchedPost);
    })();
  }, [state.postId]);

  useEffect(() => {
    (async () => {
     if (trip?.userId) {
      try {
        setIsLoading(true);
        const q = query(usersCollection, where(documentId(), '==', trip.userId),);
        const querySnapshot = await getDocs(q);
        const fetchedUser = querySnapshot.docs[0].data() as IUser;

        setUserData(fetchedUser as IUser);
      } catch (error) {
        console.log('[ERROR getting user from firestore] => ', error);
      } finally {
        setIsLoading(false);
      }
     }
    })();
  }, [trip?.userId]);

  // const downloadedUrls: { url: string, type: string, description: string }[] = [];

  useEffect(() => {
    ( async () => {
      const downloadedUrls = [];

      if (trip?.imageUrl) {
        console.log(trip.imageUrl);
        for (let i = 0; i < trip.imageUrl.length; i++) {
          const url = await getDownloadURL(ref(storage, trip.imageUrl[i].url));
          downloadedUrls.push({ url, type: trip.imageUrl[i].type, description: trip.imageUrl[i].description });
        }

        setImageUrls(downloadedUrls);
      }
    })();
  }, [trip]);

  useEffect(() => {
    if (selectedImage) {
      setIsLightBoxOpen(true);
    }
  }, [selectedImage]);

  const handleSelectImage = (index: number) => {
    setSelectedImage(imageUrls[index]);
  };
  
  useEffect(() => {
    const q = query(
      commentsCollection,
      where('postId', '==', state.postId),
      orderBy('createdAt', 'desc'),
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedDocs = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      setComments(fetchedDocs as IComment[]);
    });

    return () => {
      unsubscribe();
    }
  }, [state.postId]);

  return (
    <div className={styles.mainContainer}>
        <Header />
        <div className={styles.main}>
          <PageTitle title={'Posts'} />
      
          <div className={styles.post}>
          <div className={styles.container}>
          {userData ? <UserPostInfo userData={userData} createdAt={trip?.endDate || ''} userPhotoUrl="" />  : null}
      
          <div className={styles.tripContainer}>
            <div className={styles.topContainer}>
              <div className={styles.swiperContainer}>
              <Swiper
                spaceBetween={0}
                slidesPerView={1}
                loop={true}
                style={{width: '100%', height: '100%', cursor: 'pointer'}}
                wrapperClass={styles.swiperWrapper}
                pagination={true}
                modules={[Pagination]}
              >
                {imageUrls?.map((image, idx) => (
                  <SwiperSlide 
                    key={image.url} 
                    style={{display: 'flex', justifyContent: 'center'}}
                    onClick={() => handleSelectImage(idx)}
                  >
                    {
                      image.type === 'video/mp4' ? (
                        <video src={image.url} className={styles.postIMage}/>
                      ) : (
                        <img src={image.url} className={styles.postIMage} onClick={() => setSelectedImage(imageUrls[idx])}/>
                      )
                    }
                  </SwiperSlide>
                ))}
              </Swiper>
              </div>
              <div className={styles.topRightContainer}>
                <h1 className={styles.title}>{trip?.tripName}</h1>
                <div className={styles.rateContainer}>
                  <p className={styles.location}>{trip?.location.name}</p>
                  <Rating rating={trip?.rate} />
                </div>
                <div className={styles.textContainer}>
                <p className={styles.postText}>{trip?.text}</p>
                  {/* <div className={styles.postActionsWrapper}>
                    <PostActions postData={post} />
                  </div> */}
                </div>
              </div>
            </div>

            {
                 trip?.dayDescription && trip.dayDescription.map((day, index) => (
                    <div key={index}>
                      <h2 className={styles.date}>{day.date}</h2>
                      <p className={styles.dayDescription}>{day.description}</p>
                    </div>
                  ))
                }
          </div>

          <div className={styles.visitedContainer}>
            <div>
                <p className={styles.text}>Places: </p>
                <div className={styles.tagsContainer}>
                  {trip?.geoTags?.map(tag => (
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
              trip?.cities && (
                <div>
                  <p className={styles.text}>Cities: </p>
                  <div className={styles.tagsContainer}>
                  {trip?.cities?.map(tag => (
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
              )}
          </div>
        </div>
      </div>

        <CommentField postId={state.postId} commentsCount={trip?.comments_count || 0} contentType='trip'/>
        {comments?.map(comment => <Comment key={comment.id} comment={comment} />)}

        </div>
        <LightBox 
          isOpen={isLightBoxOpen} 
          onCloseModal={() => setIsLightBoxOpen(false)} 
          selectedImage={selectedImage} 
          onChangeSelectedPhoto={setSelectedImage} 
          images={imageUrls}
        />
    </div>
  );
};
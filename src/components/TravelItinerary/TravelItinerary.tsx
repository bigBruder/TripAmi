import styles from './travelItinerary.module.css';
import {useContext, useEffect, useMemo, useState} from "react";
import {AuthContext} from "~/providers/authContext";
import {getDocs, onSnapshot, orderBy, query, where} from "@firebase/firestore";
import {postsCollection, tripsCollection} from "~/types/firestoreCollections";
import {ITravel} from "~/types/travel";
import TravelCard from "~/components/TravelCard/TravelCard";
import useTravelsContext from "~/components/TravelItinerary/store";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import PostItem from "~/components/Posts";
import {IPost} from "~/types/post";
import {firebaseErrors} from "~/constants/firebaseErrors";
import {useWindowDimensions} from "~/hooks/useWindowDimensions";

import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

export const TravelItinerary = () => {
  const {firestoreUser} = useContext(AuthContext);
  const {travels, setTravels} = useTravelsContext();
  const [suggestedPosts, setSuggestedPosts] = useState<IPost[] | null>(null);
  const [isSuggestedPostsLoading, setIsSuggestedPostsLoading] = useState(false);
  const {width} = useWindowDimensions();

  useEffect(() => {
    if (firestoreUser?.id) {
      const q = query(tripsCollection, where('userId', '==', firestoreUser?.id));
      const unsub = onSnapshot(q, (querySnapshot) => {
        const fetchedTravel = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        setTravels(fetchedTravel as ITravel[]);
      });

      (async () => {
        try {
          setIsSuggestedPostsLoading(true);
          const q = query(
            postsCollection,
            orderBy('userId'),
            where('userId', '!=', firestoreUser?.id),
            orderBy('createAt', 'desc'),
          );
          const querySnapshot = await getDocs(q);
          const fetchedPosts = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          }));

          setSuggestedPosts(fetchedPosts as IPost[]);
        } catch (err) {
          console.log(err);
          // @ts-ignore
          alert(firebaseErrors[err.code]);
        } finally {
          setIsSuggestedPostsLoading(false);
        }
      })();

      return () => {
        unsub();
      }
    }
  }, [firestoreUser?.id, ]);

  const getSlidesPerPage = useMemo(() => {
    if (width < 768) {
      return 1;
    } else if (width < 960) {
      return 2;
    } else {
      return 3;
    }
  }, [width]);


  return (
    <div className={styles.container}>
      <p className={styles.title}>{firestoreUser?.username}`s travels</p>
      {/* <div className={styles.travelsContainer}>
        {travels.map(travel => <TravelCard travel={travel} key={travel.id}/>)}
      </div> */}
      {/* <div className={styles.travelsContainer}></div> */}
      <div className={styles.travelsContainer}>
        <Swiper 
          spaceBetween={15} 
          slidesPerView={3}
          loop
          modules={[Autoplay]}
          watchOverflow
          autoplay={{
            delay: 2500
          }}
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 5
            },
            640: {
              slidesPerView: 1,
              spaceBetween: 10
            },
            768: {
              slidesPerView: 2
            },
            1200: {
              slidesPerView: 3
            },
          }}
        >
          {travels.map(travel => (
          <SwiperSlide key={travel.id}>
            <TravelCard travel={travel}/>
          </SwiperSlide> 
        ))}
        </Swiper>
      </div>
      
      {/*<p className={styles.title}>You may also like</p>*/}
      {/*<div className={styles.bottomSliderContainer}>*/}
      {/*  <Swiper*/}
      {/*    spaceBetween={30}*/}
      {/*    slidesPerView={getSlidesPerPage}*/}
      {/*  >*/}
      {/*    {suggestedPosts?.map(post => (*/}
      {/*      <SwiperSlide key={post.id}>*/}
      {/*        /!*<PostItem postData={post}/>*!/*/}
      {/*      </SwiperSlide>*/}
      {/*    ))}*/}
      {/*  </Swiper>*/}
      {/*</div>*/}
    </div>
  );
}

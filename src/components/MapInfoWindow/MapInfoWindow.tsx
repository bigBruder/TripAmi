import { InfoWindow } from "@vis.gl/react-google-maps";
import { FC, useCallback, useContext, useEffect, useState } from "react";
import { ITravel } from "~/types/travel"
import Rating from "../Rating";
import { IUser } from "~/types/user";
import defaultUserIcon from "@assets/icons/defaultUserIcon.svg";
import { getDownloadURL, ref } from "@firebase/storage";
import { storage } from "~/firebase";

import styles from './MapInfoWindow.module.css';

interface Props {
    selectedTravel: ITravel;
    travels: ITravel[];
    friends: IUser[];
    selectedUser: IUser;
    handleClose: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MapInfoWindow: FC<Props> = ({ selectedTravel, selectedUser, handleClose, travels, friends }) => {
    const { location } = selectedTravel;


    //   useEffect(() => {
    //     (async () => {
    //       if (firestoreUser?.firebaseUid) {
    //         try {
    //           const q = query(usersCollection, where('friends', 'array-contains', firestoreUser.id), limit(40));
    //         //   'friends', 'array-contains-any', firestoreUser.friends
    //           const querySnapshot = await getDocs(q);
    
    //           const fetchedUsers = querySnapshot.docs.map(doc => ({
    //             ...doc.data(),
    //             id: doc.id,
    //           }));

    //           console.log(q);
    
    //           setUsers(fetchedUsers as IUser[]);
    //         } catch (err) {
    //           // @ts-ignore
    //           alert(firebaseErrors[err.code]);
    //         }
    //       }
    //     })});
    // const [userAvatar, setUserAvatar] = useState(defaultUserIcon);
    const [userAvatars, setUserAvatars] = useState<any>([]);
    const [reviews, setReviews] = useState<ITravel[]>([])

//   const getUserImage = useCallback(async () => {
//     if (selectedUser?.avatarUrl !== null) {
//       const url = await getDownloadURL(ref(storage, selectedUser.avatarUrl));

//       setUserAvatar(url);
//     } else {
//         setUserAvatar(defaultUserIcon);
//     }
//   }, [selectedUser.avatarUrl]);

//   useEffect(() => {
//     getUserImage();
//   }, [getUserImage, selectedUser]);

    useEffect(() => {
            setReviews(travels.filter(travel => 
            travel.location.latitude === location.latitude 
            && travel.location.longitude === location.longitude
          ))
    }, [selectedTravel]);


  useEffect(() => {
    Promise.all(reviews.map(async review => {
        const user = friends.find(friend => friend.id === review.userId);
    
        if (user?.avatarUrl !== null) {
            return getDownloadURL(ref(storage, user?.avatarUrl));
          } else {
            return defaultUserIcon;
          }
      })).then(urls => {
          setUserAvatars(urls);
      });

      console.log('use effect');
}, [reviews]);
  
  console.log("render a windows");

  
  
    return (
        <InfoWindow 
            position={{lat: location.latitude, lng:location.longitude}} 
            onCloseClick={() => handleClose(false)}
        >
            <div className={styles.reviews}>
           {
            reviews.map((review, idx) => (
                <div className={styles.info} key={review.id}>
                    <div className={styles.top_container}>
                        <div className={styles.short_info}>
                            <img src={userAvatars[idx]} alt="avatar" className={styles.avatar}/>

                            <div className={styles.user_container}>
                                <p className={styles.user_name}>{
                                    friends.find(friend => friend.id === review.userId)?.username
                                }</p>
                                <p className={styles.location_name}>{review.location.name}</p>
                            </div>
                        </div>
                        <Rating disabled selectedStars={review.rate}/>
                    </div>
                    <div className={styles.bottom_container}>
                        <p className={styles.trip_comment}>{review.text}</p>
                    </div>
                </div>
            ))
            
           }
           </div>
            
        </InfoWindow>
    )
}
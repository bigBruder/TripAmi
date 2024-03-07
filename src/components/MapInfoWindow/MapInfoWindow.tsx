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
    selectedUser: IUser;
    handleClose: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MapInfoWindow: FC<Props> = ({selectedTravel, selectedUser, handleClose, travels}) => {
    const { location, rate, text } = selectedTravel;


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
    const [userAvatar, setUserAvatar] = useState(defaultUserIcon);
    const [locationFeedbacks, setLocationFeedbacks] = useState<ITravel[]>([]);

  const getUserImage = useCallback(async () => {
    if (selectedUser?.avatarUrl !== null) {
      const url = await getDownloadURL(ref(storage, selectedUser.avatarUrl));

      setUserAvatar(url);
    } else {
        setUserAvatar(defaultUserIcon);
    }
  }, [selectedUser.avatarUrl]);

  useEffect(() => {
    getUserImage();
  }, [getUserImage, selectedUser]);

  
    return (
        <InfoWindow 
            position={{lat: location.latitude, lng:location.longitude}} 
            onCloseClick={() => handleClose(false)}
        >
            
        </InfoWindow>
    )
}
import { useContext, useEffect, useState } from "react";
import {
  APIProvider,
  Map,
} from "@vis.gl/react-google-maps";
import useTravelsContext from "../TravelItinerary/store";
import { getDocs, onSnapshot, orderBy, query, where } from "@firebase/firestore";
import {tripsCollection, usersCollection} from "../../types/firestoreCollections";
import {AuthContext} from "../../providers/authContext";
import {ITravel} from "../../types/travel";
import { MapInfoWindow } from "../MapInfoWindow/MapInfoWindow";
import { IUser } from "~/types/user";
import MapOrange from '@assets/icons/MapOrange.svg';
import Build from '@assets/icons/build.svg';

import styles from './googleMaps.module.css';


export default function Intro() {
  const position = { lat: 53.54, lng: 10 };
  const [open, setOpen] = useState(false);
  const {travels, setTravels} = useTravelsContext();
  const [isFriendsLoading, setIsFriendsLoading] = useState(false);
  const {firestoreUser} = useContext(AuthContext);
  const [selectedTravel, setSelectedTravel] = useState<ITravel | null>(null);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [friends, setFriends] = useState<IUser[]>([]);
  const [{isMapOpen, isGeneralMapOpen, isFriendsMapOpen}, setIsOpen] = useState({
    isMapOpen: false,
    isGeneralMapOpen: false,
    isFriendsMapOpen: false
  })

  
  useEffect(() => {
    if (firestoreUser?.friends && firestoreUser?.friends?.length > 0) {
      const q = query(tripsCollection, where('userId', 'in', firestoreUser?.friends));
      const unsub = onSnapshot(q, (querySnapshot) => {
        const fetchedTravel = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        console.log(fetchedTravel);
        setTravels(fetchedTravel as ITravel[]);
      });
    }

  }, [firestoreUser?.friends, setTravels]);

  useEffect(() => {
  (async () => {
    try {
      setIsFriendsLoading(true);
      const q = query(
        usersCollection,
        where('id', 'in', travels.map(travel => travel.userId)),
      );
      const querySnapshot = await getDocs(q);
      const fetchedFriends = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));

      setFriends(fetchedFriends as IUser[]);
    } catch (err) {
      console.error(err);
      // @ts-ignore
      alert(firebaseErrors[err.code]);
    } finally {
      setIsFriendsLoading(false);
    }
  })();
}, [travels]);

  useEffect(() => {
    if (selectedTravel) {
      setSelectedUser(friends.find(friend => friend.id === selectedTravel?.userId) || null)
    }
  }, [friends, selectedTravel]);

  return (
  <div className={styles.container}>
    <div className={styles.titleContainer}>
    <p className={styles.title}>
      Build a travel itinerary 
      <img src={MapOrange} />
    </p>
    <p className={styles.title}>
      Build a travel itinerary based on other people's reviews
    </p>
  </div>
  <div className={styles.subtitle}>
    <p className={styles.title}>
      Build a route based on friend`s reviews
      <button onClick={() => setIsOpen(prevState => ({...prevState, isFriendsMapOpen: !isFriendsMapOpen}))}>
        <img 
          src={Build} 
          className={styles.button}
        />
      </button>
    </p>
  </div>

    {isFriendsMapOpen && (
      <APIProvider apiKey="AIzaSyCwDkMaHWXRpO7hY6z62_Gu8eLxMMItjT8">
        <div style={{ height: "450px", width: "100%" }}>

          <Map
            defaultZoom={5} 
            defaultCenter={position} 
            mapId="9bc3b1605395203e"
          >
            {/* {travels.length > 0 && (
              travels?.map(travel => {

                return (
                  <AdvancedMarker 
                    position={{lat: travel.location.latitude, lng:travel.location.longitude}}
                    onClick={() => {
                      setSelectedTravel(travel);
                      setOpen(true);
                    }}
                    key={travel.id}
                  >
                    <Pin
                      background={travel.location.color}
                      borderColor={"white"}
                      glyphColor={"white"}
                    />
                  </AdvancedMarker>
            )}))} */}

            {selectedTravel && open && selectedUser &&  (
              <MapInfoWindow 
                selectedTravel={selectedTravel} 
                selectedUser={selectedUser} 
                handleClose={setOpen}
                travels={travels}
                friends={friends}
              />
            )}
          </Map>
        </div>
    </APIProvider>
    )}
    
    </div>
  );
}
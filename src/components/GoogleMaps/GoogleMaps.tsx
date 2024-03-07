import { useContext, useEffect, useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import React from "react";
import useTravelsContext from "../TravelItinerary/store";
import { getDocs, onSnapshot, orderBy, query, where } from "@firebase/firestore";
import {postsCollection, tripsCollection, usersCollection} from "../../types/firestoreCollections";
import {IPost} from "../../types/post";
import {AuthContext} from "../../providers/authContext";
import {ITravel} from "../../types/travel";
import TravelCard from "../TravelCard/TravelCard";
import { MapInfoWindow } from "../MapInfoWindow/MapInfoWindow";
import { User } from "@firebase/auth";
import { IUser } from "~/types/user";


export default function Intro() {
  const position = { lat: 53.54, lng: 10 };
  const [open, setOpen] = useState(false);
  const {travels, setTravels} = useTravelsContext();
  const [isFriendsLoading, setIsFriendsLoading] = useState(false);
  const {firestoreUser} = useContext(AuthContext);
  const [selectedTravel, setSelectedTravel] = useState<ITravel | null>(null);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [friends, setFriends] = useState<IUser[]>([])
  
  useEffect(() => {
      const q = query(tripsCollection, where('userId', 'in', firestoreUser?.friends));
      const unsub = onSnapshot(q, (querySnapshot) => {
        const fetchedTravel = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        setTravels(fetchedTravel as ITravel[]);
      });
  }, []);

  useEffect(() => {
  (async () => {
    try {
      setIsFriendsLoading(true);
      const q = query(
        usersCollection,
        // orderBy('firebaseUid'),
        where('id', 'in', travels.map(travel => travel.userId)),
        // orderBy('createAt', 'desc'),
      );
      const querySnapshot = await getDocs(q);
      const fetchedFriends = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));

      setFriends(fetchedFriends as IUser[]);
      console.log( friends);
    } catch (err) {
      console.log(err);
      // @ts-ignore
      alert(firebaseErrors[err.code]);
    } finally {
      setIsFriendsLoading(false);
    }
  })();
}, [travels]);

  useEffect(() => {
    if (selectedTravel) {
      setSelectedUser(friends.find(friend => friend.id === selectedTravel?.userId))
    }
  }, [friends, selectedTravel]);

  console.log(friends.map(friend => friend.username));

  return (
    <APIProvider apiKey="AIzaSyCwDkMaHWXRpO7hY6z62_Gu8eLxMMItjT8">
      <div style={{ height: "100vh", width: "100%" }}>

        <Map 
          defaultZoom={5} 
          defaultCenter={position} 
          mapId="9bc3b1605395203e"
        >
          {travels.length > 0 && (
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
          )}))}

          {selectedTravel && open && selectedUser &&  (
            <MapInfoWindow 
              selectedTravel={selectedTravel} 
              travels={travels}
              selectedUser={selectedUser} 
              handleClose={setOpen} 
            />
          )}
        </Map>
      </div>
    </APIProvider>
  );
}
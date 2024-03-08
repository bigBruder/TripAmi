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
import {postsCollection, tripsCollection} from "../../types/firestoreCollections";
import {IPost} from "../../types/post";
import {AuthContext} from "../../providers/authContext";
import {ITravel} from "../../types/travel";
import TravelCard from "../TravelCard/TravelCard";


export default function Intro() {
  const position = { lat: 53.54, lng: 10 };
  const [open, setOpen] = useState(false);
  const {travels, setTravels} = useTravelsContext();
  const [isSuggestedPostsLoading, setIsSuggestedPostsLoading] = useState(false);
  const [suggestedPosts, setSuggestedPosts] = useState<IPost[] | null>(null);
  const {firestoreUser} = useContext(AuthContext);
  const [selectedTravel, setSelectedTravel] = useState<ITravel | null>(null);
  

  useEffect(() => {
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
  }, [firestoreUser?.id, ]);



  // console.log(travels);
  // console.log(typeof (travels[0].location.latitude));

  return (
    <APIProvider apiKey="AIzaSyCwDkMaHWXRpO7hY6z62_Gu8eLxMMItjT8">
      <div style={{ height: "100vh", width: "100%" }}>

        <Map defaultZoom={5} defaultCenter={position} mapId="9bc3b1605395203e">
          {
          travels.length > 0 && (
            travels?.map(travel => {
              console.log(travel.id);
              
              return (
              <AdvancedMarker 
                position={{lat: travel.location.latitude, lng:travel.location.longitude}}
                onClick={() => {
                  setSelectedTravel(travel);
                  setOpen(true);
                } 
              }
                key={travel.id}
              >
                <Pin
                  background={"grey"}
                  borderColor={"green"}
                  glyphColor={"purple"}
                />
              </AdvancedMarker>
          )
            }
          
           
           ))
          }
          {/* <AdvancedMarker position={position} onClick={() => setOpen(true)}>
            <Pin
              background={"grey"}
              borderColor={"green"}
              glyphColor={"purple"}
            />
          </AdvancedMarker> */}

          {selectedTravel && open && (
            <InfoWindow position={{lat: selectedTravel.location.latitude, lng:selectedTravel.location.longitude}} onCloseClick={() => setOpen(false)}>
              <TravelCard travel={selectedTravel}/>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}
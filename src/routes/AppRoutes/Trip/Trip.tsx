import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
// import ReactQuill from 'react-quill';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import cn from 'classnames';
import { format, isValid } from 'date-fns';
import { enUS } from 'date-fns/locale';
import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { FormattedDate } from 'rsuite/esm/CustomProvider';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import { v4 as uuidv4 } from 'uuid';
import { UserPostInfo } from '~/components/BigPost/UserPostInfo';
import { Comment } from '~/components/Comment';
import { CommentField } from '~/components/CommentField';
import Footer from '~/components/Footer';
import HeaderNew from '~/components/HeaderNew';
import ItineraryModal from '~/components/ItineraryModal';
import { LightBox } from '~/components/Lightbox/LightBox';
import PhotoModal from '~/components/PhotoModal';
import Rating from '~/components/Rating';
import ShareModal from '~/components/ShareModal/ShareModal';
import SwiperDialyTrip from '~/components/SwiperDialyTrip';
import SwiperTrip from '~/components/SwiperTrip';
import Tooltip from '~/components/Tooltip';
import TravelCard from '~/components/TravelCard/TravelCard';
import { db, storage } from '~/firebase';
import { AuthContext } from '~/providers/authContext';
import { IComment } from '~/types/comments';
import { commentsCollection, tripsCollection, usersCollection } from '~/types/firestoreCollections';
import { ITravel } from '~/types/travel';
import { IUser } from '~/types/user';
import { timeAgo } from '~/utils/daysAgo';

import budget_icon from '@assets/icons/budget-icon.svg';
import date_calendar from '@assets/icons/date_calendar.svg';
import defaultUserIcon from '@assets/icons/defaultUserIcon.svg';
import geo_filled from '@assets/icons/geo_filled.svg';
import hashtag_icon_filled from '@assets/icons/hashtag_icon_filled.svg';
import itinerary from '@assets/icons/itinenary.svg';
import people from '@assets/icons/people.svg';
import place_filled from '@assets/icons/place_filled.svg';
import saveTrip from '@assets/icons/saveTrip.svg';
import shareTrip from '@assets/icons/shareTrip.svg';
import tripSaved from '@assets/icons/tripSaved.svg';

import styles from './trip.module.css';

export const Trip = () => {
  const { id } = useParams();
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [photoForModal, setPhotoForModal] = useState('');
  const [trip, setTrip] = useState<ITravel | null>(null);
  const [userData, setUserData] = useState<IUser | null>(null);
  const { firestoreUser } = useContext(AuthContext);
  const [isItinerary, setIsItinerary] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState({});

  const toggleModal = () => {
    if (!isItinerary) {
      setIsItinerary(!isItinerary);
      document.body.style.overflow = 'hidden';
    } else {
      setIsItinerary(!isItinerary);
      document.body.style.overflow = 'auto';
    }
  };

  const [imageUrls, setImageUrls] = useState<
    {
      url: string;
      type: string;
      description: string | undefined;
    }[]
  >([]);
  const [selectedDayTrip, setSelectedDayTrip] = useState<
    { date: string; description: string } | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    type: string;
    description: string | undefined;
  } | null>(null);
  const [comments, setComments] = useState<IComment[] | null>(null);
  const [avatar, setAvatar] = useState<string>(defaultUserIcon);
  const [posted, setPosted] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date(trip?.dayDescription[0].date) || new Date()
  );
  const [selectedDayImages, setSelectedDayImages] = useState([]);
  const [isModalShareOpen, setIsModalShareOpen] = useState(false);
  const [inFavourites, setInFavourites] = useState(false);
  const [suggestedTrips, setSuggestedTrips] = useState<ITravel[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (trip) {
      setSelectedDate(new Date(trip.dayDescription[0].date));
    }
  }, [trip]);

  useEffect(() => {
    const fetchTrips = async () => {
      if (firestoreUser?.id) {
        const qu = query(tripsCollection, where('userId', '==', trip?.userId), limit(10));

        const unsubscribe = onSnapshot(qu, (querySnapshot) => {
          const fetchedTrips = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setSuggestedTrips(fetchedTrips);
        });

        return () => unsubscribe();
      }
    };

    fetchTrips();
  }, [firestoreUser?.id, trip?.userId]);

  useEffect(() => {
    if (trip && firestoreUser) {
      setInFavourites(trip.usersSaved?.includes(firestoreUser.id));
    }
  }, [trip, firestoreUser]);

  useEffect(() => {
    const fetchAvatar = async () => {
      if (firestoreUser && firestoreUser.avatarUrl) {
        try {
          const url = await getDownloadURL(ref(storage, firestoreUser.avatarUrl));
          setAvatar(url);
        } catch (error) {
          console.error('Error fetching avatar URL:', error);
        }
      }
    };

    fetchAvatar();
  }, [firestoreUser, storage]);

  useEffect(() => {
    if (trip && trip.imageUrl && trip.imageUrl.length > 0) {
      let imageForBackground;
      if (trip.imageUrl[0].type.includes('video')) {
        const findImage = trip.imageUrl.find((image) => image.type.includes('image'));
        if (findImage) {
          imageForBackground = findImage.url;
        } else {
          imageForBackground = '/defaultTripBackground.jpeg';
        }
      } else {
        imageForBackground = trip.imageUrl[0].url;
      }
      const imageRef = ref(storage, imageForBackground);
      getDownloadURL(imageRef)
        .then((url) => {
          const mainContainer = document.querySelector('.mainContainer') as HTMLElement;
          if (mainContainer) {
            mainContainer.style.backgroundImage = `url(${url})`;
            mainContainer.style.backgroundRepeat = 'no-repeat';
            mainContainer.style.backgroundPosition = 'center';
            mainContainer.style.backgroundSize = 'cover';
            mainContainer.style.height = '1300px';
            mainContainer.style.paddingInline = '20px';
            mainContainer.style.display = 'flex';
            mainContainer.style.flexDirection = 'column';
          }
        })
        .catch((error) => {
          const mainContainer = document.querySelector('.mainContainer') as HTMLElement;
          if (mainContainer) {
            mainContainer.style.backgroundImage = `url(/defaultTripBackground.jpeg)`;
            mainContainer.style.backgroundRepeat = 'no-repeat';
            mainContainer.style.backgroundPosition = 'center';
            mainContainer.style.backgroundSize = 'cover';
            mainContainer.style.height = '1300px';
            mainContainer.style.paddingInline = '20px';
            mainContainer.style.display = 'flex';
            mainContainer.style.flexDirection = 'column';
          }
        });
    } else {
      const mainContainer = document.querySelector('.mainContainer') as HTMLElement;
      if (mainContainer) {
        mainContainer.style.backgroundImage = `url(/defaultTripBackground.jpeg)`;
        mainContainer.style.backgroundRepeat = 'no-repeat';
        mainContainer.style.backgroundPosition = 'top';
        mainContainer.style.backgroundSize = 'cover';
        mainContainer.style.height = '1300px';
        mainContainer.style.paddingInline = '20px';
        mainContainer.style.display = 'flex';
        mainContainer.style.flexDirection = 'column';
      }
    }
  }, [trip]);

  useEffect(() => {
    const fetchTrip = async () => {
      if (id) {
        try {
          const docRef = doc(db, 'trips', id);
          const docSnapshot = await getDoc(docRef);

          if (docSnapshot.exists()) {
            setTrip(docSnapshot.data());
            console.log('trip', docSnapshot.data());
          } else {
            console.error('document not found');
            setTrip(null);
          }
        } catch (error) {
          console.error('error update document', error);
        }
      }
    };

    fetchTrip();
  }, [id, db]);

  useEffect(() => {
    (async () => {
      const selectedDay = trip?.dayDescription.find(
        (day) => formatedDate(new Date(day.date)) === formatedDate(selectedDate)
      );
      setSelectedDayTrip(selectedDay);
    })();
  }),
    [selectedDate];

  useEffect(() => {
    (async () => {
      const selectedDayPhotos = [];
      if (trip?.dayDescription) {
        for (const day of trip.dayDescription) {
          if (formatedDate(new Date(day.date)) === formatedDate(selectedDate)) {
            if (Array.isArray(day.photos) && day.photos.length > 0) {
              for (let i = 0; i < day.photos.length; i++) {
                const url = await getDownloadURL(ref(storage, day.photos[i].url));
                selectedDayPhotos.push({
                  url,
                  id: uuidv4(),
                  type: day.photos[i].type,
                });
              }
            }
          }
        }
      }
      setSelectedDayImages(selectedDayPhotos);
    })();
  }, [selectedDate, trip, setSelectedDayImages]);

  useEffect(() => {
    (async () => {
      if (trip?.userId) {
        try {
          setIsLoading(true);
          const q = query(usersCollection, where(documentId(), '==', trip.userId));
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

  useEffect(() => {
    (async () => {
      const downloadedUrls = [];

      if (trip?.imageUrl) {
        for (let i = 0; i < trip.imageUrl.length; i++) {
          const url = await getDownloadURL(ref(storage, trip.imageUrl[i].url));
          downloadedUrls.push({
            url,
            type: trip.imageUrl[i].type,
            description: trip.imageUrl[i].description,
          });
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
    const q = query(commentsCollection, where('postId', '==', id), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedDocs = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setComments(fetchedDocs as IComment[]);
    });

    return () => {
      unsubscribe();
    };
  }, [id]);

  function formatedDate(date: Date) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const formattedDate = `${day}-${month}-${year}`;

    return formattedDate;
  }

  const handleDateClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, date: Date) => {
    event.preventDefault();
    setSelectedDate(date);
  };

  const handleFavouriteClick = useCallback(async () => {
    if (trip && firestoreUser && id) {
      const docRef = doc(db, 'trips', id);
      const userId = firestoreUser.id;

      if (trip.usersSaved?.includes(userId)) {
        await updateDoc(docRef, {
          usersSaved: trip.usersSaved.filter((user) => user !== userId),
        });
        setInFavourites(false);
      } else {
        await updateDoc(docRef, {
          usersSaved: trip.usersSaved ? [...trip.usersSaved, userId] : [userId],
        });
        setInFavourites(true);
      }
    }
  }, [firestoreUser, trip, id, db]);

  const smallWindow = window.innerWidth < 800;
  const geoSwiperRef = useRef<SwiperRef>(null);

  const handlePrevGeo = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | null) => {
    if (!geoSwiperRef.current || !event) {
      return;
    }
    event.preventDefault();
    geoSwiperRef.current.swiper.slidePrev();
  };

  const handleNextGeo = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | null) => {
    if (!geoSwiperRef.current || !event) {
      return;
    }
    event.preventDefault();
    geoSwiperRef.current.swiper.slideNext();
  };

  const sliderRef = useRef<SwiperRef>(null);

  const handlePrev = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | null) => {
    if (!sliderRef.current || !event) {
      return;
    }
    event.preventDefault();
    sliderRef.current.swiper.slidePrev();
  };

  const handleNext = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | null) => {
    if (!sliderRef.current || !event) {
      return;
    }
    event.preventDefault();
    sliderRef.current.swiper.slideNext();
  };

  const [width, setWidth] = useState('80%');

  const updateWidth = () => {
    if (window.innerWidth >= 1420) {
      setWidth('90%');
    } else if (window.innerWidth >= 860) {
      setWidth('85%');
    } else {
      setWidth('75%');
    }
  };

  useEffect(() => {
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const formattedText = trip?.text.replace(/(<br \/>){3,}/g, '<br /><br />');

  const formatDescription = (description: string) => {
    return description.replace(/(<br \/>){3,}/g, '<br /><br />');
  };

  const itineraryHandle = async () => {
    if (!firestoreUser?.itinerary) {
      try {
        await updateDoc(doc(db, 'users', firestoreUser?.id), {
          itinerary: [],
        });
      } catch (e) {
        console.error(e);
        console.log('Error updating document: ', e);
      }
    }
  };

  const [hoveredGeoTagId, setHoveredGeoTagId] = useState('');

  const showTooltip = (placeID: string) => setHoveredGeoTagId(placeID);
  const hideTooltip = () => setHoveredGeoTagId('');

  return (
    <div className={`${styles.mainContainer}, mainContainer`}>
      <HeaderNew avatar={avatar} />
      <div className={styles.main}>
        <div className={styles.post}>
          <div className={styles.container}>
            {smallWindow && <h1 className={styles.title}>{trip?.tripName}</h1>}
            {smallWindow && (
              <div className={styles.timeContainer}>
                <div>{trip ? `Posted: ${timeAgo(trip.createdAt)}` : ''}</div>
              </div>
            )}
            <div className={styles.headerTrip}>
              {userData && (
                <UserPostInfo
                  userData={userData}
                  userPhotoUrl=''
                  isMasterPage={true}
                  setPosted={setPosted}
                />
              )}
              {!smallWindow && <h1 className={styles.title}>{trip?.tripName}</h1>}
              <div className={styles.social}>
                {/* <div className={styles.followButton}>Follow</div> */}
                <img
                  src={shareTrip}
                  alt='shareTrip'
                  className={styles.socialIcon}
                  onClick={() => setIsModalShareOpen(true)}
                />
                {firestoreUser?.id !== trip?.userId ? (
                  <img
                    src={inFavourites ? tripSaved : saveTrip}
                    alt='saveTrip'
                    className={styles.socialIcon}
                    onClick={handleFavouriteClick}
                  />
                ) : (
                  <button
                    className={styles.editButton}
                    onClick={() => {
                      navigate('/trip/create', { state: { data: trip, isEdit: true, id: id } });
                      window.scrollTo(0, 0);
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
            {!smallWindow && (
              <div className={styles.timeContainer}>
                <div>{trip ? `Posted: ${timeAgo(trip.createdAt)}` : ''}</div>
              </div>
            )}
            <div className={styles.tripContainer}>
              <SwiperTrip
                file={imageUrls}
                handleSelectImage={handleSelectImage}
                setIsPhotoOpen={setIsPhotoOpen}
                setPhotoForModal={setPhotoForModal}
              />
              <h2 className={styles.tripOverview}>Trip Overview</h2>
              <div className={styles.topRightContainer}>
                <p className={styles.journey}>{trip?.stage} journey</p>
                <div className={styles.dateContainerDate}>
                  <img src={date_calendar} alt='date_calendar' />
                  <p className={styles.date}>
                    {trip?.startDate}-{trip?.endDate}
                  </p>
                </div>
                <div className={styles.dateContainerPeople}>
                  <img src={people} alt='people' />
                  <p className={styles.date}>{trip?.people || 'Not defined'}</p>
                </div>
                <div className={styles.dateContainerBudget}>
                  <img src={budget_icon} alt='people' />
                  <p className={styles.date}>{trip?.budget || 'Not defined'}</p>
                </div>
                <div className={styles.rateContainer}>
                  <Rating selectedStars={trip?.rate || 1} />
                </div>
              </div>
              <div className={styles.textContainer}>
                <div className={styles.postText}>
                  {formattedText?.split('<br />').map((line, index, array) => (
                    <React.Fragment key={index}>
                      {line}
                      {index < array.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                {/* <div className={styles.postActionsWrapper}>
                    <PostActions postData={post} />
                  </div> */}
              </div>
              <div className={styles.hashtags}>
                {trip?.hashtags.map((item) => (
                  <div key={item} className={styles.hashtagsContainer}>
                    <img
                      src={hashtag_icon_filled}
                      alt='hashtagIcon'
                      className={styles.hashtagIconRender}
                    />
                    <p key={item} className={styles.hashtag}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {trip?.geoTags.length ? (
              <>
                <h2 className={styles.tripOverview}>Visited places</h2>
                <div className={styles.geoTagSwiperContainer}>
                  <>
                    <Swiper
                      ref={geoSwiperRef}
                      spaceBetween={10}
                      modules={[Navigation]}
                      breakpoints={{
                        320: {
                          slidesPerView: 1,
                        },
                        860: {
                          slidesPerView: 2,
                        },
                        1420: {
                          slidesPerView: 3,
                        },
                      }}
                      style={{
                        margin: '0',
                        width: width,
                        alignSelf: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {trip.geoTags.map((geoTag) => (
                        <SwiperSlide
                          key={geoTag.placeID}
                          style={{
                            margin: '0',
                            display: 'flex',
                            alignSelf: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <div className={styles.geoTagContainerWithImage}>
                            <div className={styles.geoPhotoContainer}>
                              <img
                                src={geoTag.photo || '/photoNotFound.jpg'}
                                alt=''
                                className={styles.geoPhoto}
                              />
                            </div>
                            <div
                              className={cn(styles.geoTagContainer, styles.geoTagContainerSwipe)}
                            >
                              <img
                                src={place_filled}
                                alt='geoTagImage'
                                onClick={() => {
                                  navigate('/place/' + geoTag.placeID);
                                  window.scrollTo(0, 0);
                                }}
                                className={styles.geoTagImage}
                              />
                              <p
                                className={styles.geotagTitle}
                                onClick={() => {
                                  navigate('/place/' + geoTag.placeID);
                                  window.scrollTo(0, 0);
                                }}
                              >
                                {geoTag.address.split(',')[0]}
                              </p>
                              <div
                                className={styles.tooltipContainer}
                                onMouseEnter={() => showTooltip(geoTag.placeID)}
                                onMouseLeave={hideTooltip}
                              >
                                <img
                                  src={itinerary}
                                  alt='itinerary'
                                  onClick={() => {
                                    itineraryHandle();
                                    toggleModal();
                                    setSelectedItinerary(geoTag);
                                  }}
                                  className={styles.geoTagImage}
                                />
                                {hoveredGeoTagId === geoTag.placeID && (
                                  <Tooltip text='Add to my itinerary for a future trip' />
                                )}
                              </div>
                            </div>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    <div className={styles.arrowButtonsContainerGeo}>
                      <div className={styles.arrowButtonGeo} onClick={handlePrevGeo}>
                        &lt;
                      </div>
                      <div className={styles.arrowButtonGeo} onClick={handleNextGeo}>
                        &gt;
                      </div>
                    </div>
                  </>
                </div>
              </>
            ) : null}

            <h2 className={styles.tripOverview}>Daily journal</h2>
            {trip?.isPrivatJournal && firestoreUser?.id !== trip?.userId ? (
              <p className={styles.privateJournal}>This journal is private</p>
            ) : (
              <>
                <div className={styles.dateButtonsContainer}>
                  <Swiper
                    spaceBetween={20}
                    modules={[Navigation]}
                    ref={sliderRef}
                    className={styles.dateButtonsContainer}
                    style={{
                      margin: '0',
                      width: width,
                      alignSelf: 'center',
                      justifyContent: 'center',
                    }}
                    breakpoints={{
                      480: {
                        slidesPerView: 1,
                      },
                      650: {
                        slidesPerView: 2,
                      },
                      860: {
                        slidesPerView: 2,
                      },
                      1040: {
                        slidesPerView: 4,
                      },
                      1420: {
                        slidesPerView: 6,
                      },
                    }}
                  >
                    {trip?.dayDescription.map((journal) => {
                      const { date } = journal;
                      const isDateFilled =
                        journal.photos.length > 0 ||
                        journal.place.length > 0 ||
                        journal.description;
                      const parsedDate = new Date(date);
                      return (
                        <SwiperSlide
                          key={parsedDate.toDateString()}
                          style={{ justifyContent: 'center', display: 'flex' }}
                        >
                          <button
                            onClick={(e) => handleDateClick(e, parsedDate)}
                            className={cn(styles.buttonCustom, {
                              [styles.selected]:
                                formatedDate(selectedDate) === formatedDate(new Date(date)),
                              [styles.dateFilled]: isDateFilled,
                            })}
                          >
                            {isValid(parsedDate)
                              ? format(parsedDate, 'EEEE, MMM. do', { locale: enUS })
                              : 'Invalid Date'}
                          </button>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                  <div className={styles.arrowButtonsContainerGeo}>
                    <div className={styles.arrowButtonGeo} onClick={handlePrev}>
                      &lt;
                    </div>
                    <div className={styles.arrowButtonGeo} onClick={handleNext}>
                      &gt;
                    </div>
                  </div>
                </div>
                <div className={styles.dayContainer}>
                  {selectedDayImages.length > 0 && (
                    <SwiperDialyTrip
                      file={selectedDayImages}
                      setIsPhotoOpen={setIsPhotoOpen}
                      setPhotoForModal={setPhotoForModal}
                    />
                  )}
                  <div className={styles.dayInfoContainer}>
                    {(!!selectedDayTrip?.description.length || !!selectedDayTrip?.place.length) && (
                      <h2 className={styles.tripOverview} style={{ marginTop: '0' }}>
                        Day Overview
                      </h2>
                    )}
                    {selectedDayTrip?.description.length ? (
                      <>
                        <div className={styles.dayDescriptionJournal}>
                          {formatDescription(selectedDayTrip?.description)
                            .split('<br />')
                            .map((line, index, array) => (
                              <React.Fragment key={index}>
                                {line}
                                {index < array.length - 1 && <br />}
                              </React.Fragment>
                            ))}
                        </div>
                      </>
                    ) : null}
                    {selectedDayTrip?.place.length ? (
                      <div className={styles.selectedTagsContainer}>
                        {selectedDayTrip.place.map((geoTag) => (
                          <div className={styles.geoTagContainer} key={geoTag.placeID}>
                            <img src={geo_filled} alt='geo_filled' />
                            <div
                              onClick={() => {
                                navigate('/place/' + geoTag.placeID);
                                window.scrollTo(0, 0);
                              }}
                              className={styles.geotagTitle}
                            >
                              {geoTag.address}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: '#F8F7F1',
            zIndex: '-1',
          }}
        ></div>
        {id && comments && (
          <div className={styles.containerComments}>
            <h2 className={styles.commentsTitle}>Comments</h2>
            <div className={styles.commentsMap}>
              {comments?.map((comment) => (
                <Comment key={comment.id} comment={comment} contentType='trip' />
              ))}
            </div>
            <CommentField
              postId={id}
              commentsCount={trip?.comments_count || 0}
              contentType='trip'
              postOwnerId={trip?.userId || ''}
            />
          </div>
        )}

        {suggestedTrips.length > 0 && firestoreUser?.id !== trip?.userId && (
          <div className={styles.suggestedTripContainer} style={{ marginBottom: '40px' }}>
            <h2 className={styles.title} style={{ marginBottom: '40px' }}>
              Related users’ trips
            </h2>

            <Swiper
              className={styles.tripWrapper}
              spaceBetween={10}
              slidesPerView={1}
              freeMode={true}
              loop={true}
              breakpoints={{
                640: {
                  slidesPerView: 1,
                },
                768: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 2,
                },
                1400: {
                  slidesPerView: 3,
                },
              }}
            >
              {suggestedTrips.map((trip) => (
                <SwiperSlide
                  key={trip.id}
                  style={{
                    padding: 0,
                    margin: 0,
                    width: '300px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <TravelCard travel={trip} isSwiper={true} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
      {isItinerary && (
        <ItineraryModal closeModal={toggleModal} selectedItinerary={selectedItinerary} />
      )}
      <PhotoModal
        photoForModal={photoForModal}
        setIsPhotoOpen={setIsPhotoOpen}
        isPhotoOpen={isPhotoOpen}
      />
      <ShareModal
        isOpen={isModalShareOpen}
        onRequestClose={() => setIsModalShareOpen(false)}
        linkTo={window.location.origin + '/#/trip/' + id}
      />

      <LightBox
        isOpen={isLightBoxOpen}
        onCloseModal={() => setIsLightBoxOpen(false)}
        selectedImage={selectedImage}
        onChangeSelectedPhoto={setSelectedImage}
        images={imageUrls}
      />
      <Footer />
    </div>
  );
};

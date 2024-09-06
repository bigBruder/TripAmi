import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
// @ts-ignore
import { geocodeByPlaceId } from 'react-places-autocomplete';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import axios from 'axios';
import cn from 'classnames';
import { eachDayOfInterval, format, isValid, parse, parseISO } from 'date-fns';
import {
  collection,
  deleteDoc,
  doc,
  documentId,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getBlob, getDownloadURL } from 'firebase/storage';
import moment from 'moment';
import { DatePicker, DateRangePicker } from 'rsuite';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import Plus from '~/assets/icons/plus.svg';
import CustomDropdownEditor from '~/components/CustomDropdownEditor';
import CustomPlacesDropdown from '~/components/CustomPlacesDropdown';
import DailyUploadImagesEditor from '~/components/DailyUploadImagesEditor';
import Footer from '~/components/Footer';
import HeaderNew from '~/components/HeaderNew';
import { LoadingScreen } from '~/components/LoadingScreen';
import PlaceAutocomplete from '~/components/PlaceAutocomplete/PlaceAutocomplete';
import Rating from '~/components/Rating';
import UploadImagesEditor from '~/components/UploadImagesEditor';
import { db, storage } from '~/firebase';
import { AuthContext } from '~/providers/authContext';
import { DateInfo } from '~/types/dateJournal';
import {
  notificationsCollection,
  placesCollection,
  tripsCollection,
} from '~/types/firestoreCollections';
import { NotificationType } from '~/types/notifications/notifications';
import { UpdatedDateJournal } from '~/types/updatedDateJournal';
import getNeutralColor from '~/utils/getNeutralColor';

import defaultUserIcon from '@assets/icons/defaultUserIcon.svg';
import geotagFilled from '@assets/icons/geo_filled.svg';
import { addDoc } from '@firebase/firestore';
import { ref, uploadBytes } from '@firebase/storage';

import arrow_back from '../../../assets/icons/arrow_back.svg';
import budget_icon from '../../../assets/icons/budget-icon.svg';
import deleteButton from '../../../assets/icons/deleteButton.svg';
import geo_filled from '../../../assets/icons/geo_filled.svg';
import hashtag_icon from '../../../assets/icons/hashtag-icon.svg';
import hashtag_icon_filled from '../../../assets/icons/hashtag_icon_filled.svg';
import plane_title from '../../../assets/icons/plane-title.svg';
import styles from './CreateTrip.module.css';

import 'rsuite/dist/rsuite.min.css';

interface Props {
  isEdit?: boolean;
  data?: {
    id: string;
    rate: number;
    startDate: string;
    endDate: string;
    cities: { placeID: string; address: string }[];
    tripName: string;
    locationName: string;
    text: string;
    dayDescription: { date: string; description: string }[];
    location: { name: string; longitude: number; latitude: number; color: string };
    geoTags: { address: string; placeID: string }[];
    imageUrl: { url: string; type: string; description: string }[];
    isPrivatJournal: boolean;
  };
}

const apiKey = import.meta.env.VITE_PUBLIC_KEY;

const CreateTrip: React.FC<Props> = () => {
  const { state } = useLocation();
  const { data, isEdit } = state || {};
  const { firestoreUser, updateFirestoreUser } = useContext(AuthContext);
  const [budget, setBudget] = useState(data?.budget || '');
  const [selectedPeople, setSelectedPeople] = useState(data?.people || '');
  const [peopleIsOpen, setPeopleIsOpen] = useState(false);
  const [file, setFile] = useState<File[]>([]);
  const [rating, setRating] = useState(data?.rate || -1);
  const [hashtag, setHashtag] = useState('');
  const [hashtagsResult, setHashtagsResult] = useState<string[]>(data?.hashtags || []);
  const [startDate, setStartDate] = useState(data?.startDate || moment().format('MM/DD/YYYY'));
  const [endDate, setEndDate] = useState(data?.endDate || moment().format('MM/DD/YYYY'));

  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState(data?.text || '');
  const [geoTags, setGeoTags] = useState('');
  const [selectedGeoTags, setSelectedGeoTags] = useState<
    { address: string; placeID: string; photo: string }[]
  >(data?.geoTags || []);
  const [selectedCities, setSelectedCities] = useState<{ address: string; placeID: string }[]>(
    data?.cities || []
  );
  const [tripName, setTripName] = useState(data?.tripName || '');
  const [avatar, setAvatar] = useState<string>(defaultUserIcon);
  const [activeTab, setActiveTab] = useState(data?.stage || 'Finished');
  const [downloadedImages, setDownloadedImages] = useState<
    { url: string; type: string; description: string }[]
  >(data?.imageUrl || []);
  const [imagesDescription, setImagesDescription] = useState<
    { name: string; value: string; id?: number }[]
  >(
    downloadedImages?.map((image, id) => ({ name: image.url, value: image.description, id: id })) ||
    []
  );

  const [selectedDate, setSelectedDate] = useState<Date>(new Date(startDate));
  const [dailyInfo, setDailyInfo] = useState<DateInfo[]>([]);

  const [isPlaceOpen, setIsPlaceOpen] = useState(false);
  const [placesDrop, setPlacesDrop] = useState<{ address: string; placeID: string }[]>([]);

  const [isPrivatJournal, setIsPrivatJournal] = useState(data?.isPrivatJournal || false);

  const toggle = () => {
    setIsPrivatJournal(!isPrivatJournal);
  };

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const files: File[] = [];
      for (let i = 0; i < data.imageUrl.length; i++) {
        const storageRef = ref(storage, data.imageUrl[i].url);
        const blob = await getBlob(storageRef);
        const file = new File([blob], data.imageUrl[i].url, { type: data.imageUrl[i].type });
        files.push(file);
      }
      setFile(files);
    })();
  }, [data, storage, isEdit]);

  useEffect(() => {
    (async () => {
      const daysInfo: DateInfo[] = [];
      for (let i = 0; i < data.dayDescription.length; i++) {
        const day = data.dayDescription[i];
        const photos: File[] = [];
        for (let j = 0; j < day.photos.length; j++) {
          const photo = day.photos[j];
          const storageRef = ref(storage, photo.url);
          const blob = await getBlob(storageRef);
          const file = new File([blob], photo.url, { type: photo.type });
          photos.push(file);
        }
        daysInfo.push({
          date: day.date,
          description: day.description,
          place: day.place,
          photos,
        });
      }
      setDailyInfo(daysInfo);
    })();
  }, [data, storage, isEdit]);

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

  const notify = (textValue: string) => toast.error(textValue);

  const handleChange = (fileList: FileList) => {
    setFile((prevState) => [...prevState, ...Array.from(fileList)]);
  };

  const parseDateDaily = (dateString: string) => {
    return parse(dateString, 'MM/dd/yyyy', new Date());
  };

  useEffect(() => {
    const start = parseDateDaily(startDate);
    const end = parseDateDaily(endDate);

    if (!isValid(start) || !isValid(end)) {
      console.error('Invalid Date', start, end);
      return;
    }

    const daysArray = eachDayOfInterval({ start, end });

    setSelectedDate(start);

    const initialInfo = daysArray.map((date) => {
      if (data && isEdit) {
        const yetDay = dailyInfo.find((day) => {
          return day.date === format(date, 'MM/dd/yyyy');
        });
        if (yetDay) {
          return { ...yetDay };
        } else {
          return {
            date: format(date, 'MM/dd/yyyy'),
            description: '',
            place: [],
            photos: [],
          };
        }
      } else {
        const yetDay = dailyInfo.find((day) => {
          return day.date === format(date, 'MM/dd/yyyy');
        });
        if (yetDay) {
          return { ...yetDay };
        } else {
          return {
            date: format(date, 'MM/dd/yyyy'),
            description: '',
            place: [],
            photos: [],
          };
        }
      }
    });
    setDailyInfo(initialInfo);
  }, [startDate, endDate, activeTab]);

  useEffect(() => {
    setPlacesDrop(selectedGeoTags);
  }, [selectedGeoTags]);

  const handleDateClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, date: Date) => {
    event.preventDefault();
    setSelectedDate(date);
  };

  const handleOnSave = async (finished = false) => {
    if (!tripName.length) {
      if (!toast.isActive('tripName')) {
        toast.error('Please enter a trip name', { toastId: 'tripName' });
      }
      window.scrollTo(0, 0);
      return;
    }

    if (rating === -1) {
      if (!toast.isActive('rating')) {
        toast.error('Please rate your trip', { toastId: 'rating' });
      }
      window.scrollTo(0, 0);
      return;
    }

    if (!selectedPeople) {
      if (!toast.isActive('people')) {
        toast.error('Please select people', { toastId: 'people' });
      }
      window.scrollTo(0, 0);
      return;
    }

    if (!budget) {
      if (!toast.isActive('budget')) {
        toast.error('Please enter a budget', { toastId: 'budget' });
      }
      window.scrollTo(0, 0);
      return;
    }

    if (file.length === 0) {
      if (!toast.isActive('file')) {
        toast.error('Please upload at least one image', { toastId: 'file' });
      }
      window.scrollTo(0, 0);
      return;
    }

    try {
      if (file || downloadedImages) {
        setIsLoading(true);

        const uploadedImages: { url: string; type: string }[] = await Promise.all(
          file.map(async (image) => {
            const storageRef = ref(storage, `trips/${firestoreUser?.id}/${location + uuidv4()}`);
            const uploadResult = await uploadBytes(storageRef, image);

            return {
              url: uploadResult.ref.fullPath,
              type: image.type,
            };
          })
        );

        const updatedDaysInfo: UpdatedDateJournal[] = await Promise.all(
          dailyInfo.map(async (day) => {
            const uploadedPhotos = await Promise.all(
              day.photos.map(async (photo) => {
                const storageRef = ref(
                  storage,
                  `trips/${firestoreUser?.id}/${location + uuidv4()}`
                );
                const uploadResult = await uploadBytes(storageRef, photo);
                return {
                  url: uploadResult.ref.fullPath,
                  type: photo.type,
                };
              })
            );

            return {
              place: day.place,
              date: day.date,
              description: day.description.replace(/(?:\r\n|\r|\n)/g, '<br />'),
              photos: uploadedPhotos,
            };
          })
        );

        const placeIDs = selectedGeoTags.map((tag) => tag.placeID);
        if (isEdit && data) {
          const docRef = doc(db, 'trips', data.id);
          await updateDoc(docRef, {
            userId: firestoreUser?.id,
            imageUrl: [...uploadedImages],
            rate: rating,
            hashtags: hashtagsResult,
            budget: budget,
            people: selectedPeople,
            startDate: startDate,
            endDate: endDate,
            geoTags: selectedGeoTags,
            tripName: tripName,
            dayDescription: updatedDaysInfo,
            text: text.replace(/(?:\r\n|\r|\n)/g, '<br />'),
            stage: finished ? 'Finished' : activeTab,
            isPrivatJournal,
            placeIDs,
          });
          const subcollectionPlaces = collection(db, `trips/${docRef.id}/places`);
          const queryPlaces = query(subcollectionPlaces);
          const querySnapshotPlaces = await getDocs(queryPlaces);

          querySnapshotPlaces.docs.forEach(async (doc) => {
            await deleteDoc(doc.ref);
          });
          selectedGeoTags.forEach(async (city) => {
            await addDoc(subcollectionPlaces, {
              address: city.address,
              placeID: city.placeID,
              lat: city.lat,
              lng: city.lng,
              types: city.types,
              name: city.name,
            });

            const q = query(placesCollection, where('placeId', '==', city.placeID));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.docs.length === 0) {
              await addDoc(placesCollection, {
                address: city.address,
                placeId: city.placeID,
                lat: city.lat,
                lng: city.lng,
                types: city.types,
                name: city.name,
              });
            }
          });
        } else {
          await addDoc(tripsCollection, {
            userId: firestoreUser?.id,
            imageUrl: uploadedImages,
            rate: rating,
            hashtags: hashtagsResult,
            budget,
            people: selectedPeople,
            startDate: startDate,
            endDate: endDate,
            geoTags: selectedGeoTags,
            tripName: tripName,
            pinColor: getNeutralColor(),
            dayDescription: updatedDaysInfo,
            text: text.replace(/(?:\r\n|\r|\n)/g, '<br />'),
            createdAt: new Date(),
            stage: finished ? 'Finished' : activeTab,
            usersSaved: [],
            isPrivatJournal,
            placeIDs,
          }).then(async (docRef) => {
            const subcollectionCities = collection(db, `trips/${docRef.id}/cities`);
            const subcollectionPlaces = collection(db, `trips/${docRef.id}/places`);

            selectedCities.forEach(async (city) => {
              await addDoc(subcollectionCities, {
                address: city.address,
                placeID: city.placeID,
                lat: city.lat,
                lng: city.lng,
                types: city.types,
                name: city.name,
              });

              const q = query(placesCollection, where('placeId', '==', city.placeID));
              const querySnapshot = await getDocs(q);
              if (querySnapshot.docs.length === 0) {
                await addDoc(placesCollection, {
                  address: city.address,
                  placeId: city.placeID,
                  lat: city.lat,
                  lng: city.lng,
                  types: city.types,
                  name: city.name,
                });
              }
            });
            selectedGeoTags.forEach(async (city) => {
              await addDoc(subcollectionPlaces, {
                address: city.address,
                placeID: city.placeID,
                lat: city.lat,
                lng: city.lng,
                types: city.types,
                name: city.name,
              });

              const q = query(placesCollection, where('placeId', '==', city.placeID));
              const querySnapshot = await getDocs(q);
              if (querySnapshot.docs.length === 0) {
                await addDoc(placesCollection, {
                  address: city.address,
                  placeId: city.placeID,
                  lat: city.lat,
                  lng: city.lng,
                  types: city.types,
                  name: city.name,
                });
              }
            });
            if (firestoreUser?.friends) {
              const q = query(
                tripsCollection,
                where('userId', '==', firestoreUser?.id),
                where(documentId(), '==', docRef.id),
                limit(1)
              );
              const querySnapshot = await getDocs(q);
              firestoreUser?.friends.forEach(async (friendId) => {
                await addDoc(notificationsCollection, {
                  targetUserId: friendId,
                  postId: querySnapshot.docs[0].id,
                  type: NotificationType.NewTrip,
                  createdAt: new Date().toISOString(),
                  isReaded: false,
                });
              });
            }
          });
        }

        if (!isEdit) {
          updateFirestoreUser({
            tripCount: firestoreUser?.tripCount ? firestoreUser?.tripCount + 1 : 1,
          });
        }
      } else {
        notify('Upload at least one media and insert a location');
      }
    } catch (err) {
      console.log('[ERROR saving the trip] => ', err);
    } finally {
      navigate('/profile');
      setIsLoading(false);
    }
  };

  const onSelectGeoTag = useCallback(
    (address: string, placeID: string) => {
      (async () => {
        if (!selectedGeoTags.map((tag) => tag.address).includes(address)) {
          const coordinates = await geocodeByPlaceId(placeID);
          const photoRes = await axios.get(
            `https://us-central1-tripami-3e954.cloudfunctions.net/getPhoto?id=${placeID}`
          );
          const photo = await photoRes.data.photoUrl;
          setSelectedGeoTags((prevState) => [
            {
              address,
              placeID,
              lat: coordinates[0].geometry.location.lat(),
              lng: coordinates[0].geometry.location.lng(),
              types: coordinates[0].types,
              name: coordinates[0].formatted_address,
              photo: photo,
            },
            ...prevState,
          ]);
          setGeoTags('');
        } else {
          notify('You have already added this tag');
        }
      })();
    },
    [selectedGeoTags]
  );

  const handleRemoveGeoTag = useCallback((placeId: string) => {
    setSelectedGeoTags((prevState) => prevState.filter((item) => item.placeID !== placeId));
  }, []);

  const handleRemovePhoto = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    photoName: string,
    index: number
  ) => {
    event.preventDefault();

    setFile((prevState) => prevState.filter((_, i) => i !== index));
    setImagesDescription((prevState) => prevState.filter((_, i) => i !== index));
  };

  const handleDayDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
    date: string
  ) => {
    const newDescription = event.target.value;
    setDailyInfo((prev) => {
      return prev.map((day) => (day.date === date ? { ...day, description: newDescription } : day));
    });
  };

  useEffect(() => {
    (async () => {
      if (isEdit && data) {
        const querySnapshot = await query(tripsCollection, where(documentId(), '==', data.id));
        const docRef = await getDocs(querySnapshot);
        const docData = docRef.docs[0].data();
        for (let i = 0; i < docData.imageUrl.length; i++) {
          const url = await getDownloadURL(ref(storage, docData.imageUrl[i].url));
          docData.imageUrl[i].url = url;
        }
        setDownloadedImages(docData.imageUrl);
      }
    })();
  }, [data, isEdit]);

  const navigateBack = () => {
    window.scrollTo(0, 0);
    navigate('/profile');
  };

  const handleBudgetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;

    value = value.replace(/[^0-9]/g, '');

    value = value.replace(/,/g, '');

    if (value === '') {
      setBudget('');
    } else {
      const numericValue = Number(value);
      if (numericValue <= 1000000) {
        const formattedValue = new Intl.NumberFormat('en-US').format(numericValue);
        setBudget(formattedValue);
      }
    }
  };

  const handleHashtagChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length >= 23) {
      if (!toast.isActive('hashtagY')) {
        toast('You have already added this hashtag', { toastId: 'hashtagY' });
      }
    }

    if (event.target.value.length > 23) return;
    const input = event.target.value.replace(/#/g, '').replace(/\s/g, '');
    setHashtag(input);
  };

  const addHashtag = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const key = event.key.toLowerCase();

    if (key === 'enter' || key === 'next' || key === 'tab') {
      event.preventDefault();

      if (hashtagsResult.includes(hashtag.trim())) {
        if (!toast.isActive('hashtag')) {
          toast('You have already added this hashtag', { toastId: 'hashtag' });
        }
        return;
      }

      if (hashtag.trim().length > 0) {
        setHashtagsResult((prevState) => [...prevState, hashtag.trim()]);
        setHashtag('');
      }
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddHashtag = () => {
    if (hashtagsResult.includes(hashtag)) {
      if (!toast.isActive('hashtag')) {
        toast('You have already added this hashtag', { toastId: 'hashtag' });
      }
      return;
    }
    if (hashtag.trim().length > 0) {
      setHashtagsResult((prevState) => [...prevState, hashtag]);
      setHashtag('');
      inputRef.current?.focus();
    }
  };

  const removeHashtag = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, tag: string) => {
    setHashtagsResult((prevState) => prevState.filter((item) => item !== tag));
  };

  function formatedDate(date: Date) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const formattedDate = `${month}/${day}/${year}`;

    return formattedDate;
  }

  const handleChangePhotoDaily = (fileList: FileList) => {
    setDailyInfo((prevState) => {
      if (prevState) {
        return prevState.map((day) =>
          day.date === formatedDate(selectedDate)
            ? { ...day, photos: [...day.photos, ...Object.values(fileList)] }
            : day
        );
      } else {
        return [];
      }
    });
  };

  const handleDeleteDailyPhoto = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    photoName: string,
    index: number
  ) => {
    event.preventDefault();

    setDailyInfo((prevState) =>
      prevState.map((day) =>
        day.date === formatedDate(selectedDate)
          ? {
            ...day,
            photos: day.photos.filter((_, photoIndex) => photoIndex !== index),
          }
          : day
      )
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    let startDate = dates[0] as Date;
    let endDate = dates[1] as Date;
    const currentDate = new Date();

    if (currentDate < startDate || currentDate < endDate) {
      notify('Please select a valid date');
      return;
    }
    const startDateString = formatDate(startDate);
    const endDateString = formatDate(endDate);

    setStartDate(startDateString);
    setEndDate(endDateString);
  };

  const handleDateChangePicker = (date: Date) => {
    const currentDate = new Date();
    if (currentDate < date) {
      notify('Please select a valid date');
      return;
    }
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    const isoStartDate = localDate.toISOString().split('T')[0];
    const [year, month, day] = isoStartDate.split('-');
    const formattedDate = `${month}/${day}/${year}`;

    setStartDate(formattedDate);

    if (activeTab === 'Current') {
      const currentDate = new Date();
      const localCurrentDate = new Date(
        currentDate.getTime() - currentDate.getTimezoneOffset() * 60000
      );
      const isoEndDate = localCurrentDate.toISOString().split('T')[0];
      const [year, month, day] = isoEndDate.split('-');
      const formattedEndDate = `${month}/${day}/${year}`;
      setEndDate(formattedEndDate);
    }
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

  useEffect(() => {
    const datePickerValue = async () => {
      if (isEdit && data) {
        const start = await data?.startDate;
        const end = await data?.endDate;

        setStartDate(start);
        setEndDate(end);
      }
    };

    datePickerValue();
  }, [isEdit, data]);

  const parseDate = (dateString: string) => {
    const [month, day, year] = dateString.split('/');
    return new Date(+year, +month - 1, +day);
  };

  const isHidden = window.innerWidth >= 1022 && window.innerWidth <= 1156;
  const isShown = window.innerWidth > 840;

  const formatText = (inputText: string) => {
    return inputText.replace(/(<br \/>){3,}/g, '<br /><br />').replace(/<br \/>/g, '\n');
  };

  useEffect(() => {
    if (data?.text) {
      setText(formatText(data.text));
    }
  }, [data]);

  const handleTextChange = (event: string) => {
    const userInput = event;
    setText(formatText(userInput));
  };

  return (
    <>
      <div className={styles.editorContainer}>
        <HeaderNew avatar={avatar} />
        <div className={styles.outer_container}>
          <h1 className={styles.editorTitle}>Trip editor</h1>
          <div className={styles.titleContainer}>
            <div className={styles.titleWithIcon}>
              <input
                value={tripName}
                placeholder={'Trip name'}
                className={styles.inputTitle}
                onChange={(e) => setTripName(e.target.value)}
              />
              <img src={plane_title} alt='titleIcon' className={styles.titleIcon} />
            </div>
            <div className={styles.dateContainer}>
              {activeTab === 'Finished' ? (
                <DateRangePicker
                  editable={false}
                  value={[parseDate(startDate), parseDate(endDate)]}
                  onChange={handleDateChange}
                  size='sm'
                  appearance='subtle'
                  placeholder='Trip Length'
                  showOneCalendar
                  style={{
                    width: '90%',
                    textAlign: 'right',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  format='MM-dd-yyyy'
                />
              ) : (
                <DatePicker
                  editable={false}
                  oneTap={true}
                  // shouldDisableDate={after(new Date())}
                  value={parseDate(startDate) || undefined}
                  onChange={handleDateChangePicker}
                  placeholder='Trip Length'
                  size='sm'
                  className={styles.datePicker}
                  appearance='subtle'
                  style={{
                    width: '90%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  format='MM-dd-yyyy'
                />
              )}
            </div>
            <div className={styles.tabContainer}>
              <div
                className={cn(styles.tab, { [styles.active]: activeTab === 'Finished' })}
                onClick={() => setActiveTab('Finished')}
              >
                Finished trip
              </div>
              <div
                className={cn(styles.tab, { [styles.active]: activeTab === 'Current' })}
                onClick={() => {
                  setEndDate(formatDate(new Date()));
                  setActiveTab('Current');
                }}
              >
                Current trip
              </div>
            </div>
            <div className={styles.hashtagAdd}>
              <input
                type='text'
                value={hashtag}
                onChange={handleHashtagChange}
                placeholder={window.innerWidth < 450 ? 'Write tags' : 'Write tags here'}
                className={styles.hashtagInput}
                onKeyDown={(e) => addHashtag(e)}
                ref={inputRef}
              />
              <img src={hashtag_icon} alt='hashtagIcon' className={styles.hashtagIcon} />
              {hashtag.trim().length > 0 && (
                <img
                  src={arrow_back}
                  alt='arrow_back'
                  className={styles.arrowBack}
                  onClick={() => handleAddHashtag()}
                />
              )}
            </div>
            <div className={styles.peopleContainer}>
              <CustomDropdownEditor
                setIsOpen={setPeopleIsOpen}
                isOpen={peopleIsOpen}
                setSelectedOption={setSelectedPeople}
                selectedOption={selectedPeople}
              />
            </div>
            <div className={styles.budgetContainer}>
              <input
                type='text'
                placeholder='Trip budget'
                value={budget}
                onChange={handleBudgetChange}
                className={styles.budgetInput}
              />
              <img src={budget_icon} alt='budgetIcon' className={styles.budgetIcon} />
            </div>
            <div className={styles.startContainer}>
              {isHidden ? null : isShown ? <p className={styles.text}>Rate your trip</p> : null}

              <Rating setSelectedStars={setRating} selectedStars={rating} />
            </div>
          </div>

          <UploadImagesEditor
            handleChange={handleChange}
            file={file}
            handleRemove={handleRemovePhoto}
          />
          <div className={styles.hashtags}>
            {hashtagsResult.map((item) => (
              <div key={item} className={styles.hashtagsContainer}>
                <img
                  src={hashtag_icon_filled}
                  alt='hashtagIcon'
                  className={styles.hashtagIconRender}
                />
                <div className={styles.hashtagTitle}>
                  <p key={item} className={styles.hashtag}>
                    {item}
                  </p>
                </div>
                <div className={styles.hashtagButton} onClick={(e) => removeHashtag(e, item)}>
                  X
                </div>
              </div>
            ))}
          </div>
          <div className={styles.descriptionContainer}>
            <textarea
              id='tripStory'
              className={`${styles.input} ${styles.textArea}`}
              style={{ position: 'relative' }}
              placeholder='Write your trip description here . . .'
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
            />
          </div>
          <div className={styles.placeContainer}>
            <h2 className={styles.placesTitle}>Add Your Places</h2>
            <div className={styles.autocomplete}>
              <div className={`${styles.autocomplete} ${styles.cityAutocomplete}`}>
                <PlaceAutocomplete
                  location={geoTags}
                  setLocation={setGeoTags}
                  onSelectPlace={onSelectGeoTag}
                  placeholder='Ex. Beaches,Cities,Restaurants'
                  selectedGeoTags={selectedGeoTags}
                />
              </div>
            </div>
          </div>

          <div className={styles.selectedTagsContainer}>
            {selectedGeoTags.length ? (
              <>
                <Swiper
                  ref={geoSwiperRef}
                  modules={[Navigation]}
                  spaceBetween={20}
                  breakpoints={{
                    860: {
                      slidesPerView: 2,
                    },
                    1420: {
                      slidesPerView: 3,
                    },
                  }}
                  slidesPerView={1}
                  style={{
                    margin: '0',
                    width:
                      window.innerWidth >= 1420 ? '90%' : window.innerWidth >= 860 ? '85%' : '78%',
                    alignSelf: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selectedGeoTags.map((geoTag) => (
                    <SwiperSlide
                      key={geoTag.placeID}
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      <div className={styles.geoTagContainerWithImage}>
                        <div className={styles.geoPhotoContainer}>
                          <img src={geoTag.photo} alt='' className={styles.geoPhoto} />
                          <button
                            onClick={() => handleRemoveGeoTag(geoTag.placeID)}
                            className={styles.removePhotoButtonGeo}
                          >
                            <img src={deleteButton} alt='deleteButton' />
                          </button>
                        </div>
                        <div
                          className={cn(styles.geoTagContainer, styles.geoTagContainerImagePlus)}
                        >
                          <img
                            src={geotagFilled}
                            alt='geotagFilled'
                            className={styles.iconGeoFilled}
                          />
                          <p className={styles.geotagTitle}>{geoTag.address.split(',')[0]}</p>
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
            ) : null}
          </div>

          <div className={styles.storyContainer}>
            <div className={styles.dailyJournalContainer}>
              <div className={styles.toggleJournal}>
                <h2 className={styles.title}>Daily Journal</h2>
                <div className={styles.toggleWrapper}>
                  <div
                    className={`${styles.toggleContainer} ${isPrivatJournal ? styles.active : ''}`}
                    onClick={toggle}
                  >
                    <div className={styles.toggleCircle}></div>
                  </div>
                  <span className={styles.privatPublicJournal}>
                    {isPrivatJournal ? 'Private' : 'Public'}
                  </span>
                </div>
              </div>
              <CustomPlacesDropdown
                setIsOpen={setIsPlaceOpen}
                isOpen={isPlaceOpen}
                setPlacesDrop={setPlacesDrop}
                placesDrop={placesDrop}
                setDailyInfo={setDailyInfo}
                selectedDate={formatedDate(selectedDate)}
                selectedDayInfo={
                  dailyInfo.find((day) => day.date === formatedDate(selectedDate)) as DateInfo
                }
              />
            </div>
            <div className={styles.dailyJournal}>
              <div className={styles.swiperWrapper}>
                <Swiper
                  spaceBetween={20}
                  modules={[Navigation]}
                  ref={sliderRef}
                  className={styles.dateButtonsContainer}
                  style={{ margin: '0', width: '80%', alignSelf: 'center' }}
                  breakpoints={{
                    320: {
                      slidesPerView: 1,
                    },
                    480: {
                      slidesPerView: 2,
                    },
                    650: {
                      slidesPerView: 3,
                    },
                    1040: {
                      slidesPerView: 4,
                    },
                    1420: {
                      slidesPerView: 6,
                    },
                  }}
                >
                  {dailyInfo.map((day) => {
                    const { date } = day;
                    const isDateFilled =
                      day.photos.length > 0 || day.place.length > 0 || day.description;
                    const parsedDate = new Date(date);

                    return (
                      <SwiperSlide key={parsedDate.toString()}>
                        <button
                          onClick={(e) => handleDateClick(e, parsedDate)}
                          className={cn(styles.buttonCustom, {
                            [styles.selected]: formatedDate(selectedDate) === date,
                            [styles.dateFilled]: isDateFilled,
                          })}
                        >
                          {isValid(parsedDate)
                            ? format(parsedDate, 'EEEE MMM. do')
                            : 'Invalid Date'}
                        </button>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
                <div className={styles.arrowButtonsContainer}>
                  <div className={styles.arrowButton} onClick={handlePrev}>
                    &lt;
                  </div>
                  <div className={styles.arrowButton} onClick={handleNext}>
                    &gt;
                  </div>
                </div>
              </div>
              <DailyUploadImagesEditor
                handleChange={handleChangePhotoDaily}
                dailyInfo={
                  dailyInfo.find((day) => day.date === formatedDate(selectedDate))?.photos || []
                }
                handleRemove={handleDeleteDailyPhoto}
              />
              <div className={styles.placesDrop}>
                {dailyInfo
                  .find((day) => day.date === formatedDate(selectedDate))
                  ?.place.map((place) => (
                    <div className={styles.geoTagContainer} key={place.placeID}>
                      <img src={geo_filled} alt='geo_filled' className={styles.geotag_filled} />
                      <p className={styles.geotagTitle}>{place.address}</p>
                      <img
                        src={Plus}
                        className={styles.crossIcon}
                        onClick={() =>
                          setDailyInfo((prevState) =>
                            prevState.map((day) =>
                              day.date === formatedDate(selectedDate)
                                ? {
                                  ...day,
                                  place: day.place.filter(
                                    (item) => item.placeID !== place.placeID
                                  ),
                                }
                                : day
                            )
                          )
                        }
                      />
                    </div>
                  ))}
              </div>
              {selectedDate && (
                <div className={styles.descriptionContainer}>
                  <textarea
                    className={`${styles.input} ${styles.textArea}`}
                    placeholder={'Description'}
                    value={
                      dailyInfo.find((day) => day.date === formatedDate(selectedDate))
                        ?.description || ''
                    }
                    onChange={(e) => handleDayDescriptionChange(e, formatedDate(selectedDate))}
                  />
                </div>
              )}
            </div>
          </div>
          <div className={styles.submit_container}>
            {activeTab === 'Current' && (
              <button
                className={`${styles.form_button} ${styles.button}`}
                onClick={async () => {
                  const finished = true;
                  await handleOnSave(finished);
                  window.scrollTo(0, 0);
                }}
              >
                Finish
              </button>
            )}
            <button
              className={`${styles.form_button} ${styles.button}`}
              onClick={() => navigateBack()}
            >
              Cancel
            </button>
            <button
              className={`${styles.form_button} ${styles.button} ${styles.submit_button}`}
              onClick={async () => {
                await handleOnSave();
                window.scrollTo(0, 0);
              }}
            >
              {isEdit ? 'Save' : 'Post'}
            </button>
          </div>

          {isLoading && <LoadingScreen />}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CreateTrip;

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

import algoliasearch from 'algoliasearch';
import {
  deleteDoc,
  documentId,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { getDownloadURL } from 'firebase/storage';
import debounce from 'lodash.debounce';
import { NotificationsIcon } from '~/assets/icons/NotificationsIcon';
import CreatePostModal from '~/components/CreatePostModal';
import CreateTripModal from '~/components/CreateTripModal';
import CustomModal from '~/components/CustomModal';
import { Notifications } from '~/components/Notifications/Notifications';
import Rating from '~/components/Rating';
import { storage } from '~/firebase';
import { useInputFocus } from '~/hooks/useInputRef';
import { AuthContext } from '~/providers/authContext';
import { notificationsCollection, usersCollection } from '~/types/firestoreCollections';
import { Notification } from '~/types/notifications/notifications';

import addFile from '@assets/icons/addFile.svg';
import addUser from '@assets/icons/addUser.svg';
import arrow from '@assets/icons/arrowDown.svg';
import DefaultAvatar from '@assets/icons/defaultUserIcon.svg';
import search from '@assets/icons/iconamoon_search-thin.svg';
import AddFile from '@assets/icons/menu/addFile.svg';
import AddFriends from '@assets/icons/menu/addFriends.svg';
import Logout from '@assets/icons/menu/logout.svg';
import Plus from '@assets/icons/menu/plus.svg';
import Settings from '@assets/icons/menu/settings.svg';
import Switch from '@assets/icons/menu/switch.svg';
import icon from '@assets/icons/ph_user-light.svg';
import plus from '@assets/icons/plus.svg';
import { ref } from '@firebase/storage';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import Logo from '../../../assets/icons/headerLogo.svg';
import styles from './header.module.css';
import './styles.css';

const client = algoliasearch('W8J2M4GNE3', '18fbb3c4cc4108ead5479d90911f3507');
const index = client.initIndex('trips');

enum CONTENT_TYPE {
  POST = 'post',
  TRAVEL = 'travel',
  USER = 'user',
}

interface SearchResult {
  type: CONTENT_TYPE;
  text: string;
  id: string;
  imageUrl?: string;
  createdAt: string;
}

const Header = () => {
  const { signOutUser, firestoreUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [avatar, setAvatar] = useState<string>(icon);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchIsLoading, setSearchIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult[]>([]);
  const [tripModalIsOpen, setTripModalIsOpen] = useState(false);
  const { inputProps: searchProps, isFocused: isSearchFocused } = useInputFocus();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  useEffect(() => {
    if (!firestoreUser) return;
    const q = query(
      notificationsCollection,
      where('targetUserId', '==', firestoreUser?.id),
      orderBy('isReaded'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedDocs = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setNotifications(fetchedDocs);
    });

    return () => {
      unsubscribe();
    };
  }, [firestoreUser?.id]);

  const handleDeleteMessages = async () => {
    if (!notifications.length) return;
    try {
      const q = query(
        notificationsCollection,
        where('targetUserId', '==', notifications[0].targetUserId)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      setNotifications([]);
    } catch (error) {
      console.error('Error removing document: ', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const q = query(notificationsCollection, where(documentId(), '==', messageId));

      const querySnapshot = await getDocs(q);
      await deleteDoc(querySnapshot.docs[0].ref);
    } catch (error) {
      console.error('Error removing document: ', error);
    }
  };

  // const notifyInfo = (text: string) => {
  //   if (!toast.isActive('info')) {
  //     toast.info(text, { toastId: 'info' });
  //   }
  // };

  useEffect(() => {
    if (!isSearchFocused) {
      setSearchResult([]);
      client.clearCache();
    }
  }, [isSearchFocused]);

  const handleSearch = useCallback(async () => {
    try {
      setSearchIsLoading(true);

      if (searchTerm.length) {
        const index = client.initIndex('trips');
        const result = await index.search(searchTerm, {
          attributesToRetrieve: [
            'userId',
            'cities',
            'location',
            'rate',
            'text',
            'objectID',
            'geoTags',
          ],
          hitsPerPage: 5,
        });
        const matchedCities = result.hits.map((hit) => {
          for (let i = 0; i < hit._highlightResult.cities.length; i++) {
            if (hit._highlightResult.cities[i].address.matchLevel === 'full') {
              return hit._highlightResult.cities[i].address.value
                .replace('<em>', '')
                .replace('</em>', '')
                .split(',')[0];
            }
          }
          for (let i = 0; i < hit._highlightResult.geoTags.length; i++) {
            if (hit._highlightResult.geoTags[i].address.matchLevel === 'full') {
              return hit._highlightResult.geoTags[i].address.value
                .replace('<em>', '')
                .replace('</em>', '')
                .split(',')[0];
            }
          }
        });

        const imageUrls = await Promise.all(
          result.hits.map(async (hit) => {
            const q = query(usersCollection, where('id', '==', hit.userId));
            const querySnapshot = await getDocs(q);
            const user = querySnapshot.docs[0].data();
            if (user.avatarUrl) {
              return await getDownloadURL(ref(storage, user.avatarUrl));
            } else {
              return DefaultAvatar;
            }
          })
        );

        setSearchResult(
          result.hits.map((hit, i) => ({
            geoTag: hit.geoTag,
            rate: hit.rate,
            text: hit.text,
            userId: hit.userId,
            type: CONTENT_TYPE.TRAVEL,
            id: hit.objectID,
            avatar: imageUrls[i],
            matchedCity: matchedCities[i],
            createdAt: hit.createdAt,
          }))
        );
      }
    } catch (e) {
      console.log('[ERROR searching] => ', e);
    } finally {
      setSearchIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch, searchTerm]);

  const debouncedResults = useMemo(() => {
    return debounce(handleChange, 300);
  }, [handleChange]);

  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  }, [debouncedResults]);

  const closeModal = useCallback(() => {
    setModalIsOpen(false);
  }, []);

  useEffect(() => {
    (async () => {
      if (firestoreUser?.avatarUrl) {
        const url = await getDownloadURL(ref(storage, firestoreUser.avatarUrl));
        setAvatar(url);
      }
    })();
  }, [firestoreUser?.avatarUrl]);

  const closeTripModal = useCallback(() => {
    setTripModalIsOpen(false);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const handleSelectAutocomplete = (searchResult: any) => {
    (async () => {
      if (firestoreUser?.id && searchResult.id) {
        navigate('/trip' + `/${searchResult.id}`, {
          state: {
            // ...fetchedPost,
            postId: searchResult.id,
          },
        });
      }
    })();
  };

  useEffect(() => {
    if (!notifications || notifications.length === 0) {
      setIsNotificationsOpen(false);
    }
  }, []);

  return (
    <>
      <div className={styles.header}>
        <img className={styles.title} src={Logo} onClick={() => navigate('/profile')} />
        <div className={styles.inputWrapper}>
          <img className={styles.search} src={search} alt='search' />
          <div style={{ width: '100%' }} onFocus={searchProps.onFocus} onBlur={searchProps.onBlur}>
            <input
              className={styles.input}
              placeholder='Search reviews'
              onChange={debouncedResults}
            />
            {searchTerm.length > 0 && searchResult.length > 0 && isSearchFocused ? (
              <div className={styles.searchResultsContainer}>
                {searchResult?.map((resultOption) => {
                  return (
                    <div
                      className={styles.autocompleteOption}
                      key={resultOption.id}
                      onClick={() => handleSelectAutocomplete(resultOption)}
                    >
                      <div className={styles.autocompleteLeftBox}>
                        <img src={resultOption.avatar} alt='avatar' className={styles.avatar} />
                        {/* <p>{resultOption.location.name.split(',')[0]}</p> */}
                        <div className={styles.autocomplete_description_container}>
                          <p className={styles.autocomplete_description}>
                            {resultOption.matchedCity?.length > 20
                              ? resultOption.matchedCity?.slice(0, 20) + '...'
                              : resultOption.matchedCity}
                          </p>
                          <p
                            className={`${styles.tripDescription} ${styles.autocomplete_description}`}
                          >
                            {resultOption.text.length > 50
                              ? resultOption.text.slice(0, 40) + '...'
                              : resultOption.text}
                          </p>
                        </div>
                      </div>
                      <Rating selectedStars={resultOption.rate} />
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
        <div className={styles.icons}>
          <div className={styles.leftContainer}>
            <img
              className={styles.icon}
              src={addFile}
              alt='addFile'
              onClick={() => setTripModalIsOpen(true)}
            />
            <img
              className={styles.icon}
              src={addUser}
              alt='addUser'
              onClick={() => navigate('/add-friends')}
            />

            <img
              className={styles.icon}
              src={plus}
              alt='plus'
              onClick={() => setModalIsOpen(true)}
            />
            {notifications.length > 0 ? (
              <DropdownMenu.Root onOpenChange={setIsNotificationsOpen}>
                <DropdownMenu.Trigger>
                  <NotificationsIcon
                    isActive={notifications.length > 0}
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    counter={notifications.length}
                  />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content style={{ zIndex: '5' }}>
                  {/* This is the content of the dropdown */}
                  <DropdownMenu.Group>
                    <DropdownMenu.Item
                      onSelect={() => console.log('Item 1 clicked')}
                      style={{ position: 'relative' }}
                    >
                      <Notifications
                        onClose={() => setIsNotificationsOpen(false)}
                        notifications={notifications}
                        deleteMessages={handleDeleteMessages}
                        deleteMessage={handleDeleteMessage}
                      />
                    </DropdownMenu.Item>
                  </DropdownMenu.Group>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            ) : (
              <NotificationsIcon
                isActive={notifications.length > 0}
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                counter={notifications.length}
              />
            )}
          </div>
          {/* {isNotificationsOpen && !!notifications.length && (
            
          )} */}

          <div className={styles.rightContainer}>
            <img className={styles.avatar} src={avatar} alt='icon' />
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className={styles.IconButton} aria-label='Customise options'>
                  <span className={styles.name}>{firestoreUser?.username}</span>
                  <img className={styles.arrow} src={arrow} alt='arrow'></img>
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content className={styles.DropdownMenuContent} sideOffset={0}>
                  <DropdownMenu.Item className={styles.DropdownMenuItem}>
                    Online Status
                    <div className={styles.RightSlot}>
                      <img src={Switch} />
                    </div>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className={styles.DropdownMenuItem}
                    onClick={() => navigate('/settings')}
                  >
                    User Settings
                    <div className={styles.RightSlot}>
                      <img src={Settings} />
                    </div>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className={styles.DropdownMenuItem}
                    disabled
                    onClick={() => setTripModalIsOpen(true)}
                  >
                    Create list
                    <div className={styles.RightSlot}>
                      <img src={AddFile} />
                    </div>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className={styles.DropdownMenuItem}
                    disabled
                    onClick={() => setModalIsOpen(true)}
                  >
                    New post
                    <div className={styles.RightSlot}>
                      <img src={Plus} />
                    </div>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className={styles.DropdownMenuItem}
                    disabled
                    onClick={() => navigate('/add-friends')}
                  >
                    Find new friends
                    <div className={styles.RightSlot}>
                      <img src={AddFriends} />
                    </div>
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator className={styles.DropdownMenuSeparator} />

                  <DropdownMenu.Item className={styles.DropdownMenuItem} onClick={signOutUser}>
                    Log out
                    <div className={styles.RightSlot}>
                      <img src={Logout} />
                    </div>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
      {isNotificationsOpen && (
        <div className={styles.overlay} onClick={() => setIsNotificationsOpen(false)}></div>
      )}
      <CustomModal isOpen={modalIsOpen} onCloseModal={closeModal}>
        <CreatePostModal closeModal={closeModal} />
      </CustomModal>
      <CustomModal isOpen={tripModalIsOpen} onCloseModal={closeTripModal}>
        <CreateTripModal closeModal={closeTripModal} />
      </CustomModal>
      <ToastContainer closeOnClick autoClose={2000} limit={1} pauseOnHover={false} />
    </>
  );
};

export default Header;

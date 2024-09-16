import { useCallback, useContext, useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';

import cn from 'classnames';
import {
  addDoc,
  deleteDoc,
  doc,
  documentId,
  onSnapshot,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL } from 'firebase/storage';
import Footer from '~/components/Footer';
import HeaderNew from '~/components/HeaderNew';
import Map from '~/components/Map/Map';
import { Sort } from '~/components/Sort/Sort';
import TravelCard from '~/components/TravelCard/TravelCard';
import { firebaseErrors } from '~/constants/firebaseErrors';
import { db, storage } from '~/firebase';
import { AuthContext } from '~/providers/authContext';
import {
  friendsRequestsCollection,
  tripsCollection,
  usersCollection,
} from '~/types/firestoreCollections';
import { FriendsRequestStatus } from '~/types/friends';
import { IInvitation } from '~/types/invitations';
import { ITravel } from '~/types/travel';
import { IUser } from '~/types/user';

import Avatar from '@assets/icons/defaultUserIcon.svg';
import defaulUserAvatar from '@assets/icons/defaultUserIcon.svg';
import { getDocs, query, where } from '@firebase/firestore';
import { ref } from '@firebase/storage';

import AddNewFriends, { UserCard } from '../AddNewFriends/AddNewFriends';
import styles from './userProfile.module.css';

type SortBy = 'endDate' | 'rate' | 'alphabetically';
const TABS = ['Friends', 'Trips'];

const getQuery = (sortBy: SortBy, isReverse: boolean, id: string) => {
  switch (sortBy) {
    case 'alphabetically':
      return query(
        tripsCollection,
        where('userId', '==', id),
        orderBy('tripName', !isReverse ? 'desc' : 'asc')
      );
    case 'rate':
      return query(
        tripsCollection,
        where('userId', '==', id),
        orderBy('rate', !isReverse ? 'desc' : 'asc')
      );
    default:
      return query(
        tripsCollection,
        where('userId', '==', id),
        orderBy('endDate', !isReverse ? 'desc' : 'asc')
      );
  }
};

enum StatusButton {
  FRIENDS = 'FRIENDS',
  INVITED = 'INVITED',
  GOT_INVITE = 'GOT_INVITE',
  FOLLOW = 'FOLLOW',
}

const UserProfile = () => {
  const { id } = useParams();
  const { firestoreUser } = useContext(AuthContext);
  const [userData, setUserData] = useState<IUser>();
  const [userPhotoUrl, setUserPhotoUrl] = useState<string>();
  const [myAvatar, setMyAvatar] = useState<string>();

  const [avatarIsLoading, setAvatarIsLoading] = useState<boolean>(false);
  const [travelsIsLoading, setTravelsIsLoading] = useState<boolean>(true);
  const [userTravels, setUserTravels] = useState<ITravel[]>([]);
  const [isReverse, setIsReverse] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('endDate');
  const [activeTab, setActiveTab] = useState(0);
  const [invitations, setInvitations] = useState<IInvitation[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
  const [invitationsFromUsers, setInvitationsFromUsers] = useState<string[]>([]);
  const [buttonStatus, setButtonStatus] = useState<string>(StatusButton.FOLLOW);
  const [friends, setFriends] = useState<IUser[]>([]);

  useEffect(() => {
    if (firestoreUser?.id && userData?.id) {
      if (userData.friends?.includes(firestoreUser.id)) {
        setButtonStatus(StatusButton.FRIENDS);
      } else if (invitedUsers.includes(userData.id)) {
        setButtonStatus(StatusButton.INVITED);
      } else if (invitationsFromUsers.includes(userData.id)) {
        setButtonStatus(StatusButton.GOT_INVITE);
      } else {
        setButtonStatus(StatusButton.FOLLOW);
      }
    }
  }, [
    firestoreUser?.id,
    userData?.id,
    userData?.friends,
    invitedUsers,
    invitationsFromUsers,
    invitations,
  ]);

  useEffect(() => {
    if (firestoreUser?.id) {
      const q = query(
        friendsRequestsCollection,
        where('fromUser', '==', firestoreUser.id),
        where('status', '==', 'pending')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedDocs = querySnapshot.docs.map((doc) => doc.data().toUser);
        setInvitedUsers(fetchedDocs);
      });

      const qu = query(
        friendsRequestsCollection,
        where('toUser', '==', firestoreUser.id),
        where('status', '==', 'pending')
      );

      const unsub = onSnapshot(qu, (querySnapshot) => {
        const fetchedDocs = querySnapshot.docs.map((doc) => doc.data().fromUser);
        setInvitations(
          querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          })) as IInvitation[]
        );
        setInvitationsFromUsers(fetchedDocs);
      });

      return () => {
        unsubscribe();
        unsub();
      };
    }
  }, [firestoreUser?.firebaseUid, firestoreUser?.id, userData?.friends]);

  useEffect(() => {
    const fetchMyAvatar = async () => {
      if (firestoreUser?.avatarUrl) {
        setAvatarIsLoading(true);
        try {
          const url = await getDownloadURL(ref(storage, firestoreUser.avatarUrl));
          setMyAvatar(url);
        } catch (error) {
          console.log('[ERROR getting user photo] => ', error);
        } finally {
          setAvatarIsLoading(false);
        }
      }
    };
    fetchMyAvatar();
  }, [firestoreUser?.id, firestoreUser?.avatarUrl]);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const q = query(usersCollection, where(documentId(), '==', id));
      const querySnapshot = await getDocs(q);

      setUserData(querySnapshot.docs[0].data());
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      if (userData?.avatarUrl) {
        setAvatarIsLoading(true);
        try {
          const url = await getDownloadURL(ref(storage, userData.avatarUrl));
          setUserPhotoUrl(url);
        } catch (error) {
          console.log('[ERROR getting user photo] => ', error);
        } finally {
          setAvatarIsLoading(false);
        }
      }
    })();
  }, [userData?.id, id, userData?.avatarUrl]);

  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        let q = getQuery(sortBy, isReverse, id);

        const querySnapshot = await getDocs(q);
        const fetchedUserTravels = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        setUserTravels(fetchedUserTravels as ITravel[]);
      } catch (err) {
        // @ts-ignore
        console.error('Error getting documents: ', err);
      } finally {
        setTravelsIsLoading(false);
      }
    })();
  }, [id, isReverse, sortBy]);

  const invitation = invitations.find((invitation) => invitation.fromUser === userData?.id);

  const handleSendFriendshipRequest = useCallback(async () => {
    if (firestoreUser?.id && userData?.id) {
      try {
        await addDoc(friendsRequestsCollection, {
          toUser: userData.id,
          fromUser: firestoreUser.id,
          createdAt: new Date().toISOString(),
          status: FriendsRequestStatus.PENDING,
        });
      } catch (err) {
        console.log(err);
        // @ts-ignore
        alert(err, 'Error while sending request');
      }
    } else {
      console.error('Invalid user data:', { firestoreUser, userData });
    }
  }, [userData, firestoreUser]);

  const handleAcceptFriendshipRequest = useCallback(async () => {
    if (
      firestoreUser?.id &&
      firestoreUser.friends &&
      invitation?.id &&
      userData?.friends &&
      userData.id &&
      userData.friends_count !== undefined &&
      firestoreUser.friends_count !== undefined
    ) {
      try {
        await updateDoc(doc(db, 'friends_requests', invitation.id), {
          status: 'accepted',
        });
        await updateDoc(doc(db, 'users', userData?.id), {
          friends: [...userData.friends, firestoreUser.id],
          friends_count: userData.friends_count + 1,
        });
        await updateDoc(doc(db, 'users', firestoreUser.id), {
          friends: [...firestoreUser.friends, userData.id],
          friends_count: firestoreUser.friends_count + 1,
        });

        setButtonStatus(StatusButton.FRIENDS);
      } catch (err) {
        // @ts-ignore
        alert(firebaseErrors[err.code]);
      }
    }
  }, [
    firestoreUser?.id,
    firestoreUser?.friends,
    invitation?.id,
    userData?.friends,
    userData?.id,
    userData?.friends_count,
    firestoreUser?.friends_count,
  ]);

  const handleRemoveFriend = useCallback(async () => {
    if (userData?.id && firestoreUser?.id && userData?.friends && firestoreUser?.friends) {
      try {
        const indexOfUser = firestoreUser.friends?.indexOf(userData.id);
        const newArrayOfUsersFriends = [...firestoreUser.friends];
        newArrayOfUsersFriends.splice(indexOfUser, 1);
        await updateDoc(doc(db, 'users', firestoreUser.id), {
          friends: [...newArrayOfUsersFriends],
          friends_count: firestoreUser.friends_count ? firestoreUser.friends_count - 1 : 0,
        });
        setButtonStatus(StatusButton.FOLLOW);
      } catch (err) {
        // @ts-ignore
        alert(firebaseErrors[err.code]);
      }

      try {
        const indexOfUser = userData.friends?.indexOf(firestoreUser.id);
        const newArrayOfUsersFriends = [...userData.friends];
        newArrayOfUsersFriends.splice(indexOfUser, 1);
        await updateDoc(doc(db, 'users', userData.id), {
          friends: [...newArrayOfUsersFriends],
          friends_count: userData.friends_count ? userData.friends_count - 1 : 0,
        });
      } catch (err) {
        // @ts-ignore
        alert(firebaseErrors[err.code]);
      }
    }
  }, [userData, firestoreUser]);

  const handleCancelInvite = useCallback(async () => {
    if (firestoreUser?.id && userData?.id) {
      try {
        const q = query(
          friendsRequestsCollection,
          where('fromUser', '==', firestoreUser.id),
          where('toUser', '==', userData.id),
          where('status', '==', FriendsRequestStatus.PENDING)
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
      } catch (err) {
        console.error('Failed to cancel invite: ', err);
        // @ts-ignore
        alert(firebaseErrors[err.code] || 'An unexpected error occurred');
      }
    }
  }, [userData, firestoreUser]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (userData?.friends?.length) {
        try {
          const q = query(usersCollection, where(documentId(), 'in', userData?.friends));
          const querySnapshot = await getDocs(q);
          const fetchedUsers = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setFriends(fetchedUsers);
        } catch (error) {
          console.error('Error fetching friends:', error);
        }
      } else {
        setFriends([]);
      }
    };

    fetchFriends();
  }, [userData?.friends, usersCollection]);

  return (
    <>
      <div className={styles.main}>
        <div className={styles.content}>
          <HeaderNew avatar={myAvatar || defaulUserAvatar} />
          <div className={styles.myAccount}>
            <div className={styles.userInfo}>
              <div className={styles.imageContainer}>
                {userData?.avatarUrl ? (
                  <img
                    className={styles.defaultUserIcon}
                    src={userPhotoUrl}
                    alt='default user icon'
                  />
                ) : (
                  <img className={styles.defaultUserIcon} src={Avatar} alt='default user icon' />
                )}
                {avatarIsLoading && <Skeleton className={styles.loader} />}
              </div>
              <div className={styles.description}>
                {userData?.username ? (
                  <div className={styles.edit}>
                    <p className={styles.text} style={{ margin: 0 }}>
                      {userData?.username}
                    </p>
                  </div>
                ) : (
                  <Skeleton style={{ width: 100, height: 20 }} />
                )}
                {buttonStatus === StatusButton.FOLLOW ? (
                  <button
                    className={styles.addToFriendButton}
                    onClick={handleSendFriendshipRequest}
                  >
                    Follow
                  </button>
                ) : null}
                {buttonStatus === StatusButton.GOT_INVITE ? (
                  <button
                    className={styles.addToFriendButton}
                    onClick={handleAcceptFriendshipRequest}
                  >
                    Accept
                  </button>
                ) : null}
                {buttonStatus === StatusButton.FRIENDS ? (
                  <button
                    className={`${styles.addToFriendButton} ${styles.removeFriend}`}
                    onClick={handleRemoveFriend}
                  >
                    Remove
                  </button>
                ) : null}

                {buttonStatus === StatusButton.INVITED ? (
                  <button
                    className={`${styles.addToFriendButton} ${styles.invited}`}
                    onClick={handleCancelInvite}
                  >
                    Invited
                  </button>
                ) : null}
              </div>
            </div>
            <div className={styles.mapContainer}>
              <Map userId={id} />
            </div>
          </div>
          <div className={styles.tabContent}>
            <div className={styles.features}>
              {TABS.map((tab, index) => (
                <span
                  className={`${styles.feature} ${index === activeTab && styles.activeFeature}`}
                  onClick={() => setActiveTab(index)}
                  key={tab}
                >
                  {tab}{' '}
                </span>
              ))}
            </div>
            <div className={styles.userContent}>
              {activeTab === 0 && userData && (
                <>
                  <div
                    className={cn([styles.usersContainer], {
                      [styles.displayEmptyFriends]: !friends.length,
                    })}
                  >
                    {userData &&
                      firestoreUser?.id &&
                      userData?.friends?.includes(firestoreUser?.id) && (
                        <h3>You and {userData.username?.split(' ')[0]} are friends</h3>
                      )}
                    {friends.map((friend) => (
                      <UserCard key={friend.id} user={friend} isFriend isTabs={true} />
                    ))}
                  </div>
                </>
              )}
              {activeTab === 1 &&
                (userTravels.length === 0 ? (
                  <p className={styles.title}>{userData?.username} has not any travels</p>
                ) : (
                  <>
                    <div className={styles.travelsContainerMain}>
                      <Sort
                        onSelect={setSortBy}
                        isReverse={isReverse}
                        setReverse={() => setIsReverse((prevState) => !prevState)}
                      />
                      <div className={styles.travelsContainer}>
                        {travelsIsLoading ? (
                          <Skeleton
                            count={2}
                            height={100}
                            width={400}
                            style={{ margin: '10px 0' }}
                          />
                        ) : (
                          userTravels.map((travel) => (
                            <TravelCard key={travel.id} travel={travel} />
                          ))
                        )}
                      </div>
                    </div>
                  </>
                ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;

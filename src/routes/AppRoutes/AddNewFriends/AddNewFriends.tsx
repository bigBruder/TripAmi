import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import cn from 'classnames';
import { deleteDoc, documentId } from 'firebase/firestore';
import { getDownloadURL } from 'firebase/storage';
import Footer from '~/components/Footer';
import HeaderNew from '~/components/HeaderNew';
import { firebaseErrors } from '~/constants/firebaseErrors';
import { db, storage } from '~/firebase';
import { AuthContext } from '~/providers/authContext';
import {
  friendsRequestsCollection,
  notificationsCollection,
  tripsCollection,
  usersCollection,
} from '~/types/firestoreCollections';
import { FriendsRequestStatus } from '~/types/friends';
import { IInvitation } from '~/types/invitations';
import { NotificationType } from '~/types/notifications/notifications';
import { IUser } from '~/types/user';

import defaultAvarat from '@assets/icons/defaultUserIcon.svg';
import defaultUserIcon from '@assets/icons/defaultUserIcon.svg';
import share_link from '@assets/icons/share_link.svg';
import {
  addDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  updateDoc,
  where,
} from '@firebase/firestore';
import { ref } from '@firebase/storage';

import styles from './addNewFriends.module.css';

interface AddNewFriendsProps {
  user: IUser;
  isFriend?: boolean;
  isTabs?: boolean;
}

enum windowSize {
  MOBILE = 'Small',
  DESKTOP = 'Big',
}

const AddNewFriends: FC<AddNewFriendsProps> = ({ user, isFriend = false, isTabs = false }) => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
  const [invitationsFromUsers, setInvitationsFromUsers] = useState<string[]>([]);
  const [invitations, setInvitations] = useState<IInvitation[]>([]);
  const { firestoreUser } = useContext(AuthContext);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [copyLink, setCopyLink] = useState(false);
  const [facebookFriendsId, setFacebookFriendsId] = useState([]);
  const [facebookFriends, setFacebookFriends] = useState([]);
  const [closeFacebook, setCloseFacebook] = useState(false);
  const [facebookContainerQuery, setFacebookContainerQuery] = useState(false);

  useEffect(() => {
    if (!firestoreUser?.accessToken && !firestoreUser?.userFromFacebook) {
      setFacebookContainerQuery(true);
    } else if (firestoreUser?.accessToken && !closeFacebook) {
      setFacebookContainerQuery(false);
    } else if (firestoreUser?.accessToken && closeFacebook) {
      setFacebookContainerQuery(true);
    }
  }, [firestoreUser?.accessToken, firestoreUser?.userFromFacebook, closeFacebook]);

  useEffect(() => {
    if (firestoreUser?.id && firestoreUser?.accessToken && firestoreUser?.userFromFacebook) {
      fetch('https://graph.facebook.com/v12.0/me/friends?access_token=' + firestoreUser.accessToken)
        .then((response) => response.json())
        .then((data) => {
          setFacebookFriendsId(data.data.map((friend: any) => friend.id));
        });
    }
  }, [firestoreUser?.id, firestoreUser?.accessToken, firestoreUser?.userFromFacebook]);

  useEffect(() => {
    const fetchFriendsFromFacebook = async () => {
      if (firestoreUser?.id && facebookFriendsId.length > 0) {
        const q = query(usersCollection, where('facebookId', 'in', facebookFriendsId), limit(40));

        const querySnapshot = await getDocs(q);

        const fetchedUsers = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        setFacebookFriends(fetchedUsers);
      }
    };
    fetchFriendsFromFacebook();
  }, [firestoreUser?.id, facebookFriendsId.length]);

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
    (async () => {
      if (firestoreUser?.firebaseUid) {
        try {
          let q;
          if (user && user.friends && user.friends.length > 0) {
            q = query(
              usersCollection,
              where(documentId(), 'in', user.friends),
              where(documentId(), '!=', firestoreUser.id),
              limit(60)
            );
          } else if (user && user.friends && user.friends.length === 0) {
            q = null;
          } else {
            q = query(
              usersCollection,
              where('firebaseUid', '!=', firestoreUser?.firebaseUid),
              limit(60)
            );
          }

          if (!q) return;
          const querySnapshot = await getDocs(q);

          const fetchedUsers = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));

          setUsers(fetchedUsers as IUser[]);
        } catch (err) {
          // @ts-ignore
          console.error(firebaseErrors[err.code]);
          // alert(firebaseErrors[err.code]);
        }
      }
    })();

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
  }, [firestoreUser?.firebaseUid, firestoreUser?.id, user?.id]);

  if (user) {
    return users.length ? (
      <div className={styles.container}>
        <div className={styles.usersContainer}>
          {users.map((user) => (
            <UserCard
              user={user}
              key={user.firebaseUid}
              invited={user.id ? invitedUsers.includes(user.id) : false}
              isFriend={
                firestoreUser?.friends && user.id ? firestoreUser?.friends.includes(user.id) : false
              }
              gotInvite={user.id ? invitationsFromUsers.includes(user.id) : false}
              invitation={invitations.find((invitation) => invitation.fromUser === user.id)}
              isTabs={isTabs}
            />
          ))}
        </div>
      </div>
    ) : (
      <div className={styles.container}>
        <div className={styles.noFriendsContainer}>
          <h1 className={styles.noFriendsTitle}>No friends found</h1>
        </div>
      </div>
    );
  }

  const handleCopyLink = () => {
    const link = window.location.origin + '/?ref=' + firestoreUser?.id;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setCopyLink(true);
        setTimeout(() => {
          setCopyLink(false);
        }, 2000);
      })
      .catch(() => {
        console.log('Failed to copy link to clipboard');
      });
  };

  return (
    <>
      <div className={styles.main}>
        <HeaderNew avatar={avatar || defaultAvarat} />
        <div className={styles.copyLink}>
          <span className={styles.copyLinkTitle}>
            Share link with your friend to invite to Tripami
          </span>
          <button
            className={cn([styles.shareButton], { [styles.shareButtonCopied]: copyLink })}
            onClick={handleCopyLink}
          >
            <img src={share_link} alt='share_link' />
            <span className={styles.copyLinkButtonTitle}>{copyLink ? 'Copied' : 'Copy link'}</span>
          </button>
        </div>
        <div className={styles.allPeopleContainer}>
          <div
            className={cn(
              [styles.container],
              [styles.containerSecond],
              [styles.containerFriendsPage],
              {
                [styles.containerFacebook]: facebookContainerQuery,
              }
            )}
          >
            <h1 className={styles.friendsTitle}>Find new friends</h1>
            <p className={styles.friendsTitleSecond}>Here you can see all users of the platform</p>
            <div
              className={cn([styles.usersContainer], {
                [styles.userContainerFacebook]:
                  firestoreUser?.accessToken && firestoreUser?.userFromFacebook && !closeFacebook,
              })}
              style={{ columnGap: '10%' }}
            >
              {users.map((user) => (
                <UserCard
                  user={user}
                  key={user.firebaseUid}
                  invited={user.id ? invitedUsers.includes(user.id) : false}
                  isFriend={
                    firestoreUser?.friends && user.id
                      ? firestoreUser?.friends.includes(user.id)
                      : false
                  }
                  gotInvite={user.id ? invitationsFromUsers.includes(user.id) : false}
                  invitation={invitations.find((invitation) => invitation.fromUser === user.id)}
                />
              ))}
            </div>
          </div>
          {firestoreUser?.accessToken && firestoreUser?.userFromFacebook && !closeFacebook ? (
            <div
              className={`${styles.container} ${styles.containerFirst} ${styles.containerFriendsPage}`}
            >
              <h1 className={styles.friendsTitle}>
                People you might know
                <div className={styles.closeFacebook} onClick={() => setCloseFacebook(true)}>
                  <img src='/closeFacebook.svg' alt='closeFacebook' />
                </div>
              </h1>
              <p className={styles.friendsTitleSecond}>
                Here you can see contacts from Facebook, which are also on Tripami
              </p>
              <div
                className={cn([styles.usersContainer], {
                  [styles.userContainerFacebook]:
                    firestoreUser?.accessToken && firestoreUser?.userFromFacebook,
                })}
                style={{ columnGap: '10%' }}
              >
                {facebookFriends.map((user) => (
                  <UserCard
                    user={user}
                    key={user.firebaseUid}
                    invited={user.id ? invitedUsers.includes(user.id) : false}
                    isFriend={
                      firestoreUser?.friends && user.id
                        ? firestoreUser?.friends.includes(user.id)
                        : false
                    }
                    gotInvite={user.id ? invitationsFromUsers.includes(user.id) : false}
                    invitation={invitations.find((invitation) => invitation.fromUser === user.id)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AddNewFriends;

interface Props {
  user: IUser;
  invited?: boolean;
  gotInvite?: boolean;
  invitation?: IInvitation;
  isFriend?: boolean;
  withDefaultUserImage?: boolean;
  isTabs?: boolean;
}

export const UserCard: FC<Props> = ({
  user,
  invited,
  gotInvite,
  invitation,
  isFriend,
  withDefaultUserImage,
  isTabs = false,
}) => {
  const { firestoreUser } = useContext(AuthContext);
  const [userAvatar, setUserAvatar] = useState(defaultUserIcon);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [lastTrip, setLastTrip] = useState({});

  const [windowScreen, setWindowScreen] = useState<windowSize>(windowSize.DESKTOP);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 721) {
        setWindowScreen(windowSize.MOBILE);
      } else {
        setWindowScreen(windowSize.DESKTOP);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchTrips = async () => {
      if (firestoreUser?.id) {
        const qu = query(tripsCollection, where('userId', '==', user?.id), limit(10));

        const unsubscribe = onSnapshot(qu, (querySnapshot) => {
          const fetchedTrips = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));

          const sortedTrips = fetchedTrips.sort((a, b) => {
            const dateA = a.createdAt.seconds;
            const dateB = b.createdAt.seconds;

            return dateB - dateA;
          });

          setLastTrip(sortedTrips[0]);
        });

        return () => unsubscribe();
      }
    };

    fetchTrips();
  }, [firestoreUser?.id]);

  const handleSendFriendshipRequest = useCallback(async () => {
    if (firestoreUser?.id) {
      try {
        await addDoc(friendsRequestsCollection, {
          toUser: user.id,
          fromUser: firestoreUser.id,
          createdAt: new Date().toISOString(),
          status: FriendsRequestStatus.PENDING,
        });
        await addDoc(notificationsCollection, {
          targetUserId: user.id,
          fromUserId: firestoreUser.id,
          type: NotificationType.NewFriend,
          text: `${firestoreUser.username} wants to be your friend`,
          createdAt: new Date().toISOString(),
          isReaded: false,
        });
      } catch (err) {
        console.log(err);
        // @ts-ignore
        alert(firebaseErrors[err]);
      }
    }
  }, [user, firestoreUser]);

  const handleAcceptFriendshipRequest = useCallback(async () => {
    if (
      firestoreUser?.id &&
      firestoreUser.friends &&
      invitation?.id &&
      user.friends &&
      user.id &&
      user.friends_count !== undefined &&
      firestoreUser.friends_count !== undefined
    ) {
      try {
        await updateDoc(doc(db, 'friends_requests', invitation.id), {
          status: 'accepted',
        });
        await updateDoc(doc(db, 'users', user.id), {
          friends: [...user.friends, firestoreUser.id],
          friends_count: user.friends_count + 1,
        });
        await updateDoc(doc(db, 'users', firestoreUser.id), {
          friends: [...firestoreUser.friends, user.id],
          friends_count: firestoreUser.friends_count + 1,
        });
      } catch (err) {
        // @ts-ignore
        alert(firebaseErrors[err.code]);
      }
    }
  }, [
    firestoreUser?.id,
    firestoreUser?.friends,
    invitation?.id,
    user.friends,
    user.id,
    user.friends_count,
    firestoreUser?.friends_count,
  ]);

  const handleRemoveFriend = useCallback(async () => {
    if (user.id && firestoreUser?.id && user?.friends && firestoreUser?.friends) {
      try {
        const indexOfUser = firestoreUser.friends?.indexOf(user.id);
        const newArrayOfUsersFriends = [...firestoreUser.friends];
        newArrayOfUsersFriends.splice(indexOfUser, 1);
        await updateDoc(doc(db, 'users', firestoreUser.id), {
          friends: [...newArrayOfUsersFriends],
          friends_count: firestoreUser.friends_count ? firestoreUser.friends_count - 1 : 0,
        });
      } catch (err) {
        // @ts-ignore
        alert(firebaseErrors[err.code]);
      }

      try {
        const indexOfUser = user.friends?.indexOf(firestoreUser.id);
        const newArrayOfUsersFriends = [...user.friends];
        newArrayOfUsersFriends.splice(indexOfUser, 1);
        await updateDoc(doc(db, 'users', user.id), {
          friends: [...newArrayOfUsersFriends],
          friends_count: user.friends_count ? user.friends_count - 1 : 0,
        });
      } catch (err) {
        // @ts-ignore
        alert(firebaseErrors[err.code]);
      }
    }
  }, [user, firestoreUser]);

  const getUserImage = useCallback(async () => {
    if (withDefaultUserImage || !user?.avatarUrl) {
      setIsImageLoading(false);
      return defaultUserIcon;
    }
    if (user?.avatarUrl) {
      const url = await getDownloadURL(ref(storage, user.avatarUrl));

      setUserAvatar(url);
      setIsImageLoading(false);
    }
  }, [withDefaultUserImage, user.avatarUrl]);

  useEffect(() => {
    getUserImage();
  }, [firestoreUser?.avatarUrl, getUserImage]);

  const navigate = useNavigate();

  const handleOpenUserProfile = useCallback(() => {
    if (user.id !== firestoreUser?.id) {
      navigate('/user/' + user.id);
      window.scrollTo(0, 0);
    } else {
      navigate('/profile');
      window.scrollTo(0, 0);
    }
  }, [firestoreUser?.firebaseUid, navigate, user.id]);

  const handleCancelInvite = useCallback(async () => {
    if (firestoreUser?.id && user?.id) {
      try {
        const q = query(
          friendsRequestsCollection,
          where('fromUser', '==', firestoreUser.id),
          where('toUser', '==', user.id),
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
  }, [user, firestoreUser]);

  const cutTripTitle = (title: string) => {
    if (windowScreen === windowSize.DESKTOP) {
      if (title.length > 20) {
        return title.slice(0, 20) + '...';
      }
      return title;
    }
    if (title.length > 15) {
      return title.slice(0, 15) + '...';
    }
    return title;
  };

  return (
    <div
      className={styles.cardMain}
      style={
        isTabs
          ? {
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '8px',
          }
          : {}
      }
    >
      <div
        className={styles.userCard}
        onClick={handleOpenUserProfile}
        style={isTabs ? { justifyContent: 'center' } : {}}
      >
        <img src={userAvatar} className={styles.avatar} alt='User avatar' />
        {!isTabs ? (
          <div
            className={styles.userInfo}
            style={
              isTabs
                ? {
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                }
                : {}
            }
          >
            <p className={styles.userName}>{user.username}</p>
            {lastTrip?.tripName && lastTrip?.stage && !isTabs ? (
              <div className={styles.lastTripInfo}>
                <span className={styles.lastTripTitle}>
                  {lastTrip?.stage ? `${lastTrip?.stage}:` : ''}
                </span>
                <div className={styles.lastTripName}>
                  {lastTrip?.tripName ? cutTripTitle(lastTrip?.tripName) : ''}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {isTabs && (
        <div className={styles.userInfo}>
          <p
            className={styles.userName}
            style={
              isTabs
                ? {
                  textAlign: 'center',
                }
                : {}
            }
          >
            {user.username}
          </p>
        </div>
      )}

      {!withDefaultUserImage && !isTabs ? (
        <>
          {!invited && !gotInvite && !isFriend ? (
            <button className={styles.addToFriendButton} onClick={handleSendFriendshipRequest}>
              Follow
            </button>
          ) : null}
          {gotInvite ? (
            <button className={styles.addToFriendButton} onClick={handleAcceptFriendshipRequest}>
              Accept
            </button>
          ) : null}
          {isFriend ? (
            <button
              className={`${styles.addToFriendButton} ${styles.removeFriend}`}
              onClick={handleRemoveFriend}
            >
              Remove
            </button>
          ) : null}

          {invited ? (
            <button
              className={`${styles.addToFriendButton} ${styles.invited}`}
              onClick={handleCancelInvite}
            >
              Invited
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

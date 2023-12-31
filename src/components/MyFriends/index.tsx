import React, {useContext, useEffect, useState} from "react";
import styles from './myFriends.module.css';
import {useNavigate} from "react-router-dom";
import {AuthContext} from "~/providers/authContext";
import {onSnapshot, query, where, documentId} from "@firebase/firestore";
import {usersCollection} from "~/types/firestoreCollections";
import {IUser} from "~/types/user";
import {UserCard} from "~/routes/AppRoutes/AddNewFriends/AddNewFriends";

export const MyFriends = () => {
    const {firestoreUser} = useContext(AuthContext);
    const navigate = useNavigate();
    const [friends, setFriends] = useState<IUser[]>([]);

    useEffect(() => {
        if (firestoreUser?.friends?.length) {
            const q = query(usersCollection, where(documentId(), 'in', firestoreUser?.friends));
            const unsub = onSnapshot(q, (querySnapshot) => {
                const fetchedUsers = querySnapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id,
                }));
                setFriends(fetchedUsers as IUser[]);
            });

            return () => {
                unsub();
            };
        } else {
            setFriends([]);
        }
    }, [firestoreUser?.friends]);

    return (
      <div className={styles.container}>
          <div className={styles.usersContainer}>
              {friends.length ? (
                friends.map((friend) => <UserCard key={friend.id} user={friend} isFriend />)
              ) : (
                <>
                    <p className={styles.emptyState}>Hmm... Unfortunately, you have no friends. Fix it now and add your first friends!</p>
                    <button className={styles.button} onClick={() => navigate('/add-friends')}>Add friends & contacts</button>
                </>
              )}
          </div>
          <p className={styles.emptyState}>Also, you can<p className={styles.onlyText}>only add {firestoreUser?.friends_request_limit} new friends !</p></p>
          <button className={styles.button} onClick={() => navigate('/invite-people')}>Invite Your Friends</button>
      </div>
    );
};

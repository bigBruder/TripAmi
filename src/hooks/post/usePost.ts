import {useCallback, useContext, useState} from "react";
import {deleteObject, ref} from "firebase/storage";
import {db, storage} from "~/firebase";
import {deleteDoc, doc, getDocs, query, updateDoc, where} from "@firebase/firestore";
import {AuthContext} from "~/providers/authContext";
import {commentsCollection} from "~/types/firestoreCollections";

export const usePost = (postId: string) => {
  const {updateFirestoreUser, firestoreUser} = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeletePost = useCallback(async (imageUrls: string[]) => {
    if (imageUrls?.[0]?.length) {
      try {
        setIsLoading(true);

        const q = query(commentsCollection, where('postId', '==', postId));
        const querySnapshot = await getDocs(q);
        querySnapshot.docs.map(item => {
          const docRef = doc(db, 'comments', item.id);
          deleteDoc(docRef);
        });

        const imageRef = ref(storage, imageUrls[0]);
        await deleteObject(imageRef);
        await deleteDoc(doc(db, "posts", postId));
        updateFirestoreUser({
          postsCount: firestoreUser?.postsCount ? firestoreUser?.postsCount - 1 : 0,
        })
      } catch (err) {
        console.error('[ERROR deleting image from storage] => ', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [postId, firestoreUser]);

  const handleLikePost = useCallback(async (likes: string[]) => {
    if (firestoreUser?.id) {
      try {
        setIsLoading(true);
        const docRef = doc(db, "posts", postId);

        if (likes.includes(firestoreUser.id)) {

          const index = likes.indexOf(firestoreUser.id);

          const updatedArr = [...likes];
          updatedArr.splice(index, 1)

          await updateDoc(docRef, {
            likes: [
              ...updatedArr,
            ],
          });
        } else {
          await updateDoc(docRef, {
            likes: [
              ...likes,
              firestoreUser.id,
            ],
          });
        }
      } catch (err) {
        console.error('[ERROR liking post] => ', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [firestoreUser]);

  return {
    isLoading,
    setIsLoading,
    handleDeletePost,
    handleLikePost,
  };
};

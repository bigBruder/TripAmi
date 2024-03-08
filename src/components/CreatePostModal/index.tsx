import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import CustomTabs from "~/components/CustomTabs";
import {ImageIcon} from "@assets/icons/imageIcon";
import {TextIcon} from "@assets/icons/textIcon";
import styles from './createPostModal.module.css';
import {FileUploader} from "react-drag-drop-files";
import Rating from "~/components/Rating";
import {addDoc} from "@firebase/firestore";
import {postsCollection} from "~/types/firestoreCollections";
import {AuthContext} from "~/providers/authContext";
import {storage} from "~/firebase";
import {ref, uploadBytes} from "@firebase/storage";
import {firebaseErrors} from "~/constants/firebaseErrors";
import {LoadingScreen} from "~/components/LoadingScreen";
import { v4 as uuidv4 } from 'uuid';
import {getDownloadURL} from "firebase/storage";

const fileTypes = ["JPEG", "PNG", "GIF", "JPG"];

interface Props {
  closeModal: () => void;
}

const CreatePostModal: React.FC<Props> = ({ closeModal }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [file, setFile] = useState<null | File>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedStars, setSelectedStars] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const {firestoreUser, updateFirestoreUser} = useContext(AuthContext);

  const handleChange = (file: File) => {
    setFile(file);
  };

  const handleChangeTab = useCallback((activeTabIndex: number) => {
    setActiveTab(activeTabIndex);
  }, [setActiveTab]);

  const handleSavePost = useCallback(async () => {
    try {
      setIsLoading(true);
      const storageRef = ref(storage, `postsImages/${file?.name + uuidv4()}`);
      let imagePath = '';

      if (file) {
        const uploadResult = await uploadBytes(storageRef, file);
        imagePath = uploadResult.ref.fullPath;
      }

      await addDoc(postsCollection, {
        userId: firestoreUser?.id,
        createAt: new Date().toISOString(),
        comments: [],
        comments_count: 0,
        likes: [],
        rate: selectedStars + 1,
        imageUrls: [imagePath],
        text: postText,
      });

      updateFirestoreUser({
        postsCount: firestoreUser?.postsCount ? firestoreUser?.postsCount + 1 : 1,
      })

      closeModal();
    } catch (err) {
      // @ts-ignore
      console.log(firebaseErrors[err.code]);
    } finally {
      setIsLoading(false);
    }
  }, [file, postText, firestoreUser, selectedStars]);

  const content = useMemo(() => {
    switch (activeTab) {
      case 0:
        return (
          <>
            <textarea
              className={styles.textArea}
              placeholder={'Leave your feedback'}
              onChange={(e) => setPostText(e.target.value)}
              value={postText}
            />
          </>
        );
      case 1:
        return (
          <>
            {file ? (
              <div className={styles.uploadOuterContainer}>
                <img src={URL.createObjectURL(file)} className={styles.image} />
                <p className={styles.delete} onClick={() => setFile(null)}>Delete</p>
              </div>
            ) : (
              <FileUploader
                multiple={false}
                handleChange={handleChange}
                name="file"
                types={fileTypes}
                classes={`${styles.uploadOuterContainer}`}
                hoverTitle={' '}
                onDraggingStateChange={(state: boolean) => setIsDragging(state)}
              >
                <div className={styles.uploadContainer}>
                  <p>Drag and drop image or</p>
                  <button className={styles.buttonUpload}>Upload</button>
                </div>
              </FileUploader>
            )}
          </>
        );
      default:
        return null;
    }
  }, [isDragging, activeTab, file, postText]);

  return (
    <div className={styles.outer_container}>
      <CustomTabs
        handleChangeTab={handleChangeTab}
        tabs={[
          {
            index: 0,
            label: 'Post',
            Icon: <TextIcon color={activeTab === 0 ? "#FF4D00" : undefined} />,
          },
          {
            index: 1,
            label: 'Image and Video',
            Icon: <ImageIcon color={activeTab === 1 ? "#FF4D00" : undefined} />,
          },
        ]}
        activeTab={activeTab}
      />
      <div className={styles.container}>
        {content}
        <div className={styles.startContainer}>
          <Rating setSelectedStars={setSelectedStars} selectedStars={selectedStars} />
        </div>
        <div className={styles.bottomRow}>
          <button className={styles.button} onClick={handleSavePost}>
            Post
          </button>
          <button className={`${styles.button} ${styles['button-gray']}`} onClick={closeModal}>
            Cancel
          </button>
        </div>
      </div>

      {isLoading && <LoadingScreen />}
    </div>
  );
};

export default CreatePostModal;

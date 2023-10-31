import React, {useCallback, useMemo, useState} from 'react';
import CustomTabs from "~/components/CustomTabs";
import {ImageIcon} from "@assets/icons/imageIcon";
import {TextIcon} from "@assets/icons/textIcon";
import styles from './createPostModal.module.css';
import stars from "@assets/icons/stars.svg";
import {FileUploader} from "react-drag-drop-files";
import Rating from "~/components/Rating";

const fileTypes = ["JPEG", "PNG", "GIF"];

interface Props {
  closeModal: () => void;
}

const CreatePostModal: React.FC<Props> = ({ closeModal }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (file) => {
    setFile(file);
  };

  const handleChangeTab = useCallback((activeTabIndex: number) => {
    setActiveTab(activeTabIndex);
  }, [setActiveTab]);

  const content = useMemo(() => {
    switch (activeTab) {
      case 0:
        return (
          <>
            <textarea className={styles.textArea} placeholder={'Text (optional)'}/>
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
  }, [isDragging, activeTab, file]);

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
          <Rating />
        </div>
        <div className={styles.bottomRow}>
          <button className={styles.button} onClick={closeModal}>
            Post
          </button>
          <button className={`${styles.button} ${styles['button-gray']}`} onClick={closeModal}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;

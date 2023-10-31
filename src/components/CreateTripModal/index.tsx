import React, {useState} from 'react';
import styles from './createTripModal.module.css';
import stars from "@assets/icons/stars.svg";
// @ts-ignore
import Checkbox from 'react-custom-checkbox';
import Tick from "../../assets/icons/tick.svg";
import Rating from "~/components/Rating";
import {FileUploader} from "react-drag-drop-files";

const fileTypes = ["JPEG", "PNG", "GIF"];

interface Props {
  closeModal: () => void;
}

const CreatePostModal: React.FC<Props> = ({ closeModal }) => {
  const [tickIsChecked, setTickIsChecked] = useState(false);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (file) => {
    setFile(file);
  };

  return (
    <div className={styles.outer_container}>
      <form>
        <div className={styles.topContainer}>
          <p>Where’d you go?</p>
          <input className={styles.input} placeholder={'Venice, Italy.'} />
          <p>When?</p>
          <input type="date" className={styles.input} />
        </div>
        <div className={styles.startContainer}>
          <p>Public</p>
          <Checkbox
            checked={tickIsChecked}
            icon={<img src={Tick} style={{ width: 24 }} alt="" />}
            onChange={(value: boolean) => {
              setTickIsChecked(value);
            }}
            borderColor="#55BEF5"
            borderRadius={0}
            size={24}
          />
        </div>
        <div className={styles.startContainer}>
          <p>Rating</p>
          <Rating />
        </div>
        <div className={styles.startContainer}>
          <p>Image and Video </p>
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
              <p className={styles.dragText}>Drag and drop image or</p>
              <button className={styles.buttonUpload}>Upload</button>
            </div>
          </FileUploader>
        </div>
      </form>
      <p></p>
      <div className={styles.container}>
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

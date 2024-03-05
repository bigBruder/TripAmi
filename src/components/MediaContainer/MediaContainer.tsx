import React, { useState, useEffect } from 'react';
import styles from './mediaContainer.module.css'; // Import your CSS module

interface Props {
  mediaUrl: string;
}

const VideoFormat = ['mp4', 'webm', 'wmv', 'ogg', 'mov', 'avi']

const MediaContainer: React.FC<Props> = ({ mediaUrl }) => {
  const [isVideo, setIsVideo] = useState(false);

  useEffect(() => {
    setIsVideo(VideoFormat.some(format => mediaUrl.includes(format)));
  }, [mediaUrl]);

  return (
    <div className={styles.mediaContainer}>
      {isVideo ? (
        <video 
            src={mediaUrl} 
            controls 
            className={styles.image} 
            autoPlay
            disablePictureInPicture
        ></video>
      ) : (
        <img src={mediaUrl} alt="Travel photo" className={styles.image} />
      )}
    </div>
  );
};

export default MediaContainer;

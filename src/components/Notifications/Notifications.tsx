import { FC } from "react";
import { Notification } from "~/types/notifications/notifications";
import styles from './notifications.module.css';
import { useNavigate } from "react-router-dom";
import { deleteDoc, getDocs, query, where } from "firebase/firestore";
import { notificationsCollection } from "~/types/firestoreCollections";
import { ToastContainer, toast } from "react-toastify";

interface Props {
    notifications: Notification[];
    deleteMessages: () => void;
}

export const Notifications: FC<Props> = ({notifications, deleteMessages}) => {
    const navigate = useNavigate();
    const handleNavigate = (postId: string) => {
        navigate(`/posts/${postId}`);
    }

    return (
        <div className={styles.container}> 
            {notifications.map((notification) => (
                <div key={notification.id} className={styles.notification}>
                    <div>
                        <p className={styles.base_text}>You have new comment in your post:</p>
                        <p className={styles.title}>{notification.text}</p>
                    </div>
                    <button className={styles.button} onClick={() => handleNavigate(notification.postId)}>To post</button>
                </div>
            ))}
            <button className={`${styles.button} ${styles.button_delete}`} onClick={deleteMessages}>Delete messages</button>
        </div>
    )
}
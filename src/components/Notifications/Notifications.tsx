import { FC } from "react";
import { Notification, NotificationType } from "~/types/notifications/notifications";
import styles from './notifications.module.css';
import { useNavigate } from "react-router-dom";
import { deleteDoc, getDocs, query, where } from "firebase/firestore";
import { notificationsCollection } from "~/types/firestoreCollections";
import { ToastContainer, toast } from "react-toastify";

interface Props {
    notifications: Notification[];
    deleteMessages: () => void;
    deleteMessage: (id: string) => void;
}

const getTitle = (type: NotificationType) => {
    switch (type.toLowerCase()) {
        case NotificationType.NewPost:
            return 'Your friend has created a new post!';
        case NotificationType.CommentPost:
            return 'Your friend has commented on your post:';
        case NotificationType.NewTrip:
            return 'Your friend has created a new trip!';
        case NotificationType.CommentTrip:
            return 'Your friend has commented on your trip:';
        default:
            return '';
    }
}

const getWay = (type: NotificationType) => {
    switch (type.toLowerCase()) {
        case NotificationType.NewPost:
        case NotificationType.CommentPost:
            return 'posts';
        case NotificationType.NewTrip:
        case NotificationType.CommentTrip:
            return 'trip';
        default:
            return '';
    }
}

export const Notifications: FC<Props> = ({notifications, deleteMessages, deleteMessage}) => {
    const navigate = useNavigate();
    const handleNavigate = (postId: string, type: NotificationType) => {
        const way = getWay(type);
        navigate(`/${way}/${postId}`);
    }

    return (
        <div className={styles.container}>
            <p className={styles.title}>Notifications</p>
            {notifications.map((notification) => (
                <div key={notification.id} className={styles.notification}>

                    <div>
                    <p className={styles.base_text}>{getTitle(notification.type)}</p>
                    {
                        notification.text && (
                            <p className={styles.text}>{notification.text.length > 20 ? notification.text.slice(0, 20) + '...' : notification.text}</p>
                        )
                    }
                    </div>
                    <div className={styles.control_container}>
                        <button className={styles.button} onClick={() => handleNavigate(notification.postId, notification.type)}>Check</button>
                        <button 
                            className={`${styles.button} ${styles.button_remove}`} 
                            onClick={() => deleteMessage(notification.id)}
                        >
                            X
                        </button>
                    </div>
                    

                </div>
            ))}
            <button className={`${styles.button} ${styles.button_delete}`} onClick={deleteMessages}>Delete messages</button>
        </div>
    )
}
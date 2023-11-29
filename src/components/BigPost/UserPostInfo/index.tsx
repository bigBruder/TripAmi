import styles from './userPostInfo.module.css';
import Avatar from "@assets/icons/ava1.svg";
import React, {FC} from "react";
import {IUser} from "~/types/user";
import {timeAgo} from "@utils/daysAgo";

interface Props {
  userData: IUser;
  createdAt: string;
}

export const UserPostInfo: FC<Props> = ({userData, createdAt}) => {
  return (
    <div className={styles.userContainer}>
      <div className={styles.leftContainer}>
        <img src={Avatar} />
        <div>
          <p className={styles.location}>{userData?.username}</p>
          <p className={styles.postedAgo}>{timeAgo(createdAt)}</p>
        </div>
      </div>
      <button className={styles.button}>
        <p className={styles.buttonText}>
          join
        </p>
      </button>
    </div>
  );
};

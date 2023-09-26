import icon from "@assets/icons/ph_user-light.svg";
import search from "@assets/icons/iconamoon_search-thin.svg";
import arrow from "@assets/icons/arrowDown.svg";
import addFile from "@assets/icons/addFile.svg";
import addUser from "@assets/icons/addUser.svg";
import notifications from "@assets/icons/notifications.svg";
import plus from "@assets/icons/plus.svg";
import styles from "./header.module.css";

const Header = () => {
  return (
    <div className={styles.header}>
      <div className={styles.title}>TripAmi</div>
      <div className={styles.inputWrapper}>
        <img className={styles.search} src={search} alt="search" />
        <input className={styles.input} placeholder="Search"></input>
      </div>
      <div className={styles.icons}>
        <img className={styles.icon} src={addFile} alt="addFile" />
        <img className={styles.icon} src={addUser} alt="addUser" />
        <img className={styles.icon} src={notifications} alt="notifications" />
        <img className={styles.icon} src={plus} alt="plus" />
        <img className={styles.avatar} src={icon} alt="icon" />
        <span className={styles.name}>Name</span>
        <img className={styles.arrow} src={arrow} alt="arrow"></img>
      </div>
    </div>
  );
};

export default Header;

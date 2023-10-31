import icon from "@assets/icons/ph_user-light.svg";
import search from "@assets/icons/iconamoon_search-thin.svg";
import arrow from "@assets/icons/arrowDown.svg";
import styles from "./header.module.css";

const Header = () => {
  return (
    <div className={styles.header}>
      <div className={styles.title}>TripAmi</div>
      <div className={styles.inputWrapper}>
        <img className={styles.search} src={search} alt="search" />
        <input className={styles.input} placeholder="Search"></input>
      </div>
      <div className={styles.icon}>
        <button className={styles.button}>Log in</button>
        <img className={styles.avatar} src={icon} alt="icon" />
        <img className={styles.arrow} src={arrow} alt="arrow"></img>
      </div>
    </div>
  );
};

export default Header;

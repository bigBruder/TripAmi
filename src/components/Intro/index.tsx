import icon from "@assets/icons/readingBookWoman.svg";
import bookIcon from "@assets/icons/loopBook.svg";
import search from "@assets/icons/iconamoon_search-thin.svg";
import styles from "./intro.module.css";

const Intro = () => {
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div>
          <p className={styles.header}>
            Tired of relying on travel reviews from randoms? Now see reviews
            only from people you know!
          </p>
          <p className={styles.text}>
            Join the platform and find out what people are saying about their
            travels!
          </p>
          <button className={styles.button}>Join us</button>
        </div>
        <img className={styles.icon} src={icon} alt="woman" />
      </div>
      <h3 className={styles.title}>
        Don't have an account but want to find travel reviews? Use our{" "}
        <a className={styles.search} href="#">
          search
        </a>
        !
      </h3>
      <div className={styles.relativeBlock}>
        <div className={styles.inputWrapper}>
          <img className={styles.searchIcon} src={search} alt="search"></img>
          <input className={styles.input} placeholder="Search"></input>
        </div>
        <img className={styles.bookIcon} src={bookIcon} alt="book" />
      </div>
    </div>
  );
};

export default Intro;

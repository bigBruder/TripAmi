import defaultUserIcon from "@assets/icons/defaultUserIcon.svg";
import editText from "@assets/icons/editText.svg";
import map from "@assets/icons/map.svg";
import addImg from "@assets/icons/addImg.svg";
import plus from "@assets/icons/plus.svg";
import styles from "./myaccount.module.css";

const MyAccount = () => {
  return (
    <div className={styles.profile}>
      <div className={styles.myAccount}>
        <div className={styles.genaralInfo}>
          <div className={styles.userInfo}>
            <img
              className={styles.defaultUserIcon}
              src={defaultUserIcon}
              alt="default user icon"
            />
            <div className={styles.description}>
              <p>Name</p>
              <p className={styles.text}>Posts : 0</p>
              <div className={styles.edit}>
                <span className={styles.editText}>Where to text?</span>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Start write"
                  />
                  <img
                    className={styles.icon}
                    src={editText}
                    alt="default user icon"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.features}>
            <span>My friends</span>
            <span>Google Maps</span>
            <span>Find new friends</span>
          </div>
          <div className={styles.fileInputWrapper}>
            Create Post
            <label className={styles.customFileInputLabel}>
              <input type="file" className={styles.fileInput} />
              <div>
                <img src={addImg} className={styles.addImg} alt="addImg" />
                <img src={plus} alt="plus" />
              </div>
            </label>
          </div>
        </div>
        <div className={styles.mapContainer}>
          <div className={styles.editMapBox}>
            <span className={styles.editMap}>Edit Map</span>
            <img className={styles.editIcon} src={editText} alt="edit icon" />
          </div>
          <img className={styles.map} src={map} alt="Map" />
        </div>
      </div>
      <div className={styles.travelContainer}>
        <span className={styles.title}>Someone's travels</span>
        <p className={styles.paragraph}>
          Hmm... Someone hasn't posted anything yet. Start sharing your
          experience with other participants!
        </p>
        <button className={styles.button}>NEW POST</button>
      </div>
      <span className={styles.postsTitle}>You may also like</span>
    </div>
  );
};

export default MyAccount;

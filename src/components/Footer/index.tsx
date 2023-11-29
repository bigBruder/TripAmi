import styles from './footer.module.css';
import Logo from '../../assets/icons/headerLogo.svg';

export const Footer = () => {
  return (
    <div className={styles.container}>
      <img src={Logo} className={styles.logo} />
      {/*<div className={styles.centerContainer}>*/}
      {/*  <p>TripAmi</p>*/}
      {/*  <p>the country of your dreams</p>*/}
      {/*</div>*/}
      <div className={styles.rightContainer}>
        <p>Contacts</p>
        <p>Our social networks</p>
      </div>
    </div>
  );
};

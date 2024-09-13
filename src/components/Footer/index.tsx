import { useNavigate } from 'react-router-dom';

import facebook_logo from '../../assets/icons/facebook_logo.svg';
import Logo from '../../assets/icons/headerLogo.svg';
import instagram_logo from '../../assets/icons/instagram_logo.svg';
import x_logo from '../../assets/icons/x_logo.svg';
import styles from './footer.module.css';

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerLogo}>
        <img
          className={styles.mainLogoFooter}
          src={Logo}
          onClick={() =>
            navigate('/', {
              state: {
                activeTab: 0,
              },
            })
          }
        />
        <p className={styles.footerTitle}>Privacy policy</p>
        <p className={styles.footerTitle}>Contacts</p>
        <div className={styles.socialLogo}>
          <img src={facebook_logo} alt='facebook_logo' className={styles.logo} />
          <img src={x_logo} alt='x_logo' className={styles.logo} />
          <img src={instagram_logo} alt='instagram_logo' className={styles.logo} />
        </div>
      </div>
      <div className={styles.rights}>
        <p>© 2024 TripAmi</p>
      </div>
    </footer>
  );
};

export default Footer;

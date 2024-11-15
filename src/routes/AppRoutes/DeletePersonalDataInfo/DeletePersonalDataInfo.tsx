import { Link } from 'react-router-dom';

import styles from './deletePersonalDataInfo.module.css';

const DataDeletion = () => {
  return (
    <div className={styles.pageStyles}>
      <div className={styles.back}>
        <Link to={'/'} className={styles.backButton}>
          Home
        </Link>
      </div>
      <main className={styles.mainContent}>
        <div>
          <h2 className={styles.title}>How to Delete Your Data from Our App</h2>
          <p className={styles.description}>
            Deleting your data from our app is a simple process. Follow these steps:
          </p>
          <ol className={styles.steps}>
            <li>Log in to your account.</li>
            <li>Navigate to your profile settings.</li>
            <li>Select the option "Delete Account."</li>
            <li>Confirm the account deletion.</li>
          </ol>
          <p className={styles.note}>
            Once the deletion is confirmed, all your data will be permanently removed from our app,
            including any personal information and related records.
          </p>
        </div>
      </main>
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} TripAmi Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default DataDeletion;

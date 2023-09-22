import Intro from "../components/Intro";
import Header from "../components/Header";
import AuthModal from "../components/Auth";
import PostItem from "../components/Posts";
import styles from "../stylesheets/intro.module.css";
import { posts } from "../utils/posts";

const LoginPage = () => {
  return (
    <>
      <Header />
      <div className={styles.mainSection}>
        <div className={styles.leftSection}>
          <Intro />
          <h5 className={styles.title}>Trending today</h5>
          <div className={styles.container}>
            {posts.map((post) => (
              <PostItem {...post} key={post.id} />
            ))}
          </div>
        </div>
        <div className={styles.authSection}>
          <AuthModal />
        </div>
      </div>
    </>
  );
};

export default LoginPage;

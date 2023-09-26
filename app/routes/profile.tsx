import MyAccount from "~/components/profile/MyAccount";
import Header from "../components/profile/Header";
import { posts } from "../utils/posts";
import PostItem from "~/components/Posts";
import styles from "../stylesheets/profile.module.css";

const ProfilePage = () => {
  return (
    <>
      <Header />
      <div style={{ backgroundColor: "#DCE8F5" }}>
        <MyAccount />
        <div className={styles.container}>
          {posts.map((post) => (
            <PostItem {...post} key={post.id} />
          ))}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;

import MyAccount from "~/components/profile/MyAccount";
import Header from "../../../components/profile/Header";
import styles from "./profile.module.css";

const ProfilePage = () => {
  return (
    <div className={styles.profileContainer}>
      <Header />
      <div style={{ backgroundColor: "#DAE0E1" }}>
        <MyAccount />
        <div className={styles.container}>
          {/*{posts.map((post) => (*/}
          {/*  <PostItem {...post} key={post.id} />*/}
          {/*))}*/}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

import styles from "./invitePeople.module.css";
import {PageTitle} from "~/components/PageTitle";
import Header from "~/components/profile/Header";
import {Footer} from "~/components/Footer";
import {useCallback, useContext, useState} from "react";
import {AuthContext} from "~/providers/authContext";
import axios from "axios";

const InvitePeople = () => {
  const {firestoreUser} = useContext(AuthContext);
  const [email, setEmail] = useState('');

  const handleSendInvitation = useCallback(async () => {
    if (firestoreUser?.email) {

        try {
          const response = await axios.post('https://api.elasticemail.com/v4/emails', {
            Recipients: [{
              Email: email,
            }],
            Content: {
              Body: [{
                ContentType: "HTML",
                // Content: "string",
                Charset: "string"
              }],
              From: "visosensey@gmail.com",
              Subject: "string",
              TemplateName: "TripAmi",
              Merge: {
               linkTo: "https://tripamicities.netlify.app",
              },
            },
          }, {
            headers: {
              'X-ElasticEmail-ApiKey': 'BE74E3AE0AD551541906080E491A880B630B0DB2E63B63573F4AEE255C011D805F60BBC6D8EFBCC03AA7440DC3DADE3D',
            }
          }).then((response) => {console.log(response)});
          
        } catch (err) {
          console.log('[ERROR sending email] => ', err);
        }

    }
  }, [email, firestoreUser?.email]);

  return (
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.main}>
        <PageTitle title={'Add new people'} />
        <p className={styles.limit}>Remember that you only have {firestoreUser?.friends_request_limit} invitations!</p>
        <div className={styles.inputContainer}>
          <input
            className={styles.input}
            placeholder={'Name'}
            type={'text'}
            
          />
          <input className={styles.input} placeholder={'Email'} type={'email'} onChange={(e) => setEmail(e.target.value)}/>
          <button onClick={handleSendInvitation} className={styles.sendButton}>Invite</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default InvitePeople;

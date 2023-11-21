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
            Email: "visosensey@gmail.com",
          }],
          Content: {
            // Body: [{
            //   ContentType: "HTML",
            //   Content: "string",
            //   Charset: "string"
            // }],
            // Merge: {
            //   city: "New York",
            //   age: "34"
            // },
            // Headers: {
            //   city: "New York",
            //   age: "34"
            // },
            // Postback: "string",
            // EnvelopeFrom: "John Doe email@domain.com",
            From: "visosensey@gmail.com",
            // ReplyTo: "John Doe email@domain.com",
            // Subject: "Hello!",
            // TemplateName: "Template01",
            // Utm: {
            //   Source: "string",
            //   Medium: "string",
            //   Campaign: "string",
            //   Content: "string"
            // }
          },
          // Options: {
          //   TimeOffset: null,
          //   PoolName: "My Custom Pool",
          //   ChannelName: "Channel01",
          //   Encoding: "UserProvided",
          //   TrackOpens: "true",
          //   TrackClicks: "true"
          // }
        }, {
          headers: {
            'X-ElasticEmail-ApiKey': '418DBF78CAA63D902B87F1DC9B6F9850FF9A8EA6FC0276CD7A95DB65A1B0E41F163B354E2CC0814C4079A7A77685A840',
          }
        });

        console.log(response);
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
            onChange={(e) => setEmail(e.target.value)}
          />
          <input className={styles.input} placeholder={'Email'} type={'email'} />
          <button onClick={handleSendInvitation} className={styles.sendButton}>Invite</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default InvitePeople;

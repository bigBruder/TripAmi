import icon from "@assets/icons/ph_user-light.svg";
import search from "@assets/icons/iconamoon_search-thin.svg";
import arrow from "@assets/icons/arrowDown.svg";
import addFile from "@assets/icons/addFile.svg";
import addUser from "@assets/icons/addUser.svg";
import notifications from "@assets/icons/notifications.svg";
import plus from "@assets/icons/plus.svg";
import styles from "./header.module.css";
import Logo from '../../../assets/icons/headerLogo.svg';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import Switch from '@assets/icons/menu/switch.svg';
import Settings from '@assets/icons/menu/settings.svg';
import Logout from '@assets/icons/menu/logout.svg';
import Plus from '@assets/icons/menu/plus.svg';
import AddFriends from '@assets/icons/menu/addFriends.svg';
import AddFile from '@assets/icons/menu/addFile.svg';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import {AuthContext} from "~/providers/authContext";

import './styles.css';
import {useNavigate} from "react-router-dom";
import CreatePostModal from "~/components/CreatePostModal";
import CustomModal from "~/components/CustomModal";
import {getDownloadURL} from "firebase/storage";
import {ref} from "@firebase/storage";
import {storage} from "~/firebase";
import debouce from "lodash.debounce";
import {tripsCollection} from "~/types/firestoreCollections";
import {getDocs, query, where} from "@firebase/firestore";
import {ITravel} from "~/types/travel";

const Header = () => {
  const {signOutUser, firestoreUser, modalOpen, setModalOpen} = useContext(AuthContext);
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState<string>(icon);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchIsLoading, setSearchIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<ITravel[]>([]);

  const handleChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm]);

  const handleSearch = useCallback(async () => {
    try {
      setSearchIsLoading(true);
      const q = query(
        tripsCollection,
        // where('location.name', 'array-contains', [searchTerm]),
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm+ '\uf8ff'),
      );

      const result = await getDocs(q);

      setSearchResult(result.docs.map(travel => ({
        ...travel.data(),
        id: travel.id,
      } as ITravel)));
    } catch (e) {
      console.log('[ERROR searching] => ', e);
    } finally {
      setSearchIsLoading(false);
    }
  }, [searchTerm]);

  const debouncedResults = useMemo(() => {
    return debouce(handleChange, 300);
  }, []);

  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  });

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  useEffect(() => {
    (async () => {
      if (firestoreUser?.avatarUrl) {
        const url = await getDownloadURL(ref(storage, firestoreUser.avatarUrl));
        setAvatar(url);
      }
    })();
  }, [firestoreUser?.avatarUrl]);

  return (
    <>
      <div className={styles.header}>
        <img className={styles.title} src={Logo} onClick={() => navigate('/profile')} />
        <div className={styles.inputWrapper}>
          <img className={styles.search} src={search} alt="search" />
          <input className={styles.input} placeholder="Search" onChange={debouncedResults} />
        </div>
        <div className={styles.icons}>
          <div className={styles.leftContainer}>
            <img className={styles.icon} src={addFile} alt="addFile" onClick={() => setModalOpen(true)}/>
            <img className={styles.icon} src={addUser} alt="addUser" onClick={() => navigate('/add-friends')} />
            <img className={styles.icon} src={notifications} alt="notifications" />
            <img className={styles.icon} src={plus} alt="plus" />
          </div>
          <div className={styles.rightContainer}>
            <img className={styles.avatar} src={avatar} alt="icon" />
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className={styles.IconButton} aria-label="Customise options">
                  <span className={styles.name}>{firestoreUser?.username}</span>
                  <img className={styles.arrow} src={arrow} alt="arrow"></img>
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content className={styles.DropdownMenuContent} sideOffset={0}>
                  <DropdownMenu.Item className={styles.DropdownMenuItem}>
                    Online Status
                    <div className={styles.RightSlot}>
                      <img src={Switch}/>
                    </div>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className={styles.DropdownMenuItem} onClick={() => navigate('/settings')}>
                    User Settings
                    <div className={styles.RightSlot}>
                      <img src={Settings}/>
                    </div>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className={styles.DropdownMenuItem} disabled>
                    Create list
                    <div className={styles.RightSlot}>
                      <img src={AddFile}/>
                    </div>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className={styles.DropdownMenuItem} disabled>
                    New post
                    <div className={styles.RightSlot}>
                      <img src={Plus}/>
                    </div>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className={styles.DropdownMenuItem} disabled>
                    Find new friends
                    <div className={styles.RightSlot}>
                      <img src={AddFriends}/>
                    </div>
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator className={styles.DropdownMenuSeparator} />

                  <DropdownMenu.Item className={styles.DropdownMenuItem} onClick={signOutUser}>
                    Log out
                    <div className={styles.RightSlot}>
                      <img src={Logout}/>
                    </div>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>

      <CustomModal isOpen={modalOpen} onCloseModal={closeModal}>
        <CreatePostModal closeModal={closeModal}/>
      </CustomModal>
    </>
  );
};

export default Header;

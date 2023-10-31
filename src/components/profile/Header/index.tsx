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

import Switch from '@assets/assets/icons/menu/switch.svg';
import Settings from '@assets/assets/icons/menu/settings.svg';
import Logout from '@assets/assets/icons/menu/logout.svg';
import Plus from '@assets/assets/icons/menu/plus.svg';
import AddFriends from '@assets/assets/icons/menu/addFriends.svg';
import AddFile from '@assets/assets/icons/menu/addFile.svg';

const Header = () => {
  return (
    <div className={styles.header}>
      <img className={styles.title} src={Logo} />
      <div className={styles.inputWrapper}>
        <img className={styles.search} src={search} alt="search" />
        <input className={styles.input} placeholder="Search"></input>
      </div>
      <div className={styles.icons}>
        <div className={styles.leftContainer}>
          <img className={styles.icon} src={addFile} alt="addFile" />
          <img className={styles.icon} src={addUser} alt="addUser" />
          <img className={styles.notifications} src={notifications} alt="notifications" />
          <img className={styles.icon} src={plus} alt="plus" />
        </div>
        <div className={styles.rightContainer}>
          <img className={styles.avatar} src={icon} alt="icon" />
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className={styles.IconButton} aria-label="Customise options">
                <span className={styles.name}>Name</span>
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
                <DropdownMenu.Item className={styles.DropdownMenuItem}>
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

                <DropdownMenu.Item className={styles.DropdownMenuItem} disabled>
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
  );
};

export default Header;

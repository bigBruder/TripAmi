import React, { useContext, useEffect, useRef, useState } from 'react';

import cn from 'classnames';
import { AuthContext } from '~/providers/authContext';

import arrow from '@assets/icons/arrowItinerary.svg';
import plus from '@assets/icons/plusItinerary.svg';

import styles from './CustomDropdownItinerary.module.css';

interface CustomDropdownItineraryProps {
  selectedItem: string;
  onSelect: (item: string) => void;
  setIsAddingFolder: (isAddingFolder: boolean) => void;
  setSelectedFolder: (selectedFolder: any) => void;
}

const CustomDropdownItinerary: React.FC<CustomDropdownItineraryProps> = ({
  selectedItem,
  onSelect,
  setIsAddingFolder,
  setSelectedFolder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { firestoreUser } = useContext(AuthContext);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (item: string) => {
    onSelect(item);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <div className={styles.dropdownHeader} onClick={toggleDropdown}>
        <span className={styles.dropdownSelector}>
          Itinerary: <span className={styles.selectedOption}>{selectedItem}</span>
        </span>
        <img src={arrow} className={isOpen ? styles.arrowUp : styles.arrowDown} />
      </div>
      {isOpen && (
        <div className={styles.dropdownList}>
          <div className={styles.addNewFolder} onClick={() => setIsAddingFolder(true)}>
            <img src={plus} alt='plus' /> Add new folder
          </div>
          {firestoreUser?.itinerary.map((item) => (
            <div
              key={item.id}
              className={cn([
                styles.dropdownItem,
                selectedItem === item.name && styles.selectedOption,
              ])}
              onClick={() => {
                setSelectedFolder(item);
                handleSelect(item.name);
              }}
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdownItinerary;

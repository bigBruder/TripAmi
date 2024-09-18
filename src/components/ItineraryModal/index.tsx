import React, { useContext, useState } from 'react';
import { toast } from 'react-toastify';

import { doc, updateDoc } from 'firebase/firestore';
import { v4 as uuid } from 'uuid';
import { db } from '~/firebase';
import { AuthContext } from '~/providers/authContext';
import { IPlace } from '~/routes/AppRoutes/Posts/types';
import { Itinerary } from '~/types/user';

import arrow_back from '@assets/icons/arrow_back.svg';
import location from '@assets/icons/place_icon.svg';
import close from '@assets/icons/plus.svg';

import CustomDropdownItinerary from '../CustomDropdownItinerary';
import styles from './ItineraryModal.module.css';

interface ItineraryModalProps {
  closeModal: () => void;
  selectedItinerary: IPlace;
}

const ItineraryModal: React.FC<ItineraryModalProps> = ({ closeModal, selectedItinerary }) => {
  const { firestoreUser } = useContext(AuthContext);
  const [selectedItem, setSelectedItem] = useState(firestoreUser?.itinerary[0]?.name ?? '');
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [initiaryName, setInitiaryName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<Itinerary | null>(
    firestoreUser?.itinerary[0] || null
  );
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleSelect = (item: string) => {
    setSelectedItem(item);
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const target = e.target as HTMLDivElement;
    if (target.className.includes(styles.modalBackground)) {
      closeModal();
    }
  };

  const handleInitiaryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInitiaryName(e.target.value);
  };

  const handleAddFolder = async () => {
    if (initiaryName.trim().toLowerCase() === 'Add itinerary first'.toLowerCase()) {
      if (!toast.isActive('error')) {
        toast.error('Reserved name', { toastId: 'error' });
      }
      return;
    }

    const folderCheck = firestoreUser?.itinerary.map((item) => item.name).includes(initiaryName);
    if (folderCheck) {
      if (!toast.isActive('errorName')) {
        toast.error('Name already exists', { toastId: 'errorName' });
      }
      return;
    }

    if (initiaryName.trim() && firestoreUser?.id) {
      const itineraryHandle = async () => {
        try {
          await updateDoc(doc(db, 'users', firestoreUser?.id), {
            itinerary: [
              ...(firestoreUser?.itinerary ?? []),
              { id: uuid(), name: initiaryName, places: [], createdAt: new Date() },
            ],
          });
        } catch (e) {
          console.error('Error updating document: ', e);
        }
      };

      await itineraryHandle();
    }
  };

  const handleSavePlace = async () => {
    const folderCheckPlace = selectedFolder?.places
      .map((item) => item.placeID)
      .includes(selectedItinerary.placeID);
    if (folderCheckPlace) {
      if (!toast.isActive('error')) {
        toast.error(`This place is already in the "${selectedFolder?.name}" itinerary`, {
          toastId: 'error',
        });
      }
      return;
    }
    if (selectedFolder && selectedItinerary && firestoreUser?.id) {
      const addPlaceButton = document.getElementById('saveButton');
      if (addPlaceButton) {
        addPlaceButton.innerHTML = 'Place added';
        addPlaceButton.style.backgroundColor = '#4CAF50';
      }
      setIsButtonDisabled(true);
      const updatedItinerary = firestoreUser?.itinerary.map((item) => {
        if (item.id === selectedFolder.id) {
          return {
            ...item,
            places: [...item.places, selectedItinerary],
          };
        }
        return item;
      });

      const itineraryHandle = async () => {
        try {
          await updateDoc(doc(db, 'users', firestoreUser?.id), {
            itinerary: updatedItinerary,
          });
        } catch (e) {
          console.error('Error updating document: ', e);
        }
      };
      await itineraryHandle();
      closeModal();
      setIsButtonDisabled(false);
      if (!toast.isActive('success')) {
        toast.success('Place added to itinerary', { toastId: 'success' });
      }
    }
  };

  return (
    <div className={styles.modalBackground} onClick={handleBackgroundClick}>
      {isAddingFolder ? (
        <div className={styles.modalContent}>
          <div className={styles.topContainer}>
            <img
              src={arrow_back}
              alt='arrow_back'
              className={styles.arrow_back}
              onClick={() => setIsAddingFolder(false)}
            />
            <img
              src={close}
              alt='close'
              className={styles.closeModal}
              onClick={() => closeModal()}
            />
            <h2 className={styles.mainTitleCreate}>Create Itinerary Folder</h2>
          </div>
          <div className={styles.inputContainer}>
            <img src={location} className={styles.icon} />
            <input
              type='text'
              className={styles.input}
              placeholder='Name Itinerary Folder'
              value={initiaryName}
              onChange={handleInitiaryNameChange}
            />
          </div>
          <button
            className={styles.saveButton}
            onClick={() => {
              setIsAddingFolder(false);
              handleAddFolder();
            }}
          >
            Save place
          </button>
        </div>
      ) : (
        <div className={styles.modalContent}>
          <div className={styles.topContainer}>
            <img
              src={close}
              alt='close'
              className={styles.closeModal}
              onClick={() => closeModal()}
            />
            <h2 className={styles.mainTitle}>Add place to Itinerary</h2>
          </div>
          <p className={styles.text}>
            Add a destination to an existing itinerary or create a new one.
          </p>
          <CustomDropdownItinerary
            selectedItem={selectedItem}
            onSelect={handleSelect}
            setIsAddingFolder={setIsAddingFolder}
            setSelectedFolder={setSelectedFolder}
          />
          <button
            disabled={isButtonDisabled}
            id='saveButton'
            className={styles.saveButton}
            onClick={() => {
              handleSavePlace();
            }}
          >
            Save place
          </button>
        </div>
      )}
    </div>
  );
};

export default ItineraryModal;

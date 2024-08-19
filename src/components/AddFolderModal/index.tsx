import React, { useContext, useState } from 'react';
import { toast } from 'react-toastify';

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { v4 as uuid } from 'uuid';
import { db } from '~/firebase';
import { AuthContext } from '~/providers/authContext';

import location from '@assets/icons/place_icon.svg';

import styles from './AddFolderModal.module.css';

interface AddFolderModalProps {
  setIsAddFolderOpen: (value: boolean) => void;
  setFolder: (folder: any) => void;
}

const AddFolderModal: React.FC<AddFolderModalProps> = ({ setIsAddFolderOpen, setFolder }) => {
  const { firestoreUser } = useContext(AuthContext);
  const [initiaryName, setInitiaryName] = useState('');

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const target = e.target as HTMLDivElement;
    if (target.className.includes(styles.modalBackground)) {
      setIsAddFolderOpen(false);
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
          const itineraries = await getDoc(doc(db, 'users', firestoreUser?.id)).then(
            (doc) => doc.data()?.itinerary
          );
          setFolder(itineraries[itineraries.length - 1]);
          setIsAddFolderOpen(false);
          if (!toast.isActive('success')) {
            toast.success('Folder added successfully', { toastId: 'success' });
          }
        } catch (e) {
          console.error('Error updating document: ', e);
        }
      };

      await itineraryHandle();
    }
  };

  return (
    <div className={styles.modalBackground} onClick={handleBackgroundClick}>
      <div className={styles.modalContent}>
        <div className={styles.topContainer}>
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
            handleAddFolder();
          }}
        >
          Add Folder
        </button>
      </div>
    </div>
  );
};

export default AddFolderModal;

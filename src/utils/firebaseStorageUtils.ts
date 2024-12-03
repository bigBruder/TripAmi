import {
  deleteObject,
  getDownloadURL,
  getStorage,
  listAll,
  ref,
  uploadBytes,
} from 'firebase/storage';

export const uploadProfileImageToFirebase = async (url: string | null, userId: string) => {
  if (!url) return;

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const storage = getStorage();
    const storageRef = ref(storage, `profileImages/${userId}`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('error loading image into firestore', error);
  }
};

export const findAllProfileImages = async (userId: string) => {
  try {
    const storage = getStorage();
    const folderRef = ref(storage, `profileImages/${userId}`);
    const result = await listAll(folderRef);
    console.log('result', result);

    return result.items.map((item) => item.fullPath);
  } catch (error) {
    console.error('Error finding profile images:', error);
    return [];
  }
};

export const deleteAllProfileImages = async (userId: string) => {
  try {
    const imagePaths = await findAllProfileImages(userId);
    const deletePromises = imagePaths.map((path) => deleteObject(ref(getStorage(), path)));
    await Promise.all(deletePromises);
    console.log(`Deleted all profile images for user ${userId}`);
  } catch (error) {
    console.error('Error deleting profile images:', error);
    throw error;
  }
};

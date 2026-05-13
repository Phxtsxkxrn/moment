import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../firebase/config';

/**
 * Fetch all moments from Firestore ordered by date (descending)
 * @returns {Promise<Array>} Array of moment documents with id
 */
export const fetchAllMomentsData = async () => {
  try {
    const q = query(collection(db, 'moments'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const momentsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return momentsData;
  } catch (error) {
    console.error('Error fetching moments:', error);
    throw error;
  }
};

/**
 * Fetch a single moment by ID
 * @param {string} momentId - The moment document ID
 * @returns {Promise<Object|null>} Moment data or null if not found
 */
export const getMomentById = async (momentId) => {
  try {
    const momentDoc = await getDoc(doc(db, 'moments', momentId));
    if (momentDoc.exists()) {
      return {
        id: momentDoc.id,
        ...momentDoc.data(),
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching moment ${momentId}:`, error);
    throw error;
  }
};

/**
 * Get the Firestore query for all moments
 * Useful for real-time listeners
 * @returns {Query} Firestore query object
 */
export const getMomentsQuery = () => {
  return query(collection(db, 'moments'), orderBy('date', 'desc'));
};

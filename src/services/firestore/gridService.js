import {
  collection,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../firebase/config';

/**
 * Fetch grid settings configuration from Firestore
 * @returns {Promise<Object|null>} Grid settings object or null if not found
 */
export const getGridSettings = async () => {
  try {
    const gridDocsSnapshot = await getDocs(collection(db, 'gridSettings'));
    if (gridDocsSnapshot.empty) {
      return null;
    }
    return gridDocsSnapshot.docs[0].data();
  } catch (error) {
    console.error('Error fetching grid settings:', error);
    throw error;
  }
};

/**
 * Fetch all moments assigned to grid positions
 * @param {Object} gridSettings - Grid settings object with memoryId references
 * @returns {Promise<Object>} Object with grid keys and moment data
 * @example
 * const settings = { grid1: { memoryId: "abc123" }, ... }
 * const moments = await getGridMomentsData(settings);
 * // Returns { grid1: { id: "abc123", title: "...", ... }, ... }
 */
export const getGridMomentsData = async (gridSettings) => {
  if (!gridSettings || Object.keys(gridSettings).length === 0) {
    return {};
  }

  try {
    const momentsData = {};

    for (const [gridKey, gridData] of Object.entries(gridSettings)) {
      if (gridData && gridData.memoryId) {
        const momentDoc = await getDoc(doc(db, 'moments', gridData.memoryId));
        if (momentDoc.exists()) {
          momentsData[gridKey] = {
            id: momentDoc.id,
            ...momentDoc.data(),
          };
        }
      }
    }

    return momentsData;
  } catch (error) {
    console.error('Error fetching grid moments:', error);
    throw error;
  }
};

/**
 * Fetch grid settings and all associated moments in one operation
 * @returns {Promise<{settings: Object, moments: Object}>} Both settings and moments data
 */
export const getGridSettingsWithMoments = async () => {
  try {
    const settings = await getGridSettings();
    if (!settings) {
      return { settings: null, moments: {} };
    }
    const moments = await getGridMomentsData(settings);
    return { settings, moments };
  } catch (error) {
    console.error('Error fetching grid settings with moments:', error);
    throw error;
  }
};

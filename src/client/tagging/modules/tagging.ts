/**
 * Tagging module for device fingerprinting
 * Handles storage priority between IndexedDB and LocalStorage
 * Priority: IndexedDB > LocalStorage
 */

import { getIndexedDB, setIndexedDB } from './indexedDB';
import { 
    getLocalStorageValue, 
    setLocalStorageValue 
} from './localStorage';

const storages = process.env.STORAGES?.split(',') || ['indexedDB', 'localStorage'];



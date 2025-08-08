/**
 * IndexedDB module for device fingerprinting
 * Handles getting and setting values in browser's IndexedDB
 */

import { StorageResult } from "../utils/types";

const DB_NAME = 'indexedDB_ec';
const DB_VERSION = 3;
const STORE_NAME = 'ec';

export function getIndexedDB(name: string): Promise<string | null> {
    return new Promise((resolve) => {
        try {
            const indexedDbObj = 
                (window as any).indexedDB ||
                (window as any).mozIndexedDB ||
                (window as any).webkitIndexedDB ||
                (window as any).msIndexedDB ||
                (window as any).shimIndexedDB;

            if (indexedDbObj) {
                const request = indexedDbObj.open(DB_NAME, DB_VERSION);

                request.onerror = function () {
                    resolve(null);
                };

                request.onupgradeneeded = function (event: IDBVersionChangeEvent) {
                    try {
                        const db = (event.target as IDBOpenDBRequest).result;
                        
                        if (db.objectStoreNames.contains(STORE_NAME)) {
                            db.deleteObjectStore(STORE_NAME);
                        }
                        
                        db.createObjectStore(STORE_NAME, {
                            keyPath: "name"
                        });
                    } catch (exception) {
                        resolve(null);
                    }
                };

                request.onsuccess = function (event: Event) {
                    try {
                        const db = (event.target as IDBOpenDBRequest).result;
                        
                        if (db) {
                            const transaction = db.transaction([STORE_NAME], "readonly");

                            if (transaction.db.objectStoreNames.contains(STORE_NAME)) {
                                const store = transaction.objectStore(STORE_NAME);

                                store.get(name).onsuccess = function (innerEvent: Event) {
                                    const data = (innerEvent.target as IDBRequest).result;
                                    
                                    if (data) {
                                        resolve(data.value);
                                    } else {
                                        resolve(null);
                                    }
                                };

                                store.get(name).onerror = function () {
                                    resolve(null);
                                };
                            } else {
                                resolve(null);
                            }
                            
                            transaction.oncomplete = function () {
                                db.close();
                            };
                            
                            transaction.onerror = function () {
                                resolve(null);
                                db.close();
                            };
                            
                        } else {
                            resolve(null);
                        }
                    } catch (exception) {
                        resolve(null);
                    }
                };
            } else {
                resolve(null);
            }
        } catch (exception) {
            resolve(null);
        }
    });
}

export function setIndexedDB(name: string, value: string): Promise<boolean> {
    return new Promise((resolve) => {
        try {
            const indexedDbObj = 
                (window as any).indexedDB ||
                (window as any).mozIndexedDB ||
                (window as any).webkitIndexedDB ||
                (window as any).msIndexedDB ||
                (window as any).shimIndexedDB;

            if (indexedDbObj) {
                const request = indexedDbObj.open(DB_NAME, DB_VERSION);

                request.onerror = function () {
                    resolve(false);
                };

                request.onupgradeneeded = function (event: IDBVersionChangeEvent) {
                    try {
                        const db = (event.target as IDBOpenDBRequest).result;
                        
                        if (db.objectStoreNames.contains(STORE_NAME)) {
                            db.deleteObjectStore(STORE_NAME);
                        }
                        
                        db.createObjectStore(STORE_NAME, {
                            keyPath: "name"
                        });
                    } catch (exception) {
                        resolve(false);
                    }
                };

                request.onsuccess = function (event: Event) {
                    try {
                        const db = (event.target as IDBOpenDBRequest).result;
                        
                        if (db) {
                            const transaction = db.transaction([STORE_NAME], "readwrite");

                            if (transaction.db.objectStoreNames.contains(STORE_NAME)) {
                                const store = transaction.objectStore(STORE_NAME);

                                const putRequest = store.put({
                                    name: name,
                                    value: value
                                });

                                putRequest.onsuccess = function () {
                                    resolve(true);
                                };

                                putRequest.onerror = function () {
                                    resolve(false);
                                };
                            } else {
                                resolve(false);
                            }
                            
                            transaction.oncomplete = function () {
                                db.close();
                            };
                            
                            transaction.onerror = function () {
                                resolve(false);
                                db.close();
                            };
                            
                        } else {
                            resolve(false);
                        }
                    } catch (exception) {
                        resolve(false);
                    }
                };
            } else {
                resolve(false);
            }
        } catch (exception) {
            resolve(false);
        }
    });
}

export function isIndexedDBAvailable(): boolean {
    try {
        return !!(window.indexedDB && 
                 window.IDBTransaction && 
                 window.IDBKeyRange);
    } catch {
        return false;
    }
}

/**
 * IndexedDB module for device fingerprinting
 * Handles getting and setting values in browser's IndexedDB
 */

export class IndexedDBHandler {
    private static readonly DB_NAME = 'indexedDB_ec';
    private static readonly DB_VERSION = 3;
    private static readonly STORE_NAME = 'ec';

    public static async get(key: string): Promise<string | null> {
        return new Promise((resolve) => {
            try {
                const indexedDbObj = 
                    (window as any).indexedDB ||
                    (window as any).mozIndexedDB ||
                    (window as any).webkitIndexedDB ||
                    (window as any).msIndexedDB ||
                    (window as any).shimIndexedDB;

                if (indexedDbObj) {
                    const request = indexedDbObj.open(this.DB_NAME, this.DB_VERSION);

                    request.onerror = function () {
                        resolve(null);
                    };

                    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                        try {
                            const db = (event.target as IDBOpenDBRequest).result;
                            
                            if (db.objectStoreNames.contains(this.STORE_NAME)) {
                                db.deleteObjectStore(this.STORE_NAME);
                            }
                            
                            db.createObjectStore(this.STORE_NAME, {
                                keyPath: "name"
                            });
                        } catch (exception) {
                            resolve(null);
                        }
                    };

                    request.onsuccess = (event: Event) => {
                        try {
                            const db = (event.target as IDBOpenDBRequest).result;
                            
                            if (db) {
                                const transaction = db.transaction([this.STORE_NAME], "readonly");

                                if (transaction.db.objectStoreNames.contains(this.STORE_NAME)) {
                                    const store = transaction.objectStore(this.STORE_NAME);

                                    store.get(key).onsuccess = function (innerEvent: Event) {
                                        const data = (innerEvent.target as IDBRequest).result;
                                        
                                        if (data) {
                                            resolve(data.value);
                                        } else {
                                            resolve(null);
                                        }
                                    };

                                    store.get(key).onerror = function () {
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

    public static async set(key: string, value: string): Promise<boolean> {
        return new Promise((resolve) => {
            try {
                const indexedDbObj = 
                    (window as any).indexedDB ||
                    (window as any).mozIndexedDB ||
                    (window as any).webkitIndexedDB ||
                    (window as any).msIndexedDB ||
                    (window as any).shimIndexedDB;

                if (indexedDbObj) {
                    const request = indexedDbObj.open(this.DB_NAME, this.DB_VERSION);

                    request.onerror = function () {
                        resolve(false);
                    };

                    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                        try {
                            const db = (event.target as IDBOpenDBRequest).result;
                            
                            if (db.objectStoreNames.contains(this.STORE_NAME)) {
                                db.deleteObjectStore(this.STORE_NAME);
                            }
                            
                            db.createObjectStore(this.STORE_NAME, {
                                keyPath: "name"
                            });
                        } catch (exception) {
                            resolve(false);
                        }
                    };

                    request.onsuccess = (event: Event) => {
                        try {
                            const db = (event.target as IDBOpenDBRequest).result;
                            
                            if (db) {
                                const transaction = db.transaction([this.STORE_NAME], "readwrite");

                                if (transaction.db.objectStoreNames.contains(this.STORE_NAME)) {
                                    const store = transaction.objectStore(this.STORE_NAME);

                                    const putRequest = store.put({
                                        name: key,
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

    public static available(): boolean {
        try {
            return !!(window.indexedDB && 
                     window.IDBTransaction && 
                     window.IDBKeyRange);
        } catch {
            return false;
        }
    }
}

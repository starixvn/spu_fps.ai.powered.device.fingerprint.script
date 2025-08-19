import { IStorageHandler } from "../types";

export class IndexedDBHandler implements IStorageHandler {
    private readonly DB_NAME = 'indexedDB_ec';
    private readonly DB_VERSION = 3;
    private readonly STORE_NAME = 'ec';
    private readonly indexedDbObj: IDBFactory | null;

    constructor() {
        this.indexedDbObj = (window as any).indexedDB ||
            (window as any).mozIndexedDB ||
            (window as any).webkitIndexedDB ||
            (window as any).msIndexedDB ||
            (window as any).shimIndexedDB;
    }

    public async get(key: string): Promise<string | null> {
        return new Promise((resolve) => {
            try {
                const indexedDbObj = this.indexedDbObj;

                if (!indexedDbObj || !key) {
                    resolve(null);
                    return;
                }
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

    public async set(key: string, value: string): Promise<boolean> {
        return new Promise((resolve) => {
            try {
                const indexedDbObj = this.indexedDbObj;

                if (!indexedDbObj || !key || !value) {
                    resolve(false);
                    return;
                }

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

    public available(): boolean {
        return this.indexedDbObj !== null;
    }
}

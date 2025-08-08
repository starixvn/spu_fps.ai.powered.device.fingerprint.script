/**
 * localStorage module for device fingerprinting
 * Handles getting and setting values in browser's localStorage
 */

import { StorageResult } from "../utils/types";

export function getLocalStorageValue(name: string): StorageResult {
    try {
        const localStorageObj = window.localStorage;
        if (localStorageObj) {
            const value = localStorageObj.getItem(name);
            return {
                success: true,
                value: value || undefined
            };
        } else {
            return {
                success: false,
                error: "localStorage not supported"
            };
        }
    } catch (exception) {
        return {
            success: false,
            error: exception instanceof Error ? exception.message : "Unknown error"
        };
    }
}

export function setLocalStorageValue(name: string, value: string): StorageResult {
    try {
        const localStorageObj = window.localStorage;
        if (localStorageObj) {
            localStorageObj.setItem(name, value);
            return {
                success: true
            };
        } else {
            return {
                success: false,
                error: "localStorage not supported"
            };
        }
    } catch (exception) {
        return {
            success: false,
            error: exception instanceof Error ? exception.message : "Unknown error"
        };
    }
}

export function removeLocalStorageValue(name: string): StorageResult {
    try {
        const localStorageObj = window.localStorage;
        if (localStorageObj) {
            localStorageObj.removeItem(name);
            return {
                success: true
            };
        } else {
            return {
                success: false,
                error: "localStorage not supported"
            };
        }
    } catch (exception) {
        return {
            success: false,
            error: exception instanceof Error ? exception.message : "Unknown error"
        };
    }
}

export function isLocalStorageAvailable(): boolean {
    try {
        const test = '__localStorage_test__';
        window.localStorage.setItem(test, test);
        window.localStorage.removeItem(test);
        return true;
    } catch {
        return false;
    }
}
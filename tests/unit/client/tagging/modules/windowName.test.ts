import { WindowNameHandler } from '../../../../../src/client/tagging/modules/windowName';

// Mock window object for browser environment
const mockWindow = {
  name: '',
};

// Setup global mocks
(global as any).window = mockWindow;

describe('windowNameHandler', () => {
  let windowNameHandler: WindowNameHandler;
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window.name
    mockWindow.name = '';
    windowNameHandler = new WindowNameHandler();
  });

  describe('get', () => {
    it('should return value when window.name contains valid tag value', async () => {
      const testValue = 'valid-tag-value';
      mockWindow.name = testValue;

      const result = await windowNameHandler.get('testKey');

      expect(result).toBe(testValue);
    });

    it('should return null when window.name is empty', async () => {
      mockWindow.name = '';

      const result = await windowNameHandler.get('testKey');

      expect(result).toBeNull();
    });

    it('should return null when window.name is null', async () => {
      mockWindow.name = null as any;

      const result = await windowNameHandler.get('testKey');

      expect(result).toBeNull();
    });

    it('should return null when window.name is undefined', async () => {
      mockWindow.name = undefined as any;

      const result = await windowNameHandler.get('testKey');

      expect(result).toBeNull();
    });

    it('should return null when window is undefined', async () => {
      const originalWindow = (global as any).window;
      delete (global as any).window;

      const result = await windowNameHandler.get('testKey');

      expect(result).toBeNull();
      
      // Restore original window
      (global as any).window = originalWindow;
    });

    it('should return null when window.name contains only whitespace', async () => {
      mockWindow.name = '   \t\n   ';

      const result = await windowNameHandler.get('testKey');

      expect(result).toBeNull();
    });

    it('should return null when window.name is too long (>= 1000 characters)', async () => {
      mockWindow.name = 'a'.repeat(1000);

      const result = await windowNameHandler.get('testKey');

      expect(result).toBeNull();
    });

    it('should return value when window.name is exactly 999 characters', async () => {
      const testValue = 'a'.repeat(999);
      mockWindow.name = testValue;

      const result = await windowNameHandler.get('testKey');

      expect(result).toBe(testValue);
    });

    it('should return null when an exception occurs', async () => {
      const originalWindow = (global as any).window;
      
      // Mock window to throw an error when accessing name
      (global as any).window = {
        get name() {
          throw new Error('Access denied');
        }
      };

      const result = await windowNameHandler.get('testKey');

      expect(result).toBeNull();
      
      // Restore original window
      (global as any).window = originalWindow;
    });

    it('should handle special characters in window.name', async () => {
      const testValue = 'special-chars!@#$%^&*()';
      mockWindow.name = testValue;

      const result = await windowNameHandler.get('testKey');

      expect(result).toBe(testValue);
    });

    it('should handle numeric string values', async () => {
      const testValue = '12345';
      mockWindow.name = testValue;

      const result = await windowNameHandler.get('testKey');

      expect(result).toBe(testValue);
    });

    it('should return null when window.name is not a string', async () => {
      mockWindow.name = 123 as any;

      const result = await windowNameHandler.get('testKey');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set window.name when current value is empty', async () => {
      const testValue = 'new-tag-value';
      mockWindow.name = '';

      const result = await windowNameHandler.set('testKey', testValue);

      expect(result).toBe(true);
      expect(mockWindow.name).toBe(testValue);
    });

    it('should set window.name when current value is null', async () => {
      const testValue = 'new-tag-value';
      mockWindow.name = null as any;

      const result = await windowNameHandler.set('testKey', testValue);

      expect(result).toBe(true);
      expect(mockWindow.name).toBe(testValue);
    });

    it('should return false when window is undefined', async () => {
      const originalWindow = (global as any).window;
      delete (global as any).window;

      const result = await windowNameHandler.set('testKey', 'testValue');

      expect(result).toBe(false);
      
      // Restore original window
      (global as any).window = originalWindow;
    });

    it('should return false when value is empty', async () => {
      mockWindow.name = '';

      const result = await windowNameHandler.set('testKey', '');

      expect(result).toBe(false);
      expect(mockWindow.name).toBe('');
    });

    it('should return false when value is null', async () => {
      mockWindow.name = '';

      const result = await windowNameHandler.set('testKey', null as any);

      expect(result).toBe(false);
    });

    it('should return false when value is undefined', async () => {
      mockWindow.name = '';

      const result = await windowNameHandler.set('testKey', undefined as any);

      expect(result).toBe(false);
    });

    it('should return false when current window.name already has valid tag value', async () => {
      const existingValue = 'existing-valid-tag';
      const newValue = 'new-tag-value';
      mockWindow.name = existingValue;

      const result = await windowNameHandler.set('testKey', newValue);

      expect(result).toBe(false);
      expect(mockWindow.name).toBe(existingValue); // Should remain unchanged
    });

    it('should set window.name when current value is invalid (too long)', async () => {
      const testValue = 'new-tag-value';
      mockWindow.name = 'a'.repeat(1000); // Invalid - too long

      const result = await windowNameHandler.set('testKey', testValue);

      expect(result).toBe(true);
      expect(mockWindow.name).toBe(testValue);
    });

    it('should set window.name when current value is only whitespace', async () => {
      const testValue = 'new-tag-value';
      mockWindow.name = '   \t\n   ';

      const result = await windowNameHandler.set('testKey', testValue);

      expect(result).toBe(true);
      expect(mockWindow.name).toBe(testValue);
    });

    it('should return false when an exception occurs', async () => {
      const originalWindow = (global as any).window;
      
      // Mock window to throw an error when setting name
      const mockWindowWithError = {
        _name: '',
        get name() {
          return this._name;
        },
        set name(value: string) {
          throw new Error('Cannot set name');
        }
      };
      (global as any).window = mockWindowWithError;

      const result = await windowNameHandler.set('testKey', 'testValue');

      expect(result).toBe(false);
      
      // Restore original window
      (global as any).window = originalWindow;
    });

    it('should handle special characters in value', async () => {
      const testValue = 'special!@#$%^&*()';
      mockWindow.name = '';

      const result = await windowNameHandler.set('testKey', testValue);

      expect(result).toBe(true);
      expect(mockWindow.name).toBe(testValue);
    });

    it('should overwrite invalid current value', async () => {
      const testValue = 'valid-new-value';
      mockWindow.name = ''; // Invalid

      const result = await windowNameHandler.set('testKey', testValue);

      expect(result).toBe(true);
      expect(mockWindow.name).toBe(testValue);
    });
  });

  describe('available', () => {
    it('should return true when window.name can be read and written', () => {
      mockWindow.name = 'initial-value';

      const result = windowNameHandler.available();

      expect(result).toBe(true);
      expect(mockWindow.name).toBe('initial-value'); // Should be restored
    });

    it('should return true when window.name is initially empty', () => {
      mockWindow.name = '';

      const result = windowNameHandler.available();

      expect(result).toBe(true);
      expect(mockWindow.name).toBe(''); // Should be restored to empty
    });

    it('should return false when window is undefined', () => {
      const originalWindow = (global as any).window;
      delete (global as any).window;

      const result = windowNameHandler.available();

      expect(result).toBe(false);
      
      // Restore original window
      (global as any).window = originalWindow;
    });

    it('should restore original value after test', () => {
      const originalValue = 'original-window-name';
      mockWindow.name = originalValue;

      const result = windowNameHandler.available();

      expect(result).toBe(true);
      expect(mockWindow.name).toBe(originalValue);
    });

    it('should return false when getting window.name throws an error', () => {
      const originalWindow = (global as any).window;
      
      // Mock window to throw error when accessing name
      (global as any).window = {
        get name() {
          throw new Error('Cannot access name');
        }
      };

      const result = windowNameHandler.available();

      expect(result).toBe(false);
      
      // Restore original window
      (global as any).window = originalWindow;
    });

    it('should handle null original value correctly', () => {
      mockWindow.name = null as any;

      const result = windowNameHandler.available();

      expect(result).toBe(true);
      expect(mockWindow.name).toBe(null);
    });
  });
});
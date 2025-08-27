import { WindowNameHandler } from '../../../../../src/client/tagging/modules/windowName';

// Mock window object for browser environment
const mockWindow = {
  name: '',
  history: {
    state: {} as any,
    pushState: jest.fn(),
    replaceState: jest.fn(),
  },
  location: {
    href: 'https://test.com'
  }
};

// Setup global mocks
(global as any).window = mockWindow;

describe('windowNameHandler', () => {
  let windowNameHandler: WindowNameHandler;
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window.name and history state
    mockWindow.name = '';
    mockWindow.history.state = {};
    mockWindow.history.pushState.mockClear();
    mockWindow.history.replaceState.mockClear();
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

    // it('should return null when window.name contains only whitespace', async () => {
    //   mockWindow.name = '   \t\n   ';

    //   const result = await windowNameHandler.get('testKey');

    //   expect(result).toBeNull();
    // });

    // it('should return null when window.name is too long (>= 1000 characters)', async () => {
    //   mockWindow.name = 'a'.repeat(1000);

    //   const result = await windowNameHandler.get('testKey');

    //   expect(result).toBeNull();
    // });

    it('should return value when window.name is exactly 999 characters', async () => {
      const testValue = 'a'.repeat(999);
      mockWindow.name = testValue;

      const result = await windowNameHandler.get('testKey');

      expect(result).toBe(testValue);
    });

    it('should fallback to history.state when window.name is empty', async () => {
      const testValue = 'history-stored-value';
      mockWindow.name = '';
      mockWindow.history.state = { testKey: testValue };

      const result = await windowNameHandler.get('testKey');

      expect(result).toBe(testValue);
    });

    it('should return null when both window.name and history.state are empty', async () => {
      mockWindow.name = '';
      mockWindow.history.state = {};

      const result = await windowNameHandler.get('testKey');

      expect(result).toBeNull();
    });

    it('should prefer window.name over history.state when both exist', async () => {
      const windowValue = 'window-name-value';
      const historyValue = 'history-state-value';
      mockWindow.name = windowValue;
      mockWindow.history.state = { testKey: historyValue };

      const result = await windowNameHandler.get('testKey');

      expect(result).toBe(windowValue);
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

    // it('should return null when window.name is not a string', async () => {
    //   mockWindow.name = 123 as any;

    //   const result = await windowNameHandler.get('testKey');

    //   expect(result).toBeNull();
    // });
  });

  describe('set', () => {
    it('should set window.name when current value is empty', async () => {
      const testValue = 'new-tag-value';
      mockWindow.name = '';

      const result = await windowNameHandler.set('testKey', testValue);

      expect(result).toBe(true);
      expect(mockWindow.name).toBe(testValue);
      expect(mockWindow.history.pushState).toHaveBeenCalledWith(
        { testKey: testValue },
        "",
        "https://test.com"
      );
    });

    it('should set window.name when current value is null', async () => {
      const testValue = 'new-tag-value';
      mockWindow.name = null as any;

      const result = await windowNameHandler.set('testKey', testValue);

      expect(result).toBe(true);
      expect(mockWindow.name).toBe(testValue);
      expect(mockWindow.history.pushState).toHaveBeenCalledWith(
        { testKey: testValue },
        "",
        "https://test.com"
      );
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

    it('should set window.name when current value has valid tag but different', async () => {
      const existingValue = 'existing-valid-tag';
      const newValue = 'new-tag-value';
      mockWindow.name = existingValue;

      const result = await windowNameHandler.set('testKey', newValue);

      expect(result).toBe(true);
      expect(mockWindow.name).toBe(newValue); // Should be overwritten
      expect(mockWindow.history.pushState).toHaveBeenCalledWith(
        { testKey: newValue },
        "",
        "https://test.com"
      );
    });

    it('should set window.name when current value is invalid (too long)', async () => {
      const testValue = 'new-tag-value';
      mockWindow.name = 'a'.repeat(1000); // Invalid - too long

      const result = await windowNameHandler.set('testKey', testValue);

      expect(result).toBe(true);
      expect(mockWindow.name).toBe(testValue);
      expect(mockWindow.history.pushState).toHaveBeenCalledWith(
        { testKey: testValue },
        "",
        "https://test.com"
      );
    });

    it('should set window.name when current value is only whitespace', async () => {
      const testValue = 'new-tag-value';
      mockWindow.name = '   \t\n   ';

      const result = await windowNameHandler.set('testKey', testValue);

      expect(result).toBe(true);
      expect(mockWindow.name).toBe(testValue);
      expect(mockWindow.history.pushState).toHaveBeenCalledWith(
        { testKey: testValue },
        "",
        "https://test.com"
      );
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
        },
        history: {
          state: {},
          pushState: jest.fn(() => {
            throw new Error('Cannot pushState');
          }),
          replaceState: jest.fn(() => {
            throw new Error('Cannot replaceState');
          })
        },
        location: {
          href: 'https://test.com'
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
      expect(mockWindow.history.pushState).toHaveBeenCalledWith(
        { testKey: testValue },
        "",
        "https://test.com"
      );
    });

    it('should overwrite invalid current value', async () => {
      const testValue = 'valid-new-value';
      mockWindow.name = ''; // Invalid

      const result = await windowNameHandler.set('testKey', testValue);

      expect(result).toBe(true);
      expect(mockWindow.name).toBe(testValue);
      expect(mockWindow.history.pushState).toHaveBeenCalledWith(
        { testKey: testValue },
        "",
        "https://test.com"
      );
    });

    it('should preserve existing history state', async () => {
      const testValue = 'new-tag-value';
      mockWindow.name = '';
      mockWindow.history.state = { existingKey: 'existingValue' };

      const result = await windowNameHandler.set('testKey', testValue);

      expect(result).toBe(true);
      expect(mockWindow.name).toBe(testValue);
      expect(mockWindow.history.pushState).toHaveBeenCalledWith(
        { existingKey: 'existingValue', testKey: testValue },
        "",
        "https://test.com"
      );
    });

    it('should use replaceState when key already exists in history state', async () => {
      const testValue = 'updated-tag-value';
      mockWindow.name = '';
      mockWindow.history.state = { testKey: 'old-value', otherKey: 'otherValue' };

      const result = await windowNameHandler.set('testKey', testValue);

      expect(result).toBe(true);
      expect(mockWindow.name).toBe(testValue);
      expect(mockWindow.history.replaceState).toHaveBeenCalledWith(
        { testKey: testValue, otherKey: 'otherValue' },
        "",
        "https://test.com"
      );
      expect(mockWindow.history.pushState).not.toHaveBeenCalled();
    });

    it('should use pushState when key does not exist in history state', async () => {
      const testValue = 'new-tag-value';
      mockWindow.name = '';
      mockWindow.history.state = { existingKey: 'existingValue' };

      const result = await windowNameHandler.set('newKey', testValue);

      expect(result).toBe(true);
      expect(mockWindow.name).toBe(testValue);
      expect(mockWindow.history.pushState).toHaveBeenCalledWith(
        { existingKey: 'existingValue', newKey: testValue },
        "",
        "https://test.com"
      );
      expect(mockWindow.history.replaceState).not.toHaveBeenCalled();
    });
  });

  describe('available', () => {
    it('should return true when window is available', () => {
      const result = windowNameHandler.available();

      expect(result).toBe(true);
    });

    it('should return false when window is undefined', () => {
      const originalWindow = (global as any).window;
      delete (global as any).window;

      const result = windowNameHandler.available();

      expect(result).toBe(false);
      
      // Restore original window
      (global as any).window = originalWindow;
    });

    it('should return false when an exception occurs', () => {
      const originalWindow = (global as any).window;
      
      // Mock to throw error when checking window
      Object.defineProperty(global, 'window', {
        get() {
          throw new Error('Cannot access window');
        },
        configurable: true
      });

      const result = windowNameHandler.available();

      expect(result).toBe(false);
      
      // Restore original window properly
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        configurable: true,
        writable: true
      });
    });
  });
});
/**
 * @jest-environment jsdom
 */

import { collectTouchSupport } from '../../../../../../src/client/fingerprint/modules/preference/touchSupport';

describe('Touch Support Module', () => {
  beforeEach(() => {
    // Reset navigator properties
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: undefined
    });

    delete (navigator as any).msMaxTouchPoints;

    // Reset window.ontouchstart
    delete (window as any).ontouchstart;

    // Reset document.createEvent
    document.createEvent = Document.prototype.createEvent;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('collectTouchSupport', () => {
    it('should return array format [maxTouchPoints, touchEvent, touchStart]', () => {
      // Arrange
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 5
      });

      // Mock TouchEvent support
      document.createEvent = jest.fn().mockImplementation((eventType) => {
        if (eventType === 'TouchEvent') {
          return {}; // Successfully created TouchEvent
        }
        throw new Error('Event type not supported');
      });

      // Mock ontouchstart
      (window as any).ontouchstart = null;

      // Act
      const result = collectTouchSupport();

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      expect(result).toEqual([5, 1, 1]); // [maxTouchPoints, touchEvent, touchStart]
    });

    it('should handle no touch support correctly', () => {
      // Arrange - No touch support
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 0
      });

      // Mock TouchEvent not supported
      document.createEvent = jest.fn().mockImplementation((eventType) => {
        if (eventType === 'TouchEvent') {
          throw new Error('TouchEvent not supported');
        }
        return {};
      });

      // No ontouchstart property
      delete (window as any).ontouchstart;

      // Act
      const result = collectTouchSupport();

      // Assert
      expect(result).toEqual([0, 0, 0]); // No touch support
    });

    it('should detect maxTouchPoints correctly', () => {
      // Test different maxTouchPoints values
      const touchPointValues = [0, 1, 2, 5, 10, 255];

      for (const touchPoints of touchPointValues) {
        // Arrange
        Object.defineProperty(navigator, 'maxTouchPoints', {
          writable: true,
          configurable: true,
          value: touchPoints
        });

        // Act
        const result = collectTouchSupport();

        // Assert
        expect((result as number[])[0]).toBe(touchPoints); // maxTouchPoints is first element
        expect(typeof (result as number[])[0]).toBe('number');
      }
    });

    it('should fallback to msMaxTouchPoints when maxTouchPoints is undefined', () => {
      // Arrange
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: undefined
      });

      (navigator as any).msMaxTouchPoints = 8;

      // Act
      const result = collectTouchSupport();

      // Assert
      expect((result as number[])[0]).toBe(8); // Should use msMaxTouchPoints
    });

    it('should default to 0 when both maxTouchPoints and msMaxTouchPoints are undefined', () => {
      // Arrange
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: undefined
      });

      delete (navigator as any).msMaxTouchPoints;

      // Act
      const result = collectTouchSupport();

      // Assert
      expect((result as number[])[0]).toBe(0); // Should default to 0
    });

    it('should detect TouchEvent support correctly', () => {
      // Test TouchEvent supported
      document.createEvent = jest.fn().mockImplementation((eventType) => {
        if (eventType === 'TouchEvent') {
          return {}; // Successfully created
        }
        throw new Error('Not supported');
      });

      const result1 = collectTouchSupport();
      expect((result1 as number[])[1]).toBe(1); // touchEvent supported

      // Test TouchEvent not supported
      document.createEvent = jest.fn().mockImplementation((eventType) => {
        if (eventType === 'TouchEvent') {
          throw new Error('TouchEvent not supported');
        }
        return {};
      });

      const result2 = collectTouchSupport();
      expect((result2 as number[])[1]).toBe(0); // touchEvent not supported
    });

    it('should detect ontouchstart property correctly', () => {
      // Test ontouchstart exists
      (window as any).ontouchstart = null;
      const result1 = collectTouchSupport();
      expect((result1 as number[])[2]).toBe(1); // touchStart supported

      // Test ontouchstart exists with function
      (window as any).ontouchstart = function() {};
      const result2 = collectTouchSupport();
      expect((result2 as number[])[2]).toBe(1); // touchStart supported

      // Test ontouchstart doesn't exist
      delete (window as any).ontouchstart;
      const result3 = collectTouchSupport();
      expect((result3 as number[])[2]).toBe(0); // touchStart not supported
    });

    it('should handle errors gracefully and return fallback values', () => {
      // Arrange - Simulate error in navigator access
      const originalNavigator = global.navigator;
      Object.defineProperty(global, 'navigator', {
        get: () => { throw new Error('Navigator access denied'); },
        configurable: true
      });

      // Act
      const result = collectTouchSupport();

      // Assert
      expect(result).toEqual([0, 0, 0]); // Fallback values

      // Restore navigator
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true
      });
    });

    it('should handle string maxTouchPoints values correctly', () => {
      // Arrange - Test string values that should be converted to numbers
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: '10' // String value
      });

      // Act
      const result = collectTouchSupport();

      // Assert
      expect((result as number[])[0]).toBe(10); // Should convert string to number
      expect(typeof (result as number[])[0]).toBe('number');
    });

    it('should handle invalid maxTouchPoints values correctly', () => {
      // Test various invalid values
      const invalidValues = [null, undefined, NaN, 'not a number', {}, []];

      for (const invalidValue of invalidValues) {
        // Arrange
        if (invalidValue === undefined) {
          Object.defineProperty(navigator, 'maxTouchPoints', {
            writable: true,
            configurable: true,
            value: undefined
          });
        } else {
          Object.defineProperty(navigator, 'maxTouchPoints', {
            writable: true,
            configurable: true,
            value: invalidValue
          });
        }

        delete (navigator as any).msMaxTouchPoints;

        // Act
        const result = collectTouchSupport();

        // Assert
        expect(typeof (result as number[])[0]).toBe('number');
        // Should handle gracefully, either convert to 0 or handle error
      }
    });

    it('should handle document.createEvent errors gracefully', () => {
      // Arrange
      document.createEvent = jest.fn().mockImplementation(() => {
        throw new Error('createEvent completely broken');
      });

      // Act
      const result = collectTouchSupport();

      // Assert
      expect((result as number[])[1]).toBe(0); // Should default to 0 when createEvent fails
    });

    it('should return consistent types', () => {
      // Arrange
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 5
      });

      // Act
      const result = collectTouchSupport();

      // Assert
      expect(typeof (result as number[])[0]).toBe('number'); // maxTouchPoints
      expect(typeof (result as number[])[1]).toBe('number'); // touchEvent
      expect(typeof (result as number[])[2]).toBe('number'); // touchStart
      expect([0, 1]).toContain((result as number[])[1]); // touchEvent is bit
      expect([0, 1]).toContain((result as number[])[2]); // touchStart is bit
    });

    it('should handle edge case with 0 maxTouchPoints but touch events supported', () => {
      // Arrange - Device with 0 touch points but touch events work
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 0
      });

      document.createEvent = jest.fn().mockImplementation((eventType) => {
        if (eventType === 'TouchEvent') {
          return {}; // TouchEvent supported
        }
        throw new Error('Not supported');
      });

      (window as any).ontouchstart = null; // touchstart supported

      // Act
      const result = collectTouchSupport();

      // Assert
      expect(result).toEqual([0, 1, 1]); // 0 touch points but events supported
    });

    it('should handle high maxTouchPoints values', () => {
      // Arrange
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 255
      });

      // Act
      const result = collectTouchSupport();

      // Assert
      expect((result as number[])[0]).toBe(255);
      expect((result as number[])[0]).toBeGreaterThan(0);
    });
  });
});


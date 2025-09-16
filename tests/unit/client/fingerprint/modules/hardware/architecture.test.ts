import { collectArchitecture } from '../../../../../../src/client/fingerprint/modules/hardware/architecture';

describe('Hardware Architecture Module', () => {
  describe('collectArchitecture', () => {
    it('should return 255 for standard x86 systems', () => {
      // Act
      const result = collectArchitecture();

      // Assert
      // Current implementation uses Float32Array byte manipulation to detect x86 architecture
      // In most test environments, this should return 255 for x86/x86_64
      expect(result).toEqual({ architecture: 255 });
    });

    it('should handle errors gracefully and return 0', () => {
      // Arrange - Mock Float32Array to throw an error
      const originalFloat32Array = global.Float32Array;
      (global as any).Float32Array = jest.fn().mockImplementation(() => {
        throw new Error('Float32Array not supported');
      });

      // Act
      const result = collectArchitecture();

      // Assert
      expect(result).toEqual({ architecture: 0 });

      // Cleanup
      global.Float32Array = originalFloat32Array;
    });

    it('should handle Uint8Array errors gracefully', () => {
      // Arrange - Mock Uint8Array to throw an error
      const originalUint8Array = global.Uint8Array;
      (global as any).Uint8Array = jest.fn().mockImplementation(() => {
        throw new Error('Uint8Array not supported');
      });

      // Act
      const result = collectArchitecture();

      // Assert
      expect(result).toEqual({ architecture: 0 });

      // Cleanup
      global.Uint8Array = originalUint8Array;
    });

    it('should return consistent results when called multiple times', () => {
      // Act
      const result1 = collectArchitecture();
      const result2 = collectArchitecture();
      const result3 = collectArchitecture();

      // Assert
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
      expect(typeof result1.architecture).toBe('number');
    });

    it('should return number for architecture value', () => {
      // Act
      const result = collectArchitecture();

      // Assert
      expect(typeof result.architecture).toBe('number');
      // Architecture should be a number (typically 255 for x86, or 0 on error)
      expect(result.architecture).toBeGreaterThanOrEqual(0);
      expect(result.architecture).toBeLessThanOrEqual(255);
    });
  });
});
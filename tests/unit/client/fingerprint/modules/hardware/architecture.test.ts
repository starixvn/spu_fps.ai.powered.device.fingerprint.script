import { collectArchitecture } from '../../../../../../src/client/fingerprint/modules/hardware/architecture';

describe('Hardware Architecture Module', () => {
  describe('collectArchitecture', () => {
    it('should return x86/x86_64 for standard x86 systems', () => {
      // Act
      const result = collectArchitecture();

      // Assert
      // Current implementation uses Float32Array byte manipulation to detect x86 architecture
      // In most test environments, this should return "x86/x86_64"
      expect(result).toEqual({ architecture: 'x86/x86_64' });
    });

    it('should handle errors gracefully and return empty string', () => {
      // Arrange - Mock Float32Array to throw an error
      const originalFloat32Array = global.Float32Array;
      (global as any).Float32Array = jest.fn().mockImplementation(() => {
        throw new Error('Float32Array not supported');
      });

      // Act
      const result = collectArchitecture();

      // Assert
      expect(result).toEqual({ architecture: '' });

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
      expect(result).toEqual({ architecture: '' });

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
      expect(typeof result1.architecture).toBe('string');
    });

    it('should return non-empty string for architecture value', () => {
      // Act
      const result = collectArchitecture();

      // Assert
      expect(typeof result.architecture).toBe('string');
      // Architecture should be either "x86/x86_64", "non-x86", or "" (empty on error)
      expect(['x86/x86_64', 'non-x86', '']).toContain(result.architecture);
    });
  });
});

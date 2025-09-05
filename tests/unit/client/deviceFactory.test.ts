// Mock dependencies before imports
jest.mock('../../../src/client/utils/hash', () => ({
  GuidGenerator: {
    generateGuid: jest.fn()
  },
  PacketTransformer: {
    wrapMessage: jest.fn(),
    unwrapMessage: jest.fn()
  }
}));

// Import the mocked modules
import { GuidGenerator, PacketTransformer } from '../../../src/client/utils/hash';
import { DeviceFactory } from '../../../src/client/deviceFactory';

// Get mocked instances
const mockGuidGenerator = GuidGenerator as any;
const mockPacketTransformer = PacketTransformer as any;

describe('DeviceFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateId', () => {
    it('should generate a GUID', () => {
      // Arrange
      const mockGuid = 'a1b2c3d4e5f6789012345678901234ab';
      
      mockGuidGenerator.generateGuid.mockReturnValue(mockGuid);

      // Act
      const result = DeviceFactory.generateId();

      // Assert
      expect(mockGuidGenerator.generateGuid).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockGuid);
    });

    it('should return the raw GUID from GuidGenerator', () => {
      // Arrange
      const mockGuid = '12345678901234567890123456789012';
      
      mockGuidGenerator.generateGuid.mockReturnValue(mockGuid);

      // Act
      const result = DeviceFactory.generateId();

      // Assert
      expect(result).toBe(mockGuid);
    });
  });

  describe('generateTagging', () => {
    it('should generate and encrypt a GUID', () => {
      // Arrange
      const mockGuid = 'a1b2c3d4e5f6789012345678901234ab';
      const mockEncryptedGuid = 'encrypted-guid-value';
      
      mockGuidGenerator.generateGuid.mockReturnValue(mockGuid);
      mockPacketTransformer.wrapMessage.mockReturnValue(mockEncryptedGuid);

      // Act
      const result = DeviceFactory.generateTagging();

      // Assert
      expect(mockGuidGenerator.generateGuid).toHaveBeenCalledTimes(1);
      expect(mockPacketTransformer.wrapMessage).toHaveBeenCalledWith(mockGuid);
      expect(result).toBe(mockEncryptedGuid);
    });

    it('should return the wrapped message from PacketTransformer', () => {
      // Arrange
      const mockGuid = '12345678901234567890123456789012';
      const mockEncryptedGuid = 'different-encrypted-value';
      
      mockGuidGenerator.generateGuid.mockReturnValue(mockGuid);
      mockPacketTransformer.wrapMessage.mockReturnValue(mockEncryptedGuid);

      // Act
      const result = DeviceFactory.generateTagging();

      // Assert
      expect(result).toBe(mockEncryptedGuid);
    });
  });

  describe('isValidTagging', () => {
    it('should return true for valid encrypted GUID', () => {
      // Arrange
      const validTagging = 'valid-encrypted-tagging';
      const validGuid = 'a1b2c3d4e5f67890a1b2c3d4e5f67890'; // 32 hex characters
      
      mockPacketTransformer.unwrapMessage.mockReturnValue(validGuid);

      // Act
      const result = DeviceFactory.isValidTagging(validTagging);

      // Assert
      expect(mockPacketTransformer.unwrapMessage).toHaveBeenCalledWith(validTagging);
      expect(result).toBe(true);
    });

    it('should return false for invalid GUID after decryption', () => {
      // Arrange
      const invalidTagging = 'invalid-encrypted-tagging';
      const invalidGuid = 'not-a-valid-guid-format';
      
      mockPacketTransformer.unwrapMessage.mockReturnValue(invalidGuid);

      // Act
      const result = DeviceFactory.isValidTagging(invalidTagging);

      // Assert
      expect(mockPacketTransformer.unwrapMessage).toHaveBeenCalledWith(invalidTagging);
      expect(result).toBe(false);
    });

    it('should return false for empty tagging value', () => {
      // Act & Assert
      expect(DeviceFactory.isValidTagging('')).toBe(false);
      expect(DeviceFactory.isValidTagging('   ')).toBe(false);
      expect(mockPacketTransformer.unwrapMessage).not.toHaveBeenCalled();
    });

    it('should return false for null or undefined tagging value', () => {
      // Act & Assert
      expect(DeviceFactory.isValidTagging(null as any)).toBe(false);
      expect(DeviceFactory.isValidTagging(undefined as any)).toBe(false);
      expect(mockPacketTransformer.unwrapMessage).not.toHaveBeenCalled();
    });

    it('should return false when PacketTransformer throws an error', () => {
      // Arrange
      const invalidTagging = 'invalid-encrypted-data';
      mockPacketTransformer.unwrapMessage.mockImplementation(() => {
        throw new Error('Decryption failed');
      });

      // Act
      const result = DeviceFactory.isValidTagging(invalidTagging);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true for valid GUID with mixed case hex characters', () => {
      // Arrange
      const validTagging = 'valid-encrypted-tagging';
      const validGuid = 'A1B2C3D4E5F67890a1b2c3d4e5f67890'; // Mixed case 32 hex chars
      
      mockPacketTransformer.unwrapMessage.mockReturnValue(validGuid);

      // Act
      const result = DeviceFactory.isValidTagging(validTagging);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for GUID with invalid characters', () => {
      // Arrange
      const invalidTagging = 'invalid-encrypted-tagging';
      const invalidGuid = 'g1h2i3j4k5l67890m1n2o3p4q5r67890'; // Contains non-hex chars
      
      mockPacketTransformer.unwrapMessage.mockReturnValue(invalidGuid);

      // Act
      const result = DeviceFactory.isValidTagging(invalidTagging);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for GUID with wrong length', () => {
      // Arrange
      const invalidTagging = 'invalid-encrypted-tagging';
      const shortGuid = 'a1b2c3d4e5f67890'; // Only 16 characters
      
      mockPacketTransformer.unwrapMessage.mockReturnValue(shortGuid);

      // Act
      const result = DeviceFactory.isValidTagging(invalidTagging);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when unwrapMessage returns empty string', () => {
      // Arrange
      const invalidTagging = 'encrypted-empty-data';
      mockPacketTransformer.unwrapMessage.mockReturnValue('');

      // Act
      const result = DeviceFactory.isValidTagging(invalidTagging);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when unwrapMessage returns null', () => {
      // Arrange
      const invalidTagging = 'encrypted-null-data';
      mockPacketTransformer.unwrapMessage.mockReturnValue(null);

      // Act
      const result = DeviceFactory.isValidTagging(invalidTagging);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should generate valid tagging that passes validation', () => {
      // Arrange
      const originalGuid = 'a1b2c3d4e5f67890a1b2c3d4e5f67890';
      const encryptedTagging = 'encrypted-tagging-value';
      
      // Mock generateTagging flow
      mockGuidGenerator.generateGuid.mockReturnValue(originalGuid);
      mockPacketTransformer.wrapMessage.mockReturnValue(encryptedTagging);
      
      // Mock isValidTagging flow
      mockPacketTransformer.unwrapMessage.mockReturnValue(originalGuid);

      // Act
      const generatedTagging = DeviceFactory.generateTagging();
      const isValid = DeviceFactory.isValidTagging(generatedTagging);

      // Assert
      expect(generatedTagging).toBe(encryptedTagging);
      expect(isValid).toBe(true);
    });

    it('should handle round-trip encryption/decryption correctly', () => {
      // Arrange
      const originalGuid = '12345678901234567890123456789012';
      const encryptedData = 'some-encrypted-representation';
      
      mockGuidGenerator.generateGuid.mockReturnValue(originalGuid);
      mockPacketTransformer.wrapMessage.mockReturnValue(encryptedData);
      mockPacketTransformer.unwrapMessage.mockReturnValue(originalGuid);

      // Act
      const encrypted = DeviceFactory.generateTagging();
      const isValidAfterDecryption = DeviceFactory.isValidTagging(encrypted);

      // Assert
      expect(encrypted).toBe(encryptedData);
      expect(isValidAfterDecryption).toBe(true);
      expect(mockPacketTransformer.wrapMessage).toHaveBeenCalledWith(originalGuid);
      expect(mockPacketTransformer.unwrapMessage).toHaveBeenCalledWith(encryptedData);
    });
  });
});

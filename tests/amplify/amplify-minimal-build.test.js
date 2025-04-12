const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mock fs and execSync
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  copyFileSync: jest.fn(),
  rmSync: jest.fn(),
  readdirSync: jest.fn(),
  statSync: jest.fn(),
}));

jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

// Import the module after mocking
const amplifyMinimalBuild = require('../../scripts/amplify-minimal-build');

describe('Amplify Minimal Build', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock fs.existsSync to return false by default
    fs.existsSync.mockReturnValue(false);
    
    // Mock fs.statSync to return a directory by default
    fs.statSync.mockReturnValue({
      isDirectory: () => true,
    });
    
    // Mock execSync to return success by default
    execSync.mockReturnValue('');
  });
  
  describe('createRequiredFiles', () => {
    it('should create required files in all locations', () => {
      // Call the function
      amplifyMinimalBuild.createRequiredFiles();
      
      // Check that the required files were created
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('required-server-files.json'),
        expect.any(String)
      );
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('routes-manifest.json'),
        expect.any(String)
      );
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('build-manifest.json'),
        expect.any(String)
      );
    });
    
    it('should copy files to out/.next directory', () => {
      // Mock fs.existsSync to return true for the out directory
      fs.existsSync.mockImplementation((path) => {
        return path.includes('out');
      });
      
      // Call the function
      amplifyMinimalBuild.createRequiredFiles();
      
      // Check that the files were copied
      expect(fs.copyFileSync).toHaveBeenCalled();
    });
  });
  
  describe('buildNextApp', () => {
    it('should build the Next.js app', async () => {
      // Mock execSync to return success
      execSync.mockReturnValue('');
      
      // Call the function
      const result = await amplifyMinimalBuild.buildNextApp();
      
      // Check that the build command was executed
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('next build'),
        expect.any(Object)
      );
      
      // Check that the function returned true
      expect(result).toBe(true);
    });
    
    it('should handle build failures', async () => {
      // Mock execSync to throw an error
      execSync.mockImplementation(() => {
        throw new Error('Mock error');
      });
      
      // Mock createRequiredFiles to do nothing
      jest.spyOn(amplifyMinimalBuild, 'createRequiredFiles').mockImplementation(() => {});
      
      // Call the function
      const result = await amplifyMinimalBuild.buildNextApp();
      
      // Check that createRequiredFiles was called
      expect(amplifyMinimalBuild.createRequiredFiles).toHaveBeenCalled();
      
      // Check that the function returned true despite the error
      expect(result).toBe(true);
    });
  });
});

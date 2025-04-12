const fs = require('fs');
const path = require('path');

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

// Store the original console.log
const originalConsoleLog = console.log;

describe('Amplify Fix Required Files', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock fs.existsSync to return false by default
    fs.existsSync.mockReturnValue(false);
    
    // Mock console.log to prevent output during tests
    console.log = jest.fn();
  });
  
  afterEach(() => {
    // Restore console.log
    console.log = originalConsoleLog;
  });
  
  it('should create directories if they don\'t exist', () => {
    // Run the script
    require('../../scripts/amplify-fix-required-files');
    
    // Check that mkdirSync was called for each location
    expect(fs.mkdirSync).toHaveBeenCalledTimes(8);
    
    // Check that it was called with the correct parameters
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining('.next'),
      { recursive: true }
    );
    
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining('out'),
      { recursive: true }
    );
  });
  
  it('should write required files to all locations', () => {
    // Run the script
    require('../../scripts/amplify-fix-required-files');
    
    // Check that writeFileSync was called for each file in each location
    expect(fs.writeFileSync).toHaveBeenCalledTimes(24); // 3 files * 8 locations
    
    // Check that it was called with the correct parameters for required-server-files.json
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('required-server-files.json'),
      expect.stringContaining('"version": 1')
    );
    
    // Check that it was called with the correct parameters for routes-manifest.json
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('routes-manifest.json'),
      expect.stringContaining('"version": 3')
    );
    
    // Check that it was called with the correct parameters for build-manifest.json
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('build-manifest.json'),
      expect.stringContaining('"polyfillFiles": []')
    );
  });
  
  it('should log progress', () => {
    // Run the script
    require('../../scripts/amplify-fix-required-files');
    
    // Check that console.log was called
    expect(console.log).toHaveBeenCalled();
    
    // Check that it logged the start message
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Fixing required files for Amplify Gen 2 deployment')
    );
    
    // Check that it logged the completion message
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('All required files have been created in all possible locations')
    );
  });
});

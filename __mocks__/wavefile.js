// Mock for wavefile module
module.exports = {
  WaveFile: jest.fn().mockImplementation(() => ({
    fromBuffer: jest.fn(),
    toBuffer: jest.fn(),
    getSamples: jest.fn(),
    setSamples: jest.fn(),
    getBitDepth: jest.fn(),
    getSampleRate: jest.fn(),
    getChannels: jest.fn(),
    getDuration: jest.fn(),
  })),
};

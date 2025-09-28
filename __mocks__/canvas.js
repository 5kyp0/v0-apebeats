// Mock for canvas module
module.exports = {
  createCanvas: jest.fn(() => ({
    getContext: jest.fn(() => ({
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      arc: jest.fn(),
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
    })),
    width: 400,
    height: 200,
  })),
  loadImage: jest.fn(),
};

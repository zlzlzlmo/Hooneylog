import CategoryImage from '../../categoryImage/categoryImage';

describe('category image', () => {
  test('get proper image src for category', () => {
    const categoryImageSrc = new CategoryImage('next.js').src;
    expect(categoryImageSrc).toBe('/images/nextjs.png');
  });
});

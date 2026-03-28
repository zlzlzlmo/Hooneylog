class CategoryImage {
  constructor(private readonly category: string) {}

  get src() {
    return `/images/${this.replaceDotWithBlank}.png`;
  }

  private get replaceDotWithBlank() {
    return this.category.replace(/\./gi, '');
  }
}

export default CategoryImage;

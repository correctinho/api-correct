import { CategoryEntity } from '../categories.entity';

describe('Unity test Categories entity', () => {
  it('Should throw an error if name is missing', async () => {
    const input = {
      name: '',
      description: 'Category description',
    };

    expect(() => {
      CategoryEntity.create(input);
    }).toThrow('Name is required');
  });

  it('Should create category', async () => {
    const input = {
      name: 'Category name',
      description: 'Category description',
    };

    const category = CategoryEntity.create(input);

    expect(category._name).toBe('Category name');
    expect(category._description).toBe('Category description');
    expect(category._is_active).toBe(true);
    expect(category._created_at).toBeTruthy();
  });

  it('Should update category name', async () => {
    const input = {
      name: 'Category name',
      description: '',
    };

    const category = CategoryEntity.create(input);
    category.changeName('New name');
    expect(category._name).toBe('New name');
    expect(category._description).toBeFalsy();
    expect(category._is_active).toBe(true);
  });

  it('Should update category description', async () => {
    const input = {
      name: 'Category name',
      description: '',
    };

    const category = CategoryEntity.create(input);
    category.changeDescription('New description');
    expect(category._name).toBe('Category name');
    expect(category._description).toBe('New description');
    expect(category._is_active).toBe(true);
  });
  it('Should deactivate category', async () => {
    const input = {
      name: 'Category name',
      description: '',
    };

    const category = CategoryEntity.create(input);
    category.deactivate();
    expect(category._name).toBe('Category name');
    expect(category._description).toBeFalsy();
    expect(category._is_active).toBe(false);
  });
});

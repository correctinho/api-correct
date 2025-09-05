import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo.ts';
import { CategoryCreateCommand, CategoryEntity } from '../categories.entity.ts'

// Mock da função de data para garantir que os testes sejam determinísticos
jest.mock('../../../../../utils/date', () => ({
  newDateF: () => '2025-08-20T12:00:00',
}));

describe('CategoryEntity Unit Tests', () => {

  const validCommand: CategoryCreateCommand = {
    name: 'Eletrônicos',
    description: 'Dispositivos eletrônicos e acessórios.',
  };

  describe('Criação (Create e Hydrate)', () => {
    it('deve criar uma nova entidade com valores padrão corretos', () => {
      const entity = CategoryEntity.create({ name: 'Livros' });

      expect(entity.uuid).toBeInstanceOf(Uuid);
      expect(entity.name).toBe('Livros');
      expect(entity.description).toBeNull();
      expect(entity.is_active).toBe(true);
      expect(entity.created_at).toBe('2025-08-20T12:00:00');
    });

    it('deve criar uma entidade com todos os valores fornecidos', () => {
      const entity = CategoryEntity.create({ ...validCommand, is_active: false });

      expect(entity.name).toBe('Eletrônicos');
      expect(entity.description).toBe('Dispositivos eletrônicos e acessórios.');
      expect(entity.is_active).toBe(false);
    });

    it('deve reconstruir (hydrate) uma entidade corretamente', () => {
      const uuid = new Uuid();
      const date = '2025-08-20T12:00:00';
      const entity = CategoryEntity.hydrate({
        uuid,
        name: 'Roupas',
        is_active: false,
        created_at: date,
        updated_at: date,
      });

      expect(entity.uuid).toBe(uuid);
      expect(entity.name).toBe('Roupas');
      expect(entity.is_active).toBe(false);
    });
  });

  describe('Validações', () => {
    it('deve lançar um erro se o nome for vazio', () => {
      expect(() => {
        CategoryEntity.create({ name: '' });
      }).toThrow('Name is required and must be a string.');
    });

    it('deve lançar um erro se o nome não for uma string', () => {
      expect(() => {
        CategoryEntity.create({ name: 123 as any });
      }).toThrow('Name is required and must be a string.');
    });
  });

  describe('Métodos de Alteração de Estado', () => {
    it('changeName deve atualizar o nome e a data de atualização', () => {
      const entity = CategoryEntity.create(validCommand);
      entity.changeName('Tecnologia');
      expect(entity.name).toBe('Tecnologia');
      expect(entity.updated_at).toBe('2025-08-20T12:00:00');
    });

    it('changeDescription deve atualizar a descrição', () => {
      const entity = CategoryEntity.create(validCommand);
      entity.changeDescription('Nova descrição');
      expect(entity.description).toBe('Nova descrição');
    });

    it('activate deve definir is_active como true e atualizar data', () => {
      const entity = CategoryEntity.create({ ...validCommand, is_active: false });
      entity.activate();
      expect(entity.is_active).toBe(true);
      expect(entity.updated_at).toBe('2025-08-20T12:00:00');
    });

    it('deactivate deve definir is_active como false e atualizar data', () => {
      const entity = CategoryEntity.create(validCommand);
      entity.deactivate();
      expect(entity.is_active).toBe(false);
      expect(entity.updated_at).toBe('2025-08-20T12:00:00');
    });
  });

  describe('Método toJSON', () => {
    it('deve retornar um objeto simples com os dados brutos da entidade', () => {
      const entity = CategoryEntity.create(validCommand);
      const json = entity.toJSON();

      expect(typeof json.uuid).toBe('string');
      expect(json.name).toBe('Eletrônicos');
      expect(json.description).toBe('Dispositivos eletrônicos e acessórios.');
      expect(json.is_active).toBe(true);
    });
  });
});

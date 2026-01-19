import { IAreaRepository } from '@/src/domain/interfaces/IAreaRepository';
import { Area } from '@/src/domain/entities/Area';

export class MockAreaRepository implements IAreaRepository {
  private areas: Area[] = [
    new Area(1, 'OPERACIONES', 'OPERADORES DE CALL CENTER'),
    new Area(2, 'SISTEMAS', 'PERSONAL DE TECNOLOGÍA'),
    new Area(3, 'ADMINISTRATIVA', 'ÁREA ADMINISTRATIVA'),
    new Area(4, 'OTRAS ÁREAS', 'OTROS'),
  ];

  async getAll(): Promise<Area[]> {
    return Promise.resolve([...this.areas]);
  }

  async getById(id: number): Promise<Area | null> {
    const area = this.areas.find((a) => a.id === id);
    return Promise.resolve(area || null);
  }
}

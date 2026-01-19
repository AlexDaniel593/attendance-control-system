import { Area } from '../entities/Area';

export interface IAreaRepository {
  getAll(): Promise<Area[]>;
  getById(id: number): Promise<Area | null>;
}

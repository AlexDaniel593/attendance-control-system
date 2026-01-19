import { IAreaRepository } from '@/src/domain/interfaces/IAreaRepository';
import { Area } from '@/src/domain/entities/Area';

export class GetAllAreasUseCase {
  constructor(private areaRepository: IAreaRepository) {}

  async execute(): Promise<Area[]> {
    return await this.areaRepository.getAll();
  }
}

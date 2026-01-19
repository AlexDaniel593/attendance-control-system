export interface AreaData {
  id: number;
  nombre: string;
  descripcion: string;
}

export class Area {
  constructor(
    public id: number,
    public nombre: string,
    public descripcion: string
  ) {}

  get nombreCompleto(): string {
    return `${this.nombre} - ${this.descripcion}`;
  }
}

import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WARRIOR_NOMBRE_DISPLAY_BY_SLUG } from '../config/warrior-latam-names';
import { Warrior } from './schemas/warrior.schema';

/**
 * Sincroniza `nombre` en DB con el mapa de español latino (correcciones
 * p. ej. Celula → Cell) sin requerir re-seed manual.
 */
@Injectable()
export class WarriorDisplayNameSyncService implements OnModuleInit {
  constructor(
    @InjectModel(Warrior.name) private readonly warriorModel: Model<Warrior>,
  ) {}

  async onModuleInit() {
    const entries = Object.entries(WARRIOR_NOMBRE_DISPLAY_BY_SLUG);
    for (const [slug, nombre] of entries) {
      await this.warriorModel.updateOne(
        { slug, nombre: { $ne: nombre } },
        { $set: { nombre } },
      );
    }
  }
}

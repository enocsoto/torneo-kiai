import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attack } from '../attacks/schemas/attack.schema';
import { WARRIOR_NOMBRE_DISPLAY_BY_SLUG } from '../config/warrior-latam-names';
import { Evolution } from '../evolutions/schemas/evolution.schema';
import { Warrior } from '../warriors/schemas/warrior.schema';
import { ATTACKS_SEED } from './data/attacks.data';
import { EVOLUTIONS_SEED } from './data/evolutions.data';
import { SLUG_TO_API_NAME, WARRIORS_SEED } from './data/warriors.data';

type DragonBallApiPage = {
  items: { name: string; image: string }[];
  links?: { next?: string };
};

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Attack.name) private readonly attackModel: Model<Attack>,
    @InjectModel(Evolution.name)
    private readonly evolutionModel: Model<Evolution>,
    @InjectModel(Warrior.name) private readonly warriorModel: Model<Warrior>,
  ) {}

  async seed() {
    await this.attackModel.deleteMany({});
    await this.evolutionModel.deleteMany({});
    await this.warriorModel.deleteMany({});

    const attacks = await this.attackModel.insertMany(ATTACKS_SEED);
    const atkByClave = new Map(attacks.map((a) => [a.clave, a._id]));

    await this.evolutionModel.insertMany(EVOLUTIONS_SEED);

    const imagesByApiName = await this.fetchImages();

    await this.warriorModel.insertMany(
      WARRIORS_SEED.map((w) => ({
        slug: w.slug,
        nombre: this.displayNombre(w.slug),
        imageUrl: this.imageUrlForSlug(imagesByApiName, w.slug),
        saludBase: w.saludBase,
        kiBase: w.kiBase,
        defensa: w.defensa,
        estado: w.estado,
        ataques: w.ataqueClaves.map((c) => atkByClave.get(c)),
      })),
    );
  }

  private async fetchImages(): Promise<Map<string, string>> {
    const byName = new Map<string, string>();
    let url: string | null =
      'https://dragonball-api.com/api/characters?limit=50';
    while (url) {
      let res: Response;
      try {
        res = await fetch(url, { headers: { Accept: 'application/json' } });
      } catch (err) {
        this.logger.warn(
          `No se pudieron cargar imágenes desde la API; se usarán SVG locales. ${String(err)}`,
        );
        return byName;
      }
      if (!res.ok) {
        this.logger.warn(
          `HTTP ${res.status} al pedir ${url}; imágenes omitidas.`,
        );
        return byName;
      }
      const data = (await res.json()) as DragonBallApiPage;
      for (const item of data.items ?? []) {
        if (item.name && item.image) {
          byName.set(item.name.trim(), item.image.trim());
        }
      }
      const next = data.links?.next?.trim();
      url = next && next.length > 0 ? next : null;
    }
    return byName;
  }

  private imageUrlForSlug(
    imagesByApiName: Map<string, string>,
    slug: string,
  ): string {
    const apiName = SLUG_TO_API_NAME[slug];
    if (!apiName) return '';
    return imagesByApiName.get(apiName) ?? '';
  }

  private displayNombre(slug: string): string {
    const n = WARRIOR_NOMBRE_DISPLAY_BY_SLUG[slug];
    if (n == null)
      throw new Error(`Falta nombre de pantalla para slug: ${slug}`);
    return n;
  }
}

import { AbstractExtractor } from './abstract-extractor';
import { Drop } from '../../model/drop';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { monsterDrops } from '../../../../core/data/sources/monster-drops';
import { LazyDataService } from '../../../../core/data/lazy-data.service';

export class DropsExtractor extends AbstractExtractor<Drop[]> {

  constructor(gt: GarlandToolsService, private lazyData: LazyDataService) {
    super(gt);
  }

  isAsync(): boolean {
    return false;
  }

  getDataType(): DataType {
    return DataType.DROPS;
  }

  protected canExtract(item: Item): boolean {
    return item !== undefined;
  }

  protected doExtract(item: Item, itemData: ItemData): Drop[] {
    const drops: Drop[] = [];
    if (item.drops) {
      item.drops.forEach(d => {
        const partial = itemData.getPartial(d.toString(), 'mob');
        if (partial !== undefined) {
          const monsterId: string = Math.floor(d % 1000000).toString();
          const zoneid = this.lazyData.data.monsters[monsterId] !== undefined && this.lazyData.data.monsters[monsterId].positions[0] ? this.lazyData.data.monsters[monsterId].positions[0].zoneid : partial.obj.z;
          const mapid = this.lazyData.data.monsters[monsterId] !== undefined && this.lazyData.data.monsters[monsterId].positions[0] ? this.lazyData.data.monsters[monsterId].positions[0].map : this.lazyData.getMapIdByZoneId(partial.obj.z);
          const position = this.lazyData.data.monsters[monsterId] !== undefined && this.lazyData.data.monsters[monsterId].positions[0] ? {
              zoneid: zoneid,
              x: +this.lazyData.data.monsters[monsterId].positions[0].x,
              y: +this.lazyData.data.monsters[monsterId].positions[0].y
            } :
            null;
          const drop: Drop = {
            id: d,
            mapid: mapid,
            zoneid: zoneid,
            lvl: partial.obj.l,
            position: position
          };
          drops.push(drop);
        }
      });
    }
    drops.push(...Object.keys(monsterDrops)
      .filter(key => {
        return monsterDrops[key].indexOf(item.id) > -1;
      })
      .map(monsterId => {
        if (this.lazyData.data.monsters[monsterId] === undefined || this.lazyData.data.monsters[monsterId].positions[0] === undefined) {
          return {
            id: +monsterId
          };
        }
        const zoneid = this.lazyData.data.monsters[monsterId].positions[0].zoneid;
        const mapid = this.lazyData.data.monsters[monsterId].positions[0].map;
        const position = {
          zoneid: zoneid,
          x: +this.lazyData.data.monsters[monsterId].positions[0].x,
          y: +this.lazyData.data.monsters[monsterId].positions[0].y
        };
        return {
          id: +monsterId,
          mapid: mapid,
          zoneid: zoneid,
          lvl: this.lazyData.data.monsters[monsterId].level,
          position: position
        };
      })
    );
    return drops;
  }
}

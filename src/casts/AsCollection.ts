import {Castable, CastsAttributes} from "../contracts";
import {Model} from "../Model";

export class Collection {
    constructor(readonly items: any[]) {
    }
}

export class AsCollection<T extends object = any> implements Castable {
    castUsing(...args: any[]): CastsAttributes<T, Collection> {
        return new class implements CastsAttributes<T, Collection> {
            getAttribute(model: Model<T>, key: keyof T, value: T[keyof T], attributes: T): Collection {
                return new Collection([value]);
            }

            setAttribute(model: Model<T>, key: keyof T, value: T[keyof T], attributes: T): any {
                return {
                    [key]: JSON.stringify(value)
                };
            }
        };
    }
}
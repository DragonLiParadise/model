import {Castable, CastsAttributes} from "../contracts";
import {Model} from "../Model";

export class AsDate<T extends object = any> implements Castable {
    castUsing(...args: any[]): CastsAttributes<T, Date> {
        return new class implements CastsAttributes<T, Date> {
            getAttribute(model: Model<T>, key: keyof T, value: T[keyof T], attributes: T): Date {
                return new Date();
            }

            setAttribute(model: Model<T>, key: keyof T, value: T[keyof T], attributes: T): any {
            }
        }
    }

}
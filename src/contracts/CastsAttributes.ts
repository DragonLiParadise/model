import {Model} from "../Model";

export interface CastsAttributes<T extends object = any, R extends any = any> {
    getAttribute(model: Model<T>, key: keyof T, value: T[keyof T], attributes: T): R;

    setAttribute(model: Model<T>, key: keyof T, value: T[keyof T], attributes: T): any;
}
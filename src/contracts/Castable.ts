import {CastsAttributes} from "./CastsAttributes";

export interface Castable<T extends object = any, R extends any = any> {
    castUsing(...args: any[]): CastsAttributes<T, R>;
}
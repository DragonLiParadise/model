interface Castable {
    castUsing(options: string[]): any;
}

export abstract class Caster implements Castable {
    abstract castUsing(options: string[]): any;
}

export abstract class Model<T extends object = any> {
    /**
     * The model attribute's original state.
     *
     * @protected
     */
    protected original: T;

    /**
     * The model's attributes.
     *
     * @protected
     */
    protected attributes: T;

    /**
     * The changed model attributes.
     *
     * @protected
     */
    protected changes: Array<[keyof T, T[keyof T]]> = [];

    /**
     * The attributes that are mass assignable.
     *
     * @protected
     */
    protected fillable: Set<keyof T> = new Set();

    /**
     * Indicates if all mass assignment is enabled.
     *
     * @protected
     */
    protected unguarded = false;

    /**
     * The model attribute's casts.
     *
     * @protected
     */
    protected casts: Partial<Record<keyof T, string>> = {};

    /**
     * The attributes that have been cast using custom classes.
     *
     * @protected
     */
    protected classCastCache: Partial<Record<keyof T, T[keyof T]>> = {};

    /**
     * The attributes that have been cast using "Attribute" return type mutators.
     *
     * @protected
     */
    protected attributeCastCache: Partial<Record<keyof T, T[keyof T]>> = {};

    constructor(attributes: T) {
        this.original = attributes;

        this.attributes = attributes;
    }

    /**
     * Get all the current attributes on the model.
     */
    getAttributes() {
        this.mergeAttributesFromCachedCasts();

        return this.attributes;
    }

    /**
     * Merge the cast class and attribute cast attributes back into the model.
     *
     * @protected
     */
    protected mergeAttributesFromCachedCasts() {
        this.mergeAttributesFromClassCasts();
        this.mergeAttributesFromAttributeCasts();
    }

    getCasts() {
        return this.casts;
    }

    getSpecialCast(key: keyof T) {
        return this.casts[key];
    }

    mergeAttributesFromClassCasts() {
        Object.entries(this.classCastCache).forEach(([key, value]) => {
            const caster = this.resolveCasterClass(key);

            this.attributes = {
                ...this.attributes,
                ...(caster instanceof CastsInboundAttributes
                    ? { [key]: value }
                    : this.normalizeCastClassResponse(key, caster.set(this, key, value, this.attributes)))
            }
        })
    }

    protected resolveCasterClass(key: keyof T): any {
        let castType = this.getSpecialCast(key);

        let options: string[] = [];

        if (castType) {
            if (typeof (castType as any) === 'string' && castType.includes(':')) {
                const segments = castType.split(':', 2);

                castType = segments[0];

                options = segments[1].split(',');
            }

            if (typeof castType === 'function' && (castType as any).prototype instanceof Caster) {
                castType = castType.castUsing(options);
            }

            if (typeof castType === 'object') {
                return castType;
            }
        }

        return new (castType as any)(...options);
    }

    /**
     * Sync the original attributes with the current.
     */
    syncOriginal() {
        this.original = { ...this.getAttributes() };

        return this;
    }

    /**
     * Sync a single original attribute with its current value.
     *
     * @param attribute
     */
    syncOriginalAttribute(attribute: keyof T) {
        return this.syncOriginalAttributes([attribute]);
    }

    /**
     * Sync multiple original attribute with their current values.
     *
     * @param attributes
     */
    syncOriginalAttributes(attributes: Array<keyof T>) {
        const modelAttributes = this.getAttributes();

        attributes.forEach(attribute => {
            this.original[attribute] = modelAttributes[attribute];
        })

        return this;
    }

    /**
     * Sync the changed attributes.
     */
    syncChanges() {
        this.changes = this.getDirty();

        return this;
    }

    /**
     * Fill the model with an array of attributes.
     *
     * @param attributes
     */
    fill(attributes: Partial<T>) {
        const fillableAttributes = this.getFillableAttributes(attributes);

        fillableAttributes.forEach(([key, value]) => {
            if (this.isFillable(key)) {
                this.setAttribute(key, value);
            }
        })

        return this;
    }

    /**
     * Determine if the given attribute may be mass assigned.
     *
     * @return bool
     * @param key
     */
     isFillable(key: keyof T) {
        // If the key is in the "fillable" array, we can of course assume that it's
        // a fillable attribute. Otherwise, we will check the guarded array when
        // we need to determine if the attribute is black-listed on the model.
        return this.fillable.has(key);
    }

    /**
     * Get the attributes that have been changed since the last sync.
     */
    getDirty(): Array<[keyof T, T[keyof T]]> {
         const dirty: Array<[keyof T, T[keyof T]]>  = [];

         const attributes = this.getAttributes();

         Object.entries(attributes).forEach(([key, value]) => {
             if (!this.originalIsEquivalent(key as keyof T)) {
                 dirty.push([key as keyof T, value])
             }
         })

        return dirty;
    }

    /**
     * Determine if the new and old values for a given key are equivalent.
     *
     * @param key
     */
    originalIsEquivalent(key: keyof T) {
        if (!(key in this.original)) {
            return false;
        }

        const attribute = this.attributes[key];
        const original = this.original[key];

        if (attribute === original) {
            return true;
        } else if (attribute === undefined || attribute === null) {
            return false;
        } else {
            return false;
        }
    }


    /**
     * Get the fillable attributes of a given array.
     *
     * @param attributes
     * @protected
     */
    protected getFillableAttributes(attributes: Partial<T>): Array<[keyof T, T[keyof T]]> {
        if (this.fillable.size > 0 && !this.unguarded) {
            return Object.entries(attributes).filter(
                ([key, _]) => this.fillable.has(key as keyof T)
            ) as [keyof T, T[keyof T]][];
        }

        return Object.entries(attributes) as [keyof T, T[keyof T]][];
    }
}
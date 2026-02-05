/**
 * Base class for all entities.
 */
export class Entity {
    private data: Record<string, any>;

    /**
     * Creates a new Entity.
     *
     * @param data - The entity data
     */
    constructor(data?: Record<string, any>) {
        this.data = data || {};
    }

    /**
     * Sets a field in the entity.
     *
     * @param field - The field to set
     * @param value - The value to set
     */
    public set(field: string, value: any): void {
        this.data[field] = value;
    }

    /**
     * Gets a field from the entity.
     *
     * @param field - The field to get
     * @returns The field value
     */
    public get(field: string): any {
        return this.data[field];
    }

    /**
     * Checks if the entity has a field.
     *
     * @param field - The field to check
     * @returns True if the entity has the field, false otherwise
     */
    public has(field: string): boolean {
        return field in this.data;
    }

    /**
     * Removes a field from the entity.
     *
     * @param field - The field to remove
     */
    public remove(field: string): void {
        delete this.data[field];
    }

    /**
     * Gets all fields in the entity.
     *
     * @returns All fields
     */
    public getFields(): string[] {
        return Object.keys(this.data);
    }

    /**
     * Gets all data in the entity.
     *
     * @returns All data
     */
    public getData(): Record<string, any> {
        return { ...this.data };
    }

    /**
     * Converts the entity to a string.
     *
     * @returns The entity as a JSON string
     */
    public toString(): string {
        return JSON.stringify(this.data);
    }
}

export namespace panflux {
    export interface EntityDeclaration {
        id: string;
        name: string;
        type: string;
        config: object;
    }

    export interface Entity extends EntityDeclaration {
    }

    export interface Platform {
        reportDiscovery(entity: Entity): void;
    }
}

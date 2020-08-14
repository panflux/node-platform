/// <reference types="node" />

import {EventEmitter} from "events";
import {ValidationResult} from "joi";
import {Logger} from "winston";

declare namespace panflux {

    interface EntityDefinition {
        id: string;
        name: string;
        type: string;
        config?: Map<string, any>;
        attributes?: Map<string, any>;
    }

    class Platform extends EventEmitter {
        constructor(config: any, rootdir: string);

        run(logTransport: any|any[]): void;

        buildEntityTypes(types: any): void;
        getEntityType(type: string): EntityType;
        validateEntity<T>(definition: any): ValidationResult<T>;

        readonly config: any;
        readonly types: EntityType[];
        readonly name: string;
        readonly friendlyName: string;
        readonly rootdir: string;
        readonly version?: string;
        readonly versionURL?: string;

        static load(rootdir: string): Platform;
    }

    class Sandbox {
        constructor(platform: Platform, logger: Logger);

        processMessage(name: string, args: any): void;

        adopt(definition: EntityDefinition, parent: Entity|null): void;
        adopt(definition: EntityDefinition): void;

        reportDiscovery(object: any): boolean;

        setAttribute(entityId: string, name: string, value: any): void;
        setProperty(entityId: string, name: string, value: any): void;

        on(event: 'adopt', listener: (entity: Entity) => void): void;
        on(event: 'start', listener: (args: any) => void): void;
        on(event: 'stop', listener: (args: any) => void): void;
        on(event: 'discover', listener: (args: any) => void): void;
    }

    class EntityType {
        constructor(name: string, definition: any);

        createEntity(definition: EntityDefinition, platform: Sandbox, logger: Logger): Entity;

        registerChildEntityType(name: string, definition: EntityDefinition): void;
        hasChildEntityType(name: string): boolean;
        getChildEntityType(name: string): EntityType;

        validateDelta<T>(delta: any): ValidationResult<T>;
        validateEntity<T>(entity: any): ValidationResult<T>;

        readonly name: string;
    }

    class Entity {
        constructor(definition: EntityDefinition, type: EntityType, platform: Platform, logger: Logger);

        registerChildEntity(definition: EntityDefinition): boolean;

        emit(event: string, parameters: any): void
        emit(event: string): void

        setAttribute(name: string, value: any): void;
        setAttributes(object: any): void;

        setProperty(name: string, value: any): void;
        setProperties(object: any): void;

        readonly id: string;
        readonly name: string;
        readonly type: EntityType;
        readonly config: any;

        parentId: string|null;
    }
}

export = panflux;

import { ClassConstructor } from '@esliph/metadata';

export enum InjectableType {
    CREATE_FOREACH_CALL = 'CREATE_FOREACH_CALL',
    UNIQUE_INSTANCE = 'UNIQUE_INSTANCE',
}
export type InjectableOptions = { ignoreIfExists: boolean; overwrite: boolean; type: InjectableType }

export type ServiceModel<T = any> = {
    constructor: ClassConstructor<T>
    type: InjectableType
    instance: T
}

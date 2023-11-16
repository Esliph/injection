import { ClassConstructor } from '@esliph/metadata'
import { InjectableOptions, ServiceModel } from './type'

export class InjectionRepository {
    private static services: { [s: string | symbol]: ServiceModel } = {}

    static add(serviceName: string, classConstructor: ClassConstructor, options: InjectableOptions) {
        if (InjectionRepository.get(serviceName) && !options.overwrite) {
            if (options.ignoreIfExists) {
                return
            }

            throw new Error(`Service already defined with name "${serviceName}"`)
        }

        InjectionRepository.services[Symbol.for(serviceName)] = { constructor: classConstructor, type: options.type, instance: undefined }
    }

    static get<T>(serviceName: string) {
        return InjectionRepository.services[Symbol.for(serviceName)] as ServiceModel<T>
    }

    static getByConstructor<T>(classConstructor: ClassConstructor<T>) {
        Object.keys(this.services).find(constructor => constructor)
    }

    static clear() {
        this.services = {}
    }
}

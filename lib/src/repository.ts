import { ClassConstructor } from '@esliph/metadata'

export class InjectionRepository {
    private static services: { [s: string | symbol]: ClassConstructor } = {}

    static add(serviceName: string, classConstructor: ClassConstructor, overwrite = false) {
        if (InjectionRepository.get(serviceName) && !overwrite) {
            throw new Error(`Service already defined with name "${serviceName}"`)
        }

        InjectionRepository.services[Symbol.for(serviceName)] = classConstructor
    }

    static get<T>(serviceName: string) {
        return InjectionRepository.services[Symbol.for(serviceName)] as ClassConstructor<T>
    }

    static clear() {
        this.services = {}
    }
}

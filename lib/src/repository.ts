import { ClassConstructor } from '@esliph/metadata'

export class InjectionRepository {
    private static services: { [s: string | symbol]: ClassConstructor } = {}

    static add(serviceName: string, classConstructor: ClassConstructor, options: { overwrite?: boolean, ignoreIfExists?: boolean } = {}) {
        if (InjectionRepository.get(serviceName) && !options.overwrite) {
            if (options.ignoreIfExists) {
                return
            }

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

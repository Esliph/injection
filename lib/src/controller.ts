import { ClassConstructor, DecoratorMetadata, Metadata } from '@esliph/metadata'
import { Decorator } from '@esliph/decorator'
import { InjectionRepository } from './repository'

export class Injection {
    static Injectable = Injectable
    static InjectableService = AddService
    static Inject = Inject
    static resolve<T extends ClassConstructor>(target: string | T) {
        return Resolve<T>(target)
    }
    static whenCall = WhenCall
}

function Injectable(key?: string) {
    const handler = key
        ? (constructor: any) => {
            AddService(key, constructor)

            return DecoratorMetadata.Create.Class({
                key: `class.injectable.${key}`,
                value: (constructor: any) => constructor,
            })
        }
        : () => { }

    return DecoratorMetadata.Create.Class({ key: 'class.injectable', value: true }, handler)
}

function Inject(key: string) {
    function handler(target: any, propertyKey?: string | symbol, parameterIndex?: number) {
        if (typeof target.prototype.Injections == 'undefined') {
            target.prototype.Injections = {}
        }

        if (typeof parameterIndex == 'undefined') {
            throw new Error(`Parameter in ${target.name} cannot be undefined`)
        }

        target.prototype.Injections[parameterIndex] = key
    }

    return Decorator.Create.Parameter(handler)
}

function Resolve<T extends ClassConstructor>(target: string | T): InstanceType<T> {
    let Instance: ClassConstructor | null = null

    if (typeof target == 'string') {
        Instance = getService<T>(target)
    } else {
        Instance = target
    }

    if (!Metadata.Get.Class('class.injectable', Instance)) {
        throw new Error(`Class ${Instance.name} need decorate Injectable`)
    }

    if (typeof Instance.prototype.Injections == 'undefined' || !Object.keys(Instance.prototype.Injections).length) {
        return new Instance()
    }

    const instances: { index: number; value: InstanceType<ClassConstructor<any>> | null; service: ClassConstructor<any> }[] = Object.keys(
        Instance.prototype.Injections
    ).map(index => {
        const serviceName = Instance!.prototype.Injections[index]

        return { index: Number(index), service: InjectionRepository.get(serviceName), value: null }
    })

    const instancesOrdered = instances.sort((a, b) => a.index - b.index)

    instancesOrdered.map(({ service }, i) => {
        instancesOrdered[i].value = Resolve(service)
    })

    return new Instance(...instancesOrdered.map(({ value }) => value))
}

function WhenCall(serviceName: string) {
    function use(target: string | ClassConstructor<any>) {
        let classConstructor: ClassConstructor<any> | null = null

        if (typeof target == 'string') {
            classConstructor = getService(target)
        } else {
            classConstructor = target
        }

        AddService(serviceName, classConstructor, true)
    }

    return {
        use,
    }
}

function AddService(key: string, service: ClassConstructor, overwrite = false) {
    InjectionRepository.add(key, service, overwrite)
}

function getService<T>(key: string) {
    const Instance = InjectionRepository.get<T>(key)

    if (typeof Instance == 'undefined') {
        throw new Error(`Service name ${key} not found`)
    }

    return Instance
}

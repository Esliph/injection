import { ClassConstructor, DecoratorMetadata, Metadata } from '@esliph/metadata'
import { Decorator } from '@esliph/decorator'
import { InjectionRepository } from './repository'
import { METADATA_CLASS_INJECTABLE_KEY } from './constants'
import { InjectableOptions, InjectableType, ServiceModel } from './type'

export class Injection {
    static Injectable = Injectable
    static InjectableService = AddService
    static Inject = Inject
    static resolve<T extends ClassConstructor>(target: string | T) {
        return Resolve<T>(target)
    }
    static whenCall = WhenCall
    static Clear = Clear
    static getService = getService
}

function Clear() {
    InjectionRepository.clear()
}

function Injectable(key?: string, options?: Partial<InjectableOptions>) {
    const handler = (constructor: any) => {
        if (!key) {
            return
        }

        AddService(key, constructor, options)

        return DecoratorMetadata.Create.Class({
            key: `${METADATA_CLASS_INJECTABLE_KEY}.${key}`,
            value: (constructor: any) => constructor,
        })
    }

    return DecoratorMetadata.Create.Class({ key: METADATA_CLASS_INJECTABLE_KEY, value: true }, handler)
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
    let Instance: ServiceModel | null = null

    if (typeof target == 'undefined') {
        throw new Error('Target to resolve cannot be undefined')
    }

    if (typeof target == 'string') {
        Instance = getService<T>(target)
    } else {
        Instance = { constructor: target, type: InjectableType.CREATE_FOREACH_CALL, instance: undefined }
    }

    if (!Metadata.Get.Class(METADATA_CLASS_INJECTABLE_KEY, Instance.constructor)) {
        throw new Error(`Class ${Instance.constructor.name} need decorate Injectable`)
    }

    if (typeof Instance.constructor.prototype.Injections == 'undefined' || !Object.keys(Instance.constructor.prototype.Injections).length) {
        if (Instance.type == InjectableType.UNIQUE_INSTANCE) {
            if (typeof Instance.instance == 'undefined') {
                Instance.instance = new Instance.constructor()
            }

            return Instance.instance
        }

        return new Instance.constructor()
    }

    const instances: { index: number; value: InstanceType<ClassConstructor<any>> | null; service: ClassConstructor<any> }[] = Object.keys(
        Instance.constructor.prototype.Injections
    ).map(index => {
        const serviceName = Instance!.constructor.prototype.Injections[index]

        return { index: Number(index), service: InjectionRepository.get(serviceName).constructor, value: null }
    })

    const instancesOrdered = instances.sort((a, b) => a.index - b.index)

    instancesOrdered.map(({ service }, i) => {
        instancesOrdered[i].value = Resolve(service)
    })

    if (Instance.type == InjectableType.UNIQUE_INSTANCE) {
        if (typeof Instance.instance == 'undefined') {
            Instance.instance = new Instance.constructor(...instancesOrdered.map(({ value }) => value))
        }

        return Instance.instance
    }

    return new Instance.constructor(...instancesOrdered.map(({ value }) => value))
}

function WhenCall(serviceName: string) {
    function use(target: string | ClassConstructor<any>, options?: Omit<Partial<InjectableOptions>, 'overwrite'>) {
        let classConstructor: ClassConstructor<any> | null = null

        if (typeof target == 'string') {
            classConstructor = getService(target).constructor
        } else {
            classConstructor = target
        }

        AddService(serviceName, classConstructor, { ...options, overwrite: true })
    }

    return {
        use,
    }
}

function AddService(key: string, service: ClassConstructor, options?: Partial<InjectableOptions>) {
    InjectionRepository.add(key, service, {
        ignoreIfExists: !!options?.ignoreIfExists,
        overwrite: !!options?.overwrite,
        type: options?.type || InjectableType.CREATE_FOREACH_CALL,
    })
}

function getService<T>(key: string) {
    const Instance = InjectionRepository.get<T>(key)

    if (typeof Instance == 'undefined') {
        throw new Error(`Service name ${key} not found`)
    }

    return Instance
}

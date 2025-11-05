import { Injection } from '..'
import { InjectableType } from '../type'

@Injection.Injectable()
class ServiceParent {}

Injection.InjectableService('ServiceParent', ServiceParent)

@Injection.Injectable('Service')
class Service extends ServiceParent {
    constructor() {
        super()
    }
}

@Injection.Injectable('Service', { ignoreIfExists: true })
class Service3 extends ServiceParent {
    constructor(@Injection.Inject('ServiceParent') private service1: ServiceParent) {
        super()
    }
}

@Injection.Injectable('Service2', { type: InjectableType.UNIQUE_INSTANCE })
class Service2 extends ServiceParent {
    constructor() {
        super()
        console.log('!')
    }
}

@Injection.Injectable('Controller')
class Controller {
    constructor(@Injection.Inject('Service') private service: ServiceParent, @Injection.Inject('Service') private service1: ServiceParent) {}
}

Injection.whenCall('Service').use('Service2')

const instance = Injection.resolve('Controller')

console.log(instance)

try {
    // Exemplo of the exception
    // @ts-expect-error
    Injection.resolve()
} catch (err: any) {
    console.log(err.message)
}

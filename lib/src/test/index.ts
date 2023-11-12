import { Injection } from '..'

@Injection.Injectable()
class ServiceParent {
    log(str: string) {
        console.log(str)
    }
}

Injection.InjectableService('ServiceParent', ServiceParent)

@Injection.Injectable('Service')
class Service {
    constructor(@Injection.Inject('ServiceParent') private service1: ServiceParent) { }

    log(str: string) {
        this.service1.log(str)
    }
}

@Injection.Injectable('Service2')
class Service2 {
    constructor(@Injection.Inject('ServiceParent') private service1: ServiceParent) { }

    log(str: string) {
        this.service1.log(str)
    }
}

@Injection.Injectable('Controller')
class Controller {
    constructor(@Injection.Inject('Service') private service: ServiceParent) { }
}

Injection.whenCall('Service').use('Service2')

const instance = Injection.resolve('Controller')

console.log(instance)

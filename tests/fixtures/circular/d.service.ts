import { Inject } from '@decorators/inject.decorator'

import { ServiceC } from './c.service'

export class ServiceD {

  @Inject(ServiceC) c: ServiceC
}

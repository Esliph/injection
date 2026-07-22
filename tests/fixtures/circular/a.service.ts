import { Inject } from '@decorators/inject.decorator'

import { ServiceB } from './b.service'

@Inject(0, ServiceB)
export class ServiceA {

  constructor(
    public b: ServiceB
  ) { }
}

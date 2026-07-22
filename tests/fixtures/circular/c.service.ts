import { Inject } from '@decorators/inject.decorator'

import { ServiceD } from './d.service'

@Inject(0, ServiceD)
export class ServiceC {

  constructor(
    public d: ServiceD
  ) { }
}

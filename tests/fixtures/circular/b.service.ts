import { forwardRef } from '@common/forward-ref'
import { Inject } from '@decorators/inject.decorator'

import { ServiceA } from './a.service'

export class ServiceB {

  @Inject(forwardRef(() => ServiceA)) a: ServiceA
}

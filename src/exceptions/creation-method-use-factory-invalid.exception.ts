import { InjectionErrorCode } from '@exceptions/code-errors'
import { InjectionException } from '@exceptions/injection.exception'

export class CreationMethodUseFactoryInjectionException extends InjectionException {

  constructor(message: string) {
    super(InjectionErrorCode.CREATION_METHOD_USE_FACTORY_INVALID, message)
  }
}

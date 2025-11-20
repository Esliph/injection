import { InjectionErrorCode } from '@exceptions/code-errors'
import { InjectionException } from '@exceptions/injection.exception'

export class CreationMethodUseClassInjectionException extends InjectionException {

  constructor(message: string) {
    super(InjectionErrorCode.CREATION_METHOD_USE_CLASS_INVALID, message)
  }
}

import { InjectionErrorCode } from '@exceptions/code-errors'
import { InjectionException } from '@exceptions/injection.exception'

export class CreationMultipleMethodInjectionException extends InjectionException {

  constructor(message: string) {
    super(InjectionErrorCode.CREATION_MULTIPLE_METHOD, message)
  }
}

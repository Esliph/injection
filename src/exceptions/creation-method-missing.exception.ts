import { InjectionErrorCode } from '@exceptions/code-errors'
import { InjectionException } from '@exceptions/injection.exception'

export class CreationMethodMissingInjectionException extends InjectionException {

  constructor(message: string) {
    super(InjectionErrorCode.CREATION_METHOD_MISSING, message)
  }
}

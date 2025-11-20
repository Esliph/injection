import { InjectionErrorCode } from '@exceptions/code-errors'
import { InjectionException } from '@exceptions/injection.exception'

export class ClassConstructorInvalidInjectionException extends InjectionException {

  constructor(message: string) {
    super(InjectionErrorCode.CLASS_CONSTRUCTOR_INVALID, message)
  }
}

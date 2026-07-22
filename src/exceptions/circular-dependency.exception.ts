import { InjectionErrorCode } from '@exceptions/code-errors'
import { InjectionException } from '@exceptions/injection.exception'

export class CircularDependencyInjectionException extends InjectionException {

  constructor(message: string) {
    super(InjectionErrorCode.CIRCULAR_DEPENDENCY, message)
  }
}

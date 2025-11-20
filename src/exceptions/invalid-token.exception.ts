import { InjectionErrorCode } from '@exceptions/code-errors'
import { InjectionException } from '@exceptions/injection.exception'

export class InvalidTokenInjectionException extends InjectionException {

  constructor(message: string) {
    super(InjectionErrorCode.TOKEN_INVALID, message)
  }
}

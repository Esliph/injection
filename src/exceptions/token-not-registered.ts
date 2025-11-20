import { InjectionErrorCode } from '@exceptions/code-errors'
import { InjectionException } from '@exceptions/injection.exception'

export class TokenNotRegisteredInjectionException extends InjectionException {

  constructor(message: string) {
    super(InjectionErrorCode.TOKEN_NOT_REGISTERED, message)
  }
}

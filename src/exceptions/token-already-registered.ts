import { InjectionErrorCode } from '@exceptions/code-errors'
import { InjectionException } from '@exceptions/injection.exception'

export class TokenAlreadyRegisteredInjectionException extends InjectionException {

  constructor(message: string) {
    super(InjectionErrorCode.TOKEN_ALREADY_REGISTERED, message)
  }
}

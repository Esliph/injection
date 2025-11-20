import { InjectionErrorCode } from '@exceptions/code-errors'

export class InjectionException extends Error {

  constructor(
    public readonly code: InjectionErrorCode,
    message: string
  ) {
    super(message)
  }
}

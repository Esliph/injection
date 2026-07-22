import type { DependencyToken, DependencyTokenInput } from '@common/types/dependency'

export class ForwardReference {

  constructor(readonly forwardRef: () => DependencyTokenInput) { }
}

export function forwardRef(fn: () => DependencyTokenInput) {
  return new ForwardReference(fn)
}

export function isForwardRef(value: any): value is ForwardReference {
  return value instanceof ForwardReference
}

export function resolveForwardRef(token: DependencyTokenInput): DependencyToken {
  return isForwardRef(token) ? resolveForwardRef(token.forwardRef()) : token
}

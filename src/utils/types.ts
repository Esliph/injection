export type ClassConstructor<T = any> = new (...args: any[]) => T

export function isClass(value: any): value is ClassConstructor {
  if (typeof value !== 'function') {
    return false
  }

  const descriptor = Object.getOwnPropertyDescriptor(value, 'prototype')

  return descriptor !== undefined && descriptor.writable === false
}

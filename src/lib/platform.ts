export function isMacPlatform(): boolean {
  return navigator.userAgent.includes("Mac");
}

export function isWindowsPlatform(): boolean {
  return navigator.userAgent.includes("Windows");
}

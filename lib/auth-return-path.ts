export function authReturnPath(value: string | null) {
  return value?.startsWith('/') && !value.startsWith('//') && !/[\\\u0000-\u001f]/.test(value)
    ? value : '/tai-khoan';
}

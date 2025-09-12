export function payloadAuthorizeUser(userName: string, password: string) {
  return {
    userName,
    password
  };
}

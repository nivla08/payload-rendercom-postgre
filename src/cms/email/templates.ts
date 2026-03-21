export const renderVerifyEmail = (args: { actionURL: string; appName?: string }): string => {
  const appName = args.appName ?? 'Payload Starter'

  return [
    `<h1>${appName}</h1>`,
    '<p>Verify your email address to finish signing in.</p>',
    `<p><a href="${args.actionURL}">Verify email</a></p>`,
  ].join('')
}

export const renderPasswordResetEmail = (args: { actionURL: string; appName?: string }): string => {
  const appName = args.appName ?? 'Payload Starter'

  return [
    `<h1>${appName}</h1>`,
    '<p>Use the link below to reset your password.</p>',
    `<p><a href="${args.actionURL}">Reset password</a></p>`,
  ].join('')
}

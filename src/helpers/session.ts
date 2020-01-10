export async function saveSession() {
  let ctx = this

  await ctx.dbuser.save()
}

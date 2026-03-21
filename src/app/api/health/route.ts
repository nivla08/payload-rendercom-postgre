export const dynamic = 'force-dynamic'

export const GET = async (): Promise<Response> => {
  return Response.json({
    ok: true,
    timestamp: new Date().toISOString(),
  })
}

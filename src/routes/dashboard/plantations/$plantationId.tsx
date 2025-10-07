import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/dashboard/plantations/$plantationId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/plantations/$plantationId/overview"!</div>
}

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/map/tree/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/dashboard/map/tree"!</div>;
}

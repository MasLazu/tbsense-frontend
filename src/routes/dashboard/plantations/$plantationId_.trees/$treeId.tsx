import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, MapPin } from "lucide-react";
import { useTree } from "@/hooks/use-trees";

export const Route = createFileRoute(
  "/dashboard/plantations/$plantationId_/trees/$treeId"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { plantationId, treeId } = Route.useParams();
  const { data: tree, isLoading, error } = useTree(treeId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-muted-foreground">Failed to load tree data</p>
        <Button asChild>
          <Link
            to="/dashboard/plantations/$plantationId"
            params={{ plantationId }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plantation
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link
            to="/dashboard/plantations/$plantationId"
            params={{ plantationId }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Tree Dashboard</h1>
          <p className="text-muted-foreground">Tree ID: {tree.id}</p>
        </div>
      </div>

      {/* Tree Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Location</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-sm">
                <span className="text-muted-foreground">Longitude: </span>
                <span className="font-mono">{tree.longitude.toFixed(6)}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Latitude: </span>
                <span className="font-mono">{tree.latitude.toFixed(6)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(tree.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(tree.createdAt).toLocaleTimeString("en-US")}
            </p>
          </CardContent>
        </Card>

        {tree.updatedAt && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Last Updated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(tree.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(tree.updatedAt).toLocaleTimeString("en-US")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Placeholder for future analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Tree Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Tree-specific analytics and metrics will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

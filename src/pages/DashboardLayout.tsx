import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>DashboardLayout</CardTitle>
            <CardDescription>This page is under construction</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

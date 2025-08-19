import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Reports() {
  return (
    <AppLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Reports & Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Reporting and analytics interface</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
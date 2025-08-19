import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Tiers() {
  return (
    <AppLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Tier management interface</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TierDetails() {
  return (
    <AppLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Tier Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Tier details interface</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
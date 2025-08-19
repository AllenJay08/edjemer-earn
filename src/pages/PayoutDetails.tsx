import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PayoutDetails() {
  return (
    <AppLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Payout Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Payout details interface</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
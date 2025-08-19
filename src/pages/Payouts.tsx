import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Payouts() {
  return (
    <AppLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Payout management interface</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
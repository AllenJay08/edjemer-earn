import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Benefits() {
  return (
    <AppLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Benefits Ledger</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Benefits tracking interface</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
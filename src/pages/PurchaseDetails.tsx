import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "react-router-dom";

export default function PurchaseDetails() {
  const { id } = useParams();
  
  return (
    <AppLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Purchase ID: {id}</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
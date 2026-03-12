import { Card } from "@/components/ui/card";
import { useLocation } from "react-router-dom";

const PlaceholderPage = () => {
  const location = useLocation();
  const pageName = location.pathname.split("/").pop() || "Page";
  const title = pageName.charAt(0).toUpperCase() + pageName.slice(1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold text-foreground">{title}</h1>
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          {title} page coming soon. Enable Lovable Cloud to unlock full functionality.
        </p>
      </Card>
    </div>
  );
};

export default PlaceholderPage;

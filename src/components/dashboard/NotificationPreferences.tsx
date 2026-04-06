import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, ShoppingBag, Eye, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

interface NotificationPrefs {
  messages: boolean;
  orders: boolean;
  views: boolean;
}

const defaultPrefs: NotificationPrefs = { messages: true, orders: true, views: true };

const NotificationPreferences = () => {
  const user = useAuthStore((s) => s.user);
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("notification_prefs")
        .eq("user_id", user.id)
        .single();
      if (data?.notification_prefs) {
        const p = data.notification_prefs as Record<string, boolean>;
        setPrefs({
          messages: p.messages !== false,
          orders: p.orders !== false,
          views: p.views !== false,
        });
      }
    };
    fetch();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ notification_prefs: prefs })
      .eq("user_id", user.id);
    setLoading(false);
    if (error) {
      toast.error("Failed to save preferences");
    } else {
      toast.success("Notification preferences saved!");
    }
  };

  const togglePref = (key: keyof NotificationPrefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const items = [
    {
      key: "messages" as const,
      icon: MessageSquare,
      label: "Messages",
      description: "Get notified when someone sends you a message",
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      key: "orders" as const,
      icon: ShoppingBag,
      label: "Orders",
      description: "Get notified when someone places an order",
      color: "text-green-500 bg-green-500/10",
    },
    {
      key: "views" as const,
      icon: Eye,
      label: "Profile Views",
      description: "Get milestone alerts when your profile is trending",
      color: "text-purple-500 bg-purple-500/10",
    },
  ];

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div>
        <h2 className="text-base md:text-lg font-heading font-semibold text-foreground flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Notification Preferences
        </h2>
        <p className="text-muted-foreground text-xs md:text-sm mt-1">
          Control which alerts appear in your notification bell
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${item.color}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <div>
                <Label className="text-sm font-medium cursor-pointer">{item.label}</Label>
                <p className="text-[10px] md:text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <Switch
              checked={prefs[item.key]}
              onCheckedChange={() => togglePref(item.key)}
            />
          </div>
        ))}
      </div>

      <Button size="sm" onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
        <Save className="w-4 h-4 mr-2" />
        {loading ? "Saving..." : "Save Preferences"}
      </Button>
    </Card>
  );
};

export default NotificationPreferences;

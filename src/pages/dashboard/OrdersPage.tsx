import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Trash2, Mail, Phone, Clock, Loader2, Hash, Palette } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  item_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string;
  status: string;
  created_at: string;
  quantity: number;
  selected_variant: string;
  item_title?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

const OrdersPage = () => {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data: ordersData } = await supabase
        .from("catalog_orders")
        .select("*")
        .eq("profile_user_id", user.user_id)
        .order("created_at", { ascending: false });

      if (!ordersData || ordersData.length === 0) { setOrders([]); setLoading(false); return; }

      // Fetch item titles
      const itemIds = [...new Set(ordersData.map((o) => o.item_id))];
      let titleMap = new Map<string, string>();
      if (itemIds.length > 0) {
        const { data: items } = await supabase
          .from("catalog_items")
          .select("id, title")
          .in("id", itemIds);
        titleMap = new Map(items?.map((i) => [i.id, i.title]) || []);
      }

      setOrders(ordersData.map((o) => ({
        ...o,
        customer_phone: o.customer_phone || "",
        notes: o.notes || "",
        quantity: (o as Record<string, unknown>).quantity as number || 1,
        selected_variant: (o as Record<string, unknown>).selected_variant as string || "",
        item_title: titleMap.get(o.item_id) || "Unknown Item",
      })));
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("catalog_orders").update({ status }).eq("id", id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    
    // Trigger status notification email
    supabase.functions.invoke("order-notify", {
      body: { order_id: id, status_update: true }
    }).catch(console.error);

    toast.success(`Order marked as ${status}`);
  };

  const deleteOrder = async (id: string) => {
    await supabase.from("catalog_orders").delete().eq("id", id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
    toast.success("Order deleted");
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-4">
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-2">Fulfillment Center</h4>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-baseline gap-3">
            Order <span className="font-script text-primary text-2xl lowercase opacity-80">flow</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2 bg-black/5 w-fit p-1.5 rounded-full overflow-x-auto no-scrollbar scrollbar-hide">
          {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
             <Button
                key={s}
                variant={filter === s ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilter(s)}
                className={cn(
                  "rounded-full text-[11px] font-black uppercase tracking-widest h-9 px-5 transition-all",
                  filter === s ? "bg-white text-primary shadow-md" : "text-black/40 hover:text-black/60"
                )}
             >
                {s} {s === "all" ? `(${orders.length})` : ""}
             </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No orders {filter !== "all" ? `with status "${filter}"` : "yet"}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <Card key={order.id} className="p-5 bg-background border-black/5 shadow-xl shadow-black/[0.01] hover:border-emerald-500/30 transition-all duration-500 rounded-[28px] overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground">{order.customer_name}</p>
                    <Badge variant="outline" className={STATUS_COLORS[order.status] || ""}>
                      {order.status}
                    </Badge>
                  </div>
                   <div className="flex items-center gap-3 flex-wrap">
                     <p className="text-sm text-muted-foreground">
                       <span className="font-medium text-foreground">Item:</span> {order.item_title}
                     </p>
                     {order.quantity > 1 && (
                       <Badge variant="secondary" className="text-[10px] gap-1">
                         <Hash className="w-3 h-3" /> Qty: {order.quantity}
                       </Badge>
                     )}
                     {order.selected_variant && (
                       <Badge variant="secondary" className="text-[10px] gap-1">
                         <Palette className="w-3 h-3" /> {order.selected_variant}
                       </Badge>
                     )}
                   </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {order.customer_email}
                    </span>
                    {order.customer_phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {order.customer_phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {format(new Date(order.created_at), "MMM d, yyyy HH:mm")}
                    </span>
                  </div>
                  {order.notes && (
                    <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2 mt-1">
                      <span className="font-medium">Notes:</span> {order.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteOrder(order.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;

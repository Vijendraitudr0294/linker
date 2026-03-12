import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, User, Clock, MapPin, Calendar, ArrowLeft, Phone, Mail, MessageCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import CatalogItemDetail from "@/components/public/CatalogItemDetail";
import ContactForm from "@/components/public/ContactForm";
import PublicCartFooter from "@/components/public/PublicCartFooter";
import CheckoutModal from "@/components/public/CheckoutModal";
import { usePlatformStore } from "@/stores/platformStore";
import { resolveCategoryLabel, resolveItemCtaLabel, resolveItemTypeLabel } from "@/lib/commerceConfig";

interface ProfileData {
  name: string;
  username: string;
  bio: string;
  avatar_url: string;
  user_id: string;
  upi_id: string;
}

interface AppearanceData {
  background_color: string;
  text_color: string;
  button_style: string;
  button_bg: string;
  button_text: string;
  gradient_from: string | null;
  gradient_to: string | null;
  font_family: string;
  show_avatar: boolean;
}

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  price: number | null;
  price_label: string;
  image_url: string;
  category: string;
  item_type: string;
  tags: string[];
  external_url: string;
  allow_order_form: boolean;
  variants?: { label: string; options: string[] }[];
  track_inventory?: boolean;
  stock_quantity?: number | null;
  duration?: string;
  schedule?: string;
  location?: string;
  media?: { type: 'image' | 'video'; url: string }[];
}

const defaultAppearance: AppearanceData = {
  background_color: "#ffffff",
  text_color: "#1e293b",
  button_style: "rounded",
  button_bg: "#1e293b",
  button_text: "#ffffff",
  gradient_from: null,
  gradient_to: null,
  font_family: "Inter",
  show_avatar: true,
};

const PublicServices = () => {
  const { username } = useParams<{ username?: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [appearance, setAppearance] = useState<AppearanceData>(defaultAppearance);
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeItemType, setActiveItemType] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ServiceItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const settings = usePlatformStore((s) => s.settings);
  const initialized = usePlatformStore((s) => s.initialized);
  const fetchSettings = usePlatformStore((s) => s.fetchSettings);

  useEffect(() => {
    const fetchData = async () => {
      if (!username) { setNotFound(true); setLoading(false); return; }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username.toLowerCase())
        .single();

      if (error || !profileData) { setNotFound(true); setLoading(false); return; }
      const profileStatus = (profileData as Record<string, unknown>).status as string | null | undefined;
      if (profileStatus && profileStatus !== "active") { setNotFound(true); setLoading(false); return; }

      setProfile({
        name: profileData.name,
        username: profileData.username,
        bio: profileData.bio || "",
        avatar_url: profileData.avatar_url || "",
        user_id: profileData.user_id,
        upi_id: (profileData as Record<string, unknown>).upi_id as string || "",
      });

      const [appearanceRes, catalogRes] = await Promise.all([
        supabase.from("appearance_settings").select("*").eq("user_id", profileData.user_id).single(),
        supabase.from("catalog_items").select("*").eq("user_id", profileData.user_id).eq("enabled", true).order("sort_order", { ascending: true }),
      ]);

      if (appearanceRes.data) {
        const a = appearanceRes.data;
        setAppearance({
          background_color: a.background_color, text_color: a.text_color,
          button_style: a.button_style, button_bg: a.button_bg, button_text: a.button_text,
          gradient_from: a.gradient_from, gradient_to: a.gradient_to,
          font_family: a.font_family, show_avatar: a.show_avatar,
        });
      }

      if (catalogRes.data) {
        setItems(catalogRes.data.map((d: Record<string, unknown>) => ({
          id: d.id as string,
          title: d.title as string,
          description: (d.description as string) || "",
          price: d.price as number | null,
          price_label: (d.price_label as string) || "",
          image_url: (d.image_url as string) || "",
          category: (d.category as string) || "General",
          item_type: (d.item_type as string) || "physical",
          tags: (d.tags as string[]) || [],
          external_url: (d.external_url as string) || "",
          allow_order_form: (d.allow_order_form as boolean) || false,
          variants: (d.variants as { label: string; options: string[] }[]) || [],
          track_inventory: (d.track_inventory as boolean) || false,
          stock_quantity: d.stock_quantity as number | null,
          duration: (d.duration as string) || "",
          schedule: (d.schedule as string) || "",
          location: (d.location as string) || "",
          media: (d.media as { type: 'image' | 'video'; url: string }[]) || [],
        })));
      }

      // Track view
      supabase.from("profile_views").insert({
        profile_user_id: profileData.user_id,
        referrer: document.referrer || "services-page",
      });

      setLoading(false);
    };
    fetchData();
  }, [username]);

  useEffect(() => {
    if (!initialized) {
      void fetchSettings();
    }
  }, [fetchSettings, initialized]);

  // SEO
  useEffect(() => {
    if (!profile) return;
    const hasFood = items.some((i) => i.item_type === "food");
    const hasServices = items.some((i) => i.item_type === "service");
    const pageType = hasFood && !hasServices ? "Menu" : hasServices && !hasFood ? "Services" : "Catalog";
    document.title = `${profile.name} - ${pageType} | LinkVertex`;
    return () => { document.title = "LinkVertex"; };
  }, [profile, items]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-heading font-bold text-foreground">Profile not found</h1>
          <Link to="/" className="text-primary hover:underline">Go to homepage →</Link>
        </div>
      </div>
    );
  }

  const categories = [...new Set(items.map((i) => i.category))];
  const itemTypes = [...new Set((activeCategory ? items.filter((i) => i.category === activeCategory) : items).map((i) => i.item_type).filter(Boolean))];
  useEffect(() => {
    if (activeItemType && !itemTypes.includes(activeItemType)) {
      setActiveItemType(null);
    }
  }, [activeItemType, itemTypes]);

  const filteredItems = items.filter((item) => {
    const matchesCategory = !activeCategory || item.category === activeCategory;
    const matchesItemType = !activeItemType || item.item_type === activeItemType;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesItemType && matchesSearch;
  });

  const getBtnRadius = () => {
    switch (appearance.button_style) {
      case "pill": return "rounded-full";
      case "square": return "rounded-none";
      default: return "rounded-xl";
    }
  };

  const hasServices = items.some((i) => i.item_type === "service");
  const hasFood = items.some((i) => i.item_type === "food");
  const pageTitle = hasFood && !hasServices ? "Menu" : hasServices && !hasFood ? "Services" : "Catalog";

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: appearance.gradient_from ? undefined : appearance.background_color,
        background: appearance.gradient_from
          ? `linear-gradient(135deg, ${appearance.gradient_from}, ${appearance.gradient_to})`
          : undefined,
        fontFamily: appearance.font_family,
      }}
    >
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-40 backdrop-blur-lg border-b"
        style={{
          backgroundColor: `${appearance.background_color}dd`,
          borderColor: `${appearance.text_color}10`,
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to={`/p/${profile.username}`}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-70"
              style={{ backgroundColor: `${appearance.text_color}08`, color: appearance.text_color }}
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            {appearance.show_avatar && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: appearance.button_bg }}
              >
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4" style={{ color: appearance.button_text }} />
                )}
              </div>
            )}
            <div>
              <p className="text-sm font-bold leading-tight" style={{ color: appearance.text_color }}>
                {profile.name}
              </p>
              <p className="text-[10px]" style={{ color: appearance.text_color, opacity: 0.5 }}>
                {pageTitle} · {items.length} items
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: appearance.text_color }}>
            {profile.name}'s {pageTitle}
          </h1>
          {profile.bio && (
            <p className="text-sm max-w-md mx-auto" style={{ color: appearance.text_color, opacity: 0.6 }}>
              {profile.bio}
            </p>
          )}
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: appearance.text_color, opacity: 0.4 }}
          />
          <input
            type="text"
            placeholder={`Search ${pageTitle.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm border-0 focus:outline-none focus:ring-2"
            style={{
              backgroundColor: `${appearance.text_color}06`,
              color: appearance.text_color,
              caretColor: appearance.button_bg,
            }}
          />
        </motion.div>

        {/* Category tabs */}
        {categories.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide"
          >
            <button
              onClick={() => setActiveCategory(null)}
              className={cn("px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all shrink-0", getBtnRadius())}
              style={{
                backgroundColor: !activeCategory ? appearance.button_bg : `${appearance.button_bg}15`,
                color: !activeCategory ? appearance.button_text : appearance.text_color,
              }}
            >
              All ({items.length})
            </button>
            {categories.map((cat) => {
              const count = items.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn("px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all shrink-0", getBtnRadius())}
                  style={{
                    backgroundColor: activeCategory === cat ? appearance.button_bg : `${appearance.button_bg}15`,
                    color: activeCategory === cat ? appearance.button_text : appearance.text_color,
                  }}
                >
                  {resolveCategoryLabel(cat, settings)} ({count})
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Item type tabs */}
        {itemTypes.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18 }}
            className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide"
          >
            <button
              onClick={() => setActiveItemType(null)}
              className={cn("px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all shrink-0", getBtnRadius())}
              style={{
                backgroundColor: !activeItemType ? appearance.button_bg : `${appearance.button_bg}15`,
                color: !activeItemType ? appearance.button_text : appearance.text_color,
              }}
            >
              All Types
            </button>
            {itemTypes.map((itemType) => {
              const count = (activeCategory ? items.filter((i) => i.category === activeCategory) : items).filter((i) => i.item_type === itemType).length;
              return (
                <button
                  key={itemType}
                  onClick={() => setActiveItemType(itemType)}
                  className={cn("px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all shrink-0", getBtnRadius())}
                  style={{
                    backgroundColor: activeItemType === itemType ? appearance.button_bg : `${appearance.button_bg}15`,
                    color: activeItemType === itemType ? appearance.button_text : appearance.text_color,
                  }}
                >
                  {resolveItemTypeLabel(itemType, settings)} ({count})
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Items grouped by category */}
        {(activeCategory ? [activeCategory] : categories).map((cat) => {
          const catItems = filteredItems.filter((i) => i.category === cat);
          if (catItems.length === 0) return null;
          return (
            <div key={cat} className="space-y-3">
              {!activeCategory && categories.length > 1 && (
                <h2
                  className="text-sm font-bold uppercase tracking-wider pt-2"
                  style={{ color: appearance.text_color, opacity: 0.5 }}
                >
                  {resolveCategoryLabel(cat, settings)}
                </h2>
              )}
              {catItems.map((item, i) => {
                const isOutOfStock = item.track_inventory && item.stock_quantity !== null && item.stock_quantity !== undefined && item.stock_quantity <= 0;
                const ctaLabel = resolveItemCtaLabel(item.item_type, settings, item.external_url ? "Open" : "View");
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedItem(item)}
                    className={cn(
                      "w-full text-left rounded-2xl overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] flex gap-4 p-4 border",
                      isOutOfStock && "opacity-50"
                    )}
                    style={{
                      backgroundColor: `${appearance.button_bg}06`,
                      borderColor: `${appearance.text_color}10`,
                    }}
                  >
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div
                        className="w-20 h-20 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${appearance.button_bg}12` }}
                      >
                        <span className="text-2xl">
                          {item.item_type === "food" ? "🍽" : item.item_type === "service" ? "⚡" : "📦"}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold leading-tight" style={{ color: appearance.text_color }}>
                          {item.title}
                        </p>
                        {item.price !== null && (
                          <span className="text-sm font-black shrink-0" style={{ color: appearance.button_bg }}>
                            ${item.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs line-clamp-2" style={{ color: appearance.text_color, opacity: 0.6 }}>
                          {item.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        {item.price_label && !item.price && (
                          <span className="text-[10px] font-medium" style={{ color: appearance.text_color, opacity: 0.5 }}>
                            {item.price_label}
                          </span>
                        )}
                        {item.duration && (
                          <span className="text-[10px] flex items-center gap-0.5" style={{ color: appearance.text_color, opacity: 0.5 }}>
                            <Clock className="w-3 h-3" /> {item.duration}
                          </span>
                        )}
                        {item.schedule && (
                          <span className="text-[10px] flex items-center gap-0.5" style={{ color: appearance.text_color, opacity: 0.5 }}>
                            <Calendar className="w-3 h-3" /> {item.schedule}
                          </span>
                        )}
                        {item.location && (
                          <span className="text-[10px] flex items-center gap-0.5" style={{ color: appearance.text_color, opacity: 0.5 }}>
                            <MapPin className="w-3 h-3" /> {item.location}
                          </span>
                        )}
                        {isOutOfStock && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                              style={{ backgroundColor: `${appearance.button_bg}15`, color: appearance.text_color }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="pt-1">
                        <span
                          className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-[0.12em] border"
                          style={{
                            backgroundColor: `${appearance.button_bg}15`,
                            borderColor: `${appearance.text_color}20`,
                            color: appearance.text_color,
                            opacity: isOutOfStock ? 0.55 : 0.85,
                          }}
                        >
                          {isOutOfStock ? "Out of Stock" : ctaLabel}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-16" style={{ color: appearance.text_color, opacity: 0.5 }}>
            {searchQuery ? (
              <>
                <p className="text-lg font-medium">No results for "{searchQuery}"</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">No items yet</p>
                <p className="text-sm mt-1">Check back soon!</p>
              </>
            )}
          </div>
        )}

        {/* Contact section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full pt-6"
        >
          <ContactForm
            profileUserId={profile.user_id}
            textColor={appearance.text_color}
            buttonBg={appearance.button_bg}
            buttonText={appearance.button_text}
            buttonStyle={appearance.button_style}
            hasPhoto={false}
          />
        </motion.div>

        {/* Footer */}
        <div className="pt-8 pb-4 text-center text-xs" style={{ color: appearance.text_color, opacity: 0.3 }}>
          <Link to={`/p/${profile.username}`} className="hover:underline block mb-2" style={{ opacity: 0.6 }}>
            View full profile →
          </Link>
          <Link to="/" className="hover:underline flex items-center gap-1 justify-center">
            <Zap className="w-3 h-3" /> Made with LinkVertex
          </Link>
        </div>
      </div>

      {/* Persistent Cart Footer */}
      <AnimatePresence>
        <PublicCartFooter
          buttonBg={appearance.button_bg}
          buttonText={appearance.button_text}
          onCheckout={() => setShowCheckout(true)}
        />
      </AnimatePresence>

      {/* Detail drawer */}
      <AnimatePresence>
        {selectedItem && (
          <CatalogItemDetail
            item={selectedItem}
            profileUserId={profile.user_id}
            textColor={appearance.text_color}
            buttonBg={appearance.button_bg}
            buttonText={appearance.button_text}
            buttonStyle={appearance.button_style}
            hasPhoto={false}
            onClose={() => setSelectedItem(null)}
            onTrackClick={() => {}}
            upiId={profile.upi_id}
          />
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <CheckoutModal
            isOpen={showCheckout}
            onClose={() => setShowCheckout(false)}
            profileUserId={profile.user_id}
            buttonBg={appearance.button_bg}
            buttonText={appearance.button_text}
            cardBg={appearance.background_color}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicServices;

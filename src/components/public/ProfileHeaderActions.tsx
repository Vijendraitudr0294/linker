import { useState } from "react";
import { Bell, MoreHorizontal, Share2, Flag, Moon, Sun, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileShareModal from "./ProfileShareModal";

interface ProfileHeaderActionsProps {
  username: string;
  profileName: string;
  avatarUrl?: string;
  bio?: string;
  isDark: boolean;
  onToggleDark: () => void;
  cardText: string;
  cardSub: string;
}

const ProfileHeaderActions = ({
  username, profileName, avatarUrl, bio,
  isDark, onToggleDark, cardText, cardSub,
}: ProfileHeaderActionsProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const iconBtnStyle = {
    backgroundColor: `${cardText}10`,
    color: cardSub,
    border: `1px solid ${cardText}15`,
  };

  return (
    <>
      {/* Top header buttons */}
      <div className="absolute top-4 left-4 z-20">
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
          style={iconBtnStyle}
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
          style={iconBtnStyle}
          title="More options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {/* Dropdown menu */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-30"
                onClick={() => setMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-10 z-40 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 overflow-hidden"
              >
                <button
                  onClick={() => { setMenuOpen(false); setShareOpen(true); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share this profile
                </button>
                <button
                  onClick={() => { setMenuOpen(false); window.open(`/p/${username}`, "_blank"); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in new tab
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onToggleDark(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {isDark ? "Light mode" : "Dark mode"}
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  <Flag className="w-4 h-4" />
                  Report profile
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Share modal */}
      <ProfileShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        profileName={profileName}
        username={username}
        avatarUrl={avatarUrl}
        bio={bio}
      />
    </>
  );
};

export default ProfileHeaderActions;

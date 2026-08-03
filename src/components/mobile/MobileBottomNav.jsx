import { useIsMobile } from '@/hooks/use-mobile';

// Fixed bottom tab bar — only visible on mobile (useIsMobile hook).
// Provides quick access to primary dashboard tabs.
// Uses safe-area-inset-bottom for iOS notch/home-bar spacing.
export default function MobileBottomNav({ tabs, activeTab, onTabChange }) {
  const isMobile = useIsMobile();
  if (!isMobile) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 bg-panel border-t border-hairline md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex flex-col items-center gap-0.5 px-2 py-2 flex-1 min-w-[62px] whitespace-nowrap transition-colors
              ${activeTab === tab.id ? 'text-brand' : 'text-ink-muted'}`}
          >
            <span className="relative">
              <tab.icon size={18} />
              {tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[8px] font-black px-1 py-0.5 rounded-full min-w-[14px] text-center leading-none">
                  {tab.badge}
                </span>
              )}
            </span>
            <span className="text-[9px] font-bold truncate max-w-full">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
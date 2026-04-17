import { useEffect, useState } from 'react';

// Minimal SVG paths
const SwordIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
    <line x1="13" y1="19" x2="19" y2="13" />
    <line x1="16" y1="16" x2="20" y2="20" />
    <line x1="19" y1="21" x2="21" y2="19" />
  </svg>
);

const GunIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 11h14l1 5h-4l-1-5" />
    <path d="M18 11V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4" />
    <path d="M8 11v4" />
    <path d="M12 11v4" />
    <circle cx="5" cy="11" r="1" />
  </svg>
);

export default function AnimatedBackground() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Generate random items to float around
    const generateItems = () => {
      const newItems = [];
      for (let i = 0; i < 20; i++) {
        newItems.push({
          id: i,
          type: Math.random() > 0.5 ? 'sword' : 'gun',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDuration: `${15 + Math.random() * 25}s`,
          animationDelay: `-${Math.random() * 20}s`,
          size: `${3 + Math.random() * 4}rem`, // 3rem to 7rem
          rotationDirection: Math.random() > 0.5 ? 1 : -1,
        });
      }
      setItems(newItems);
    };

    generateItems();
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      <div className="absolute inset-0 bg-gray-900" />
      
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute text-gray-700/20"
          style={{
            left: item.left,
            top: item.top,
            width: item.size,
            height: item.size,
            animation: `float ${item.animationDuration} linear infinite`,
            animationDelay: item.animationDelay,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              animation: `spin ${parseFloat(item.animationDuration) * 0.8}s linear infinite`,
              animationDirection: item.rotationDirection > 0 ? 'normal' : 'reverse',
            }}
          >
            {item.type === 'sword' ? (
              <SwordIcon className="w-full h-full" />
            ) : (
              <GunIcon className="w-full h-full" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

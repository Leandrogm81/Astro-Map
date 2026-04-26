'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Moon, Sun, Sparkles, ChevronDown, Star, Zap } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface UnifiedMenuProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  items?: MenuItem[];
}

export default function UnifiedMenu({ activeTab, onTabChange, items }: UnifiedMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 192;
      let left = rect.left;
      if (left + dropdownWidth > window.innerWidth - 16) {
        left = window.innerWidth - dropdownWidth - 16;
      }
      if (left < 16) left = 16;
      setCoords({
        top: rect.bottom + 8,
        left,
      });
    }
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleItemClick = (tabId: string) => {
    onTabChange(tabId);
    closeMenu();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutsideButton = menuRef.current && !menuRef.current.contains(target);
      const clickedOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target);
      
      if (clickedOutsideButton && clickedOutsideDropdown) {
        closeMenu();
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
        buttonRef.current?.focus();
      }
    };
    
    const handleScrollOrResize = () => {
      if (isOpen) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
      window.addEventListener('scroll', handleScrollOrResize, { passive: true });
      window.addEventListener('resize', handleScrollOrResize);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const defaultItems = [
    { id: 'chart', label: 'Visão Geral', icon: Star },
    { id: 'houses', label: 'Casas', icon: Moon },
    { id: 'aspects', label: 'Aspectos', icon: Sun },
    { id: 'report', label: 'Relatório IA', icon: Sparkles },
  ] as const;

  const menuItems = items || defaultItems;

  const isAnyTabActive = menuItems.some(item => item.id === activeTab);
  const activeItem = menuItems.find(item => item.id === activeTab) || menuItems[0];

  const dropdownStyle = useMemo(() => ({
    position: 'fixed' as const,
    top: coords ? `${coords.top}px` : 0,
    left: coords ? `${coords.left}px` : 0,
  }), [coords]);

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        aria-haspopup="menu"
        aria-controls="analysis-menu"
        className={`px-4 py-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all whitespace-nowrap border ${
          isOpen || isAnyTabActive
            ? 'bg-gold-500/20 text-gold-400 border-gold-500/30 shadow-lg shadow-gold-500/5'
            : 'text-slate-400 border-transparent hover:text-slate-100 hover:bg-white/5'
        }`}
      >
        <activeItem.icon className={`w-3.5 h-3.5 pointer-events-none transition-transform duration-200 ${isOpen ? 'scale-110' : ''}`} />
        <span className="pointer-events-none">{activeItem.label}</span>
        <ChevronDown className={`w-3 h-3 pointer-events-none transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && coords && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          id="analysis-menu"
          role="menu"
          /* eslint-disable-next-line react/forbid-dom-props */
          style={dropdownStyle}
          className="w-48 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 z-[100] animate-in fade-in zoom-in-95 duration-200"
        >
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              onClick={() => handleItemClick(item.id)}
              className={`w-full px-4 py-2.5 flex items-center gap-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                activeTab === item.id
                  ? 'bg-gold-500/10 text-gold-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

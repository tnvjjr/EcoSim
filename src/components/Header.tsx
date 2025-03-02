import React from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon, InfoIcon, RefreshCwIcon, Trash2Icon } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="w-full px-6 py-3 flex items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-semibold">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 22H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M17 22V6C17 5.46957 16.7893 4.96086 16.4142 4.58579C16.0391 4.21071 15.5304 4 15 4H9C8.46957 4 7.96086 4.21071 7.58579 4.58579C7.21071 4.96086 7 5.46957 7 6V22" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 22V15" stroke="currentColor" strokeWidth="2"/>
            <path d="M10 8H14" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 11H14" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>
        <h1 className="text-xl font-semibold">EcoSim</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="px-3 py-1 h-8 text-xs rounded-full button-transition shadow-button hover:shadow-button-hover">
          <InfoIcon size={14} className="mr-1.5" /> Help
        </Button>
        <Button variant="outline" size="sm" className="px-3 py-1 h-8 text-xs rounded-full button-transition shadow-button hover:shadow-button-hover">
          <DownloadIcon size={14} className="mr-1.5" /> Export
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onReset}
          className="px-3 py-1 h-8 text-xs rounded-full text-destructive button-transition hover:bg-destructive/10"
        >
          <Trash2Icon size={14} className="mr-1.5" /> Reset
        </Button>
      </div>
    </header>
  );
};

export default Header;

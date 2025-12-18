
import React, { useState } from 'react';
import { MessageSquare, Mic, Search, Image as ImageIcon, Sparkles, BookOpen, User } from 'lucide-center';
import LearningChat from './components/LearningChat';
import LiveConversation from './components/LiveConversation';
import SearchGrounding from './components/SearchGrounding';
import ImageGenerator from './components/ImageGenerator';
import { TabType } from './types';

// Standard Lucide icons sometimes have issues if imports are named incorrectly in the prompt.
// Using standard ones from 'lucide-react'.
import { 
  MessageSquare as MsgIcon, 
  Mic as MicIcon, 
  Search as SearchIcon, 
  Image as ImgIcon, 
  BookOpen as BookIcon, 
  User as UserIcon 
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.CHAT);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden">
      {/* Decorative elements */}
      <div className="fixed top-20 -right-20 w-64 h-64 bg-rose-200/20 blur-[100px] rounded-full" />
      <div className="fixed -bottom-20 -left-20 w-64 h-64 bg-orange-200/20 blur-[100px] rounded-full" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200 relative overflow-hidden group">
              <BookIcon className="text-white w-6 h-6 relative z-10" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none tracking-tight">
                <span className="text-slate-800">Hola</span>
                <span className="text-rose-500">Amigo</span>
              </h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">A2 Specialist</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-1">
              <NavButton 
                active={activeTab === TabType.CHAT} 
                onClick={() => setActiveTab(TabType.CHAT)}
                icon={<MsgIcon className="w-4 h-4" />}
                label="Tutor Chat"
              />
              <NavButton 
                active={activeTab === TabType.LIVE} 
                onClick={() => setActiveTab(TabType.LIVE)}
                icon={<MicIcon className="w-4 h-4" />}
                label="Voice Practice"
              />
              <NavButton 
                active={activeTab === TabType.SEARCH} 
                onClick={() => setActiveTab(TabType.SEARCH)}
                icon={<SearchIcon className="w-4 h-4" />}
                label="Cultural Search"
              />
              <NavButton 
                active={activeTab === TabType.IMAGE} 
                onClick={() => setActiveTab(TabType.IMAGE)}
                icon={<ImgIcon className="w-4 h-4" />}
                label="Visuals"
              />
            </nav>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
              <div className="w-6 h-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                <UserIcon className="w-4 h-4 text-slate-600" />
              </div>
              <span className="text-sm font-bold text-slate-700">A2 Learner</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 z-10">
        <div className="h-full bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-100 flex flex-col transition-all duration-500">
          {activeTab === TabType.CHAT && <LearningChat />}
          {activeTab === TabType.LIVE && <LiveConversation />}
          {activeTab === TabType.SEARCH && <SearchGrounding />}
          {activeTab === TabType.IMAGE && <ImageGenerator />}
        </div>
      </main>

      {/* Mobile Navigation */}
      <footer className="md:hidden sticky bottom-0 z-50 bg-white/90 backdrop-blur-md border-t border-slate-100 px-6 py-4 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <nav className="flex justify-between items-center">
          <MobileNavButton 
            active={activeTab === TabType.CHAT} 
            onClick={() => setActiveTab(TabType.CHAT)}
            icon={<MsgIcon className="w-6 h-6" />}
          />
          <MobileNavButton 
            active={activeTab === TabType.LIVE} 
            onClick={() => setActiveTab(TabType.LIVE)}
            icon={<MicIcon className="w-6 h-6" />}
          />
          <MobileNavButton 
            active={activeTab === TabType.SEARCH} 
            onClick={() => setActiveTab(TabType.SEARCH)}
            icon={<SearchIcon className="w-6 h-6" />}
          />
          <MobileNavButton 
            active={activeTab === TabType.IMAGE} 
            onClick={() => setActiveTab(TabType.IMAGE)}
            icon={<ImgIcon className="w-6 h-6" />}
          />
        </nav>
      </footer>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 group relative ${
      active 
        ? 'text-rose-600' 
        : 'text-slate-500 hover:text-slate-900'
    }`}
  >
    {active && (
      <div className="absolute inset-0 bg-rose-50 rounded-xl -z-10 animate-in fade-in zoom-in-95 duration-200" />
    )}
    <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </span>
    <span className={`text-sm font-bold tracking-tight ${active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
      {label}
    </span>
  </button>
);

const MobileNavButton: React.FC<Omit<NavButtonProps, 'label'>> = ({ active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`p-3 rounded-2xl transition-all duration-300 relative ${
      active ? 'text-rose-500 scale-125' : 'text-slate-400'
    }`}
  >
    {active && (
      <div className="absolute inset-0 bg-rose-100/50 rounded-2xl -z-10 blur-md animate-pulse" />
    )}
    {icon}
  </button>
);

export default App;

// UI state store (modals, sidebars, notifications)
import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isFilterPanelOpen: boolean;
  activeModal: string | null;
  notifications: Notification[];
  
  toggleSidebar: () => void;
  toggleFilterPanel: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  isFilterPanelOpen: false,
  activeModal: null,
  notifications: [],

  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  toggleFilterPanel: () => set(state => ({ isFilterPanelOpen: !state.isFilterPanelOpen })),
  
  openModal: (modalId: string) => set({ activeModal: modalId }),
  
  closeModal: () => set({ activeModal: null }),
  
  addNotification: (notification) => {
    const id = `notif_${Date.now()}`;
    const newNotification = { id, ...notification };
    
    set(state => ({ 
      notifications: [...state.notifications, newNotification] 
    }));
    
    // Auto-remove after duration
    if (notification.duration) {
      setTimeout(() => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      }, notification.duration);
    }
  },
  
  removeNotification: (id: string) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
}));

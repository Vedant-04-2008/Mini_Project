import { create } from 'zustand';

export const useStore = create((set) => ({
    // Authentication State
    user: null,
    setUser: (user) => set({ user }),
    
    // Core Data State
    hazards: [],
    setHazards: (hazards) => set({ hazards }),
    
    routes: null,
    setRoutes: (routes) => set({ routes }),
    
    // Guardian Mode State
    guardianActive: false,
    setGuardianActive: (status) => set({ guardianActive: status }),
    
    // Offline/PWA Resiliency State
    isOffline: !navigator.onLine,
    setIsOffline: (status) => set({ isOffline: status }),
}));


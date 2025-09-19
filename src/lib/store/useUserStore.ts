import { ISession, IUser } from "../../../auth-client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserStoreState {
  currentUser: IUser | null;
  setCurrentUser: (data: IUser) => void;
  session: ISession | null;
  setSession: (data: ISession) => void;
  logoutUser: () => void;
}

const useUserStore = create<UserStoreState>()(
  persist(
    (set) => ({
      currentUser: null,
      session: null,

      setSession: (data) => set({ session: data }),
      setCurrentUser: (data) => set({ currentUser: data }),
      logoutUser: () => {
        set({
          currentUser: null,
        });
      },
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser
          ? {
              id: state.currentUser.id,
              name: state.currentUser.name,
            }
          : null,
      }),
    }
  )
);

export default useUserStore;

import { create } from "zustand";

export const useAppBarStore = create((set) => ({
  title: "",
  setTitle: (title) => set({ title }),
  clearTitle: () => set({ title: "" })
}));
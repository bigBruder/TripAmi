import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer';
import {createJSONStorage, persist} from 'zustand/middleware';
import {ITravel} from "~/types/travel";

interface State {
  trips: ITravel[] | null,
}

interface Actions {
  setTips: (trips: ITravel[]) => void;
}

const useMapContext = create<State & Actions>()(
  immer(
    persist(
      set => ({
        trips: null,
        setTips: (trips: ITravel[]) =>
          set(state => {
            state.trips = trips;
          }),
      }),
      {
        name: 'tripsStorage',
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
  ),
);

export default useMapContext;

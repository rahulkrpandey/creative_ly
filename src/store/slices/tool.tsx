import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UndoRedo {
  undoRedoArrays: [[string]];
  undoRedoArraysIndex: number;
  currentIndexInSingleArray: number;
}

export interface CounterState {
  penWidth: string;
  penColor: string;
  undoRedoTracker: UndoRedo;
  createNotesToggle: boolean;
  imgUrl: string | null;
  lazer: boolean;
}

const initialState: CounterState = {
  penWidth: "3",
  penColor: "#020617", // black
  undoRedoTracker: {
    undoRedoArrays: [[""]],
    undoRedoArraysIndex: 0,
    currentIndexInSingleArray: 0,
  },
  createNotesToggle: false,
  imgUrl: null,
  lazer: false,
};

export const toolSlice = createSlice({
  name: "tool",
  initialState,
  reducers: {
    changePenWidth: (state, action: PayloadAction<string>) => {
      console.log("changePenWidth");
      console.log(action.payload);
      state.penWidth = action.payload;
    },

    changePenColor: (state, action: PayloadAction<string>) => {
      console.log("changePenColor");
      console.log(action.payload);
      state.penColor = action.payload;
    },

    undo: (state) => {
      if (state.undoRedoTracker.currentIndexInSingleArray > 0) {
        console.log("undo");
        state.undoRedoTracker.currentIndexInSingleArray--;
      }
    },

    redo: (state) => {
      if (
        state.undoRedoTracker.currentIndexInSingleArray <
        state.undoRedoTracker.undoRedoArrays[
          state.undoRedoTracker.undoRedoArraysIndex
        ].length -
          1
      ) {
        console.log("redo");
        state.undoRedoTracker.currentIndexInSingleArray++;
      }
    },

    updateUndoRedoTracker: (state, action: PayloadAction<string>) => {
      const url = action.payload;
      const undoRedoTracker = state.undoRedoTracker;

      undoRedoTracker.undoRedoArrays[undoRedoTracker.undoRedoArraysIndex].push(
        url
      );

      undoRedoTracker.currentIndexInSingleArray =
        undoRedoTracker.undoRedoArrays[undoRedoTracker.undoRedoArraysIndex]
          .length - 1;

      console.log("updated", undoRedoTracker.currentIndexInSingleArray);
    },

    initialiseUndoRedoTracker: (state, action: PayloadAction<string>) => {
      state.undoRedoTracker.undoRedoArrays[0][0] = action.payload;
    },

    nextPage: (state) => {
      const tracker = state.undoRedoTracker;
      const idx = tracker.currentIndexInSingleArray;
      const j = tracker.undoRedoArraysIndex;
      const arr = tracker.undoRedoArrays[j];
      while (arr.length > idx + 1) {
        arr.pop();
      }

      if (tracker.undoRedoArraysIndex === tracker.undoRedoArrays.length - 1) {
        tracker.undoRedoArrays.push([tracker.undoRedoArrays[0][0]]);
        tracker.currentIndexInSingleArray = 0;
      } else {
        tracker.currentIndexInSingleArray =
          tracker.undoRedoArrays[tracker.undoRedoArraysIndex + 1].length - 1;
      }

      tracker.undoRedoArraysIndex++;
      console.log("done");
    },

    prevPage: (state) => {
      const tracker = state.undoRedoTracker;
      const idx = tracker.currentIndexInSingleArray;
      const j = tracker.undoRedoArraysIndex;
      const arr = tracker.undoRedoArrays[j];
      while (arr.length > idx + 1) {
        arr.pop();
      }

      if (tracker.undoRedoArraysIndex > 0) {
        tracker.undoRedoArraysIndex--;
        tracker.currentIndexInSingleArray =
          tracker.undoRedoArrays[tracker.undoRedoArraysIndex].length - 1;
      }

      console.log("done");
    },

    createNotes: (state) => {
      state.createNotesToggle = !state.createNotesToggle;
    },

    changeImgUrl: (state, acton: PayloadAction<string>) => {
      state.imgUrl = acton.payload;
    },

    setLazerTrue: (state) => {
      console.log("set true");
      state.lazer = true;
    },

    setLazerFalse: (state) => {
      console.log("set false");
      state.lazer = false;
    },

    clearFrame: (state) => {
      const tracker = state.undoRedoTracker;
      if (
        tracker.undoRedoArrays[tracker.undoRedoArraysIndex][
          tracker.currentIndexInSingleArray
        ] === tracker.undoRedoArrays[0][0]
      ) {
        return;
      }
      
      tracker.undoRedoArrays[tracker.undoRedoArraysIndex].push(
        tracker.undoRedoArrays[0][0]
      );
      tracker.currentIndexInSingleArray++;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  changePenColor,
  changePenWidth,
  undo,
  redo,
  updateUndoRedoTracker,
  initialiseUndoRedoTracker,
  nextPage,
  prevPage,
  createNotes,
  changeImgUrl,
  setLazerTrue,
  setLazerFalse,
  clearFrame,
} = toolSlice.actions;

export default toolSlice.reducer;

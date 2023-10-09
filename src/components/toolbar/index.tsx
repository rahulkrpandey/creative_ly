import React, { ReactNode, useEffect, useState, useRef } from "react";
import { RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import {
  changePenColor,
  changePenWidth,
  undo,
  redo,
  prevPage,
  nextPage,
  createNotes,
  changeImgUrl,
  setLazerTrue,
  setLazerFalse,
  clearFrame,
} from "../../store/slices/tool";
import { AiOutlineClear } from "react-icons/ai";
import { LiaDownloadSolid, LiaUploadSolid } from "react-icons/lia";
import { BsPencil, BsEraser, BsSticky, BsPen } from "react-icons/bs";
import { BiImage } from "react-icons/bi";
import { CiUndo, CiRedo } from "react-icons/ci";
import { IconContext } from "react-icons";
import { GrNext, GrPrevious } from "react-icons/gr";
import capture from "html2canvas";

interface MyIcon {
  icon: ReactNode;
  selected: boolean;
  bgColor?: string | null;
}

const Icon: React.FC<MyIcon> = ({ icon, selected, bgColor }) => {
  console.log(bgColor);
  return (
    <IconContext.Provider
      value={{
        color: selected && bgColor === "bg-slate-950" ? "white" : "black",
        className: "global-class-name",
        // size: "28",
      }}
    >
      <div
        className={`hover:cursor-pointer rounded-full border-2 border-black p-1 lg:p-3 flex justify-center items-center ${
          selected && (bgColor ? bgColor : "bg-slate-950")
        } ${!selected && "bg-orange-500"} lg:text-2xl`}
      >
        {icon}
      </div>
    </IconContext.Provider>
  );
};

const Toolbar: React.FC = () => {
  const toolbar = {
    PLUS: 0,
    UPLOAD: 1,
    DOWNLOAD: 2,
    PEN: 3,
    ERASE: 4,
    NOTE: 5,
    IMG: 6,
    LASER: 7,
    UNDO: 8,
    REDO: 9,
    CLR: 10,
    NEXT: 11,
    PREV: 12,
  };

  const penColors = [
    "#020617", // black
    "#d946ef", // white
    "#f43f5e", // rose-500
    "#14b8a6", // teal
    "#0ea5e9", // sky
    "#f59e0b", // amber - yellow
  ];

  const penColorsMap = [
    "bg-slate-950", // black
    "bg-fuchsia-500", // white
    "bg-rose-500", // rose-500
    "bg-teal-500", // teal
    "bg-sky-500", // sky
    "bg-amber-500", // amber - yellow
  ];

  // const [pen, setPen] = useState<string>("3");
  const dispatch = useDispatch();
  const { penWidth, penColor, undoRedoTracker, imgUrl, lazer } = useSelector(
    (state: RootState) => state.tool
  );
  const [selectedColorNumber, setSelectedColorNumber] = useState<number>(0);
  const [inputNumber, setInputNumbmer] = useState<number[]>([0]);
  const [currentTool, setCurrenttool] = useState<number>(toolbar.PEN);
  const [showPenMenu, setShowPenMenu] = useState<boolean>(false);
  const [pageNumber, setPageNumber] = useState<{ p: number; t: number }>({
    p: 1,
    t: 1,
  });
  const penConfigRef = useRef<{
    width: string;
    colorNum: number;
  }>({
    width: "3",
    colorNum: 0,
  });

  const prevPenColorNumberRef = useRef<number | null>(null);

  const _link: HTMLAnchorElement = document.createElement("a");

  const iconClickHandler = (tool: number) => {
    if (tool === toolbar.CLR) {
      dispatch(clearFrame());
    } else if (tool == toolbar.DOWNLOAD) {
      console.log("i am inside download");
      // const url =
      //   undoRedoTracker.undoRedoArrays[undoRedoTracker.undoRedoArraysIndex][
      //     undoRedoTracker.currentIndexInSingleArray
      //   ];
      // if (url) {
      //   _link.href = url;
      //   _link.download = "doodle.jpg";
      //   _link.click();
      // }
      const area = document.getElementById("frameArea");
      if (area) {
        capture(area).then((canvas) => {
          _link.href = canvas.toDataURL();
          _link.download = "doodle.jpg";
          _link.click();
        });
      }
    } else if (tool === toolbar.NOTE) {
      dispatch(createNotes());
    } else if (tool === toolbar.NEXT) {
      dispatch(nextPage());
    } else if (tool === toolbar.PREV) {
      dispatch(prevPage());
    } else if (tool === toolbar.UNDO) {
      dispatch(undo());
    } else if (tool === toolbar.REDO) {
      dispatch(redo());
    } else if (tool === toolbar.PEN) {
      if (lazer) {
        dispatch(setLazerFalse());
        dispatch(changePenColor(penColorsMap[selectedColorNumber]));
      }

      if (currentTool === toolbar.PEN) {
        setShowPenMenu((k) => !k);
      } else {
        if (penColor !== penColors[selectedColorNumber]) {
          console.log(penConfigRef.current, penColor);
          dispatch(changePenColor(penColors[penConfigRef.current.colorNum]));
          dispatch(changePenWidth(penConfigRef.current.width));
        }
        setCurrenttool(toolbar.PEN);
      }
    } else if (currentTool !== tool) {
      if (lazer) {
        dispatch(setLazerFalse());
      }

      setShowPenMenu(false);
      if (tool === toolbar.ERASE) {
        prevPenColorNumberRef.current = selectedColorNumber;
        penConfigRef.current.width = penWidth;
        penConfigRef.current.colorNum = selectedColorNumber;
        dispatch(changePenColor("#f8fafc"));
        dispatch(changePenWidth("10"));
      } else if (tool === toolbar.LASER) {
        prevPenColorNumberRef.current = selectedColorNumber;
        dispatch(setLazerTrue());
        dispatch(changePenColor("#9f1239"));
      }
      setCurrenttool(tool);
    }
  };

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("here");
    if (e.target.files && e.target.files.length > 0) {
      const files = e.target.files;
      if (files[0].type !== "image/jpeg") {
        alert("type not supported");
        return;
      } else {
        const url = URL.createObjectURL(files[0]);
        dispatch(changeImgUrl(url));
      }
    }
  };

  useEffect(() => {
    for (let i = 0; i < penColors.length; i++) {
      if (penColor === penColors[i]) {
        setSelectedColorNumber(i);
        break;
      }
    }
    console.log("use effect called", selectedColorNumber);
  }, [penColor]);

  useEffect(() => {
    if (
      undoRedoTracker.undoRedoArraysIndex + 1 !== pageNumber.p ||
      undoRedoTracker.undoRedoArrays.length !== pageNumber.t
    ) {
      setPageNumber({
        p: undoRedoTracker.undoRedoArraysIndex + 1,
        t: undoRedoTracker.undoRedoArrays.length,
      });
    }
  }, [undoRedoTracker, setPageNumber]);

  useEffect(() => {
    setInputNumbmer((num) => (num[0] == 1 ? [0] : [1]));
  }, [imgUrl, setInputNumbmer]);

  return (
    <div className="flex gap-2 lg:gap-4 justify-center bg-cyan-800 z-50 border-b-2 border-black ">
      <h1
        style={{ fontFamily: "Shadows Into Light, cursive" }}
        className=" flex items-center self-stretch justify-center text-lg lg:text-5xl font-bold text-orange-500 text p-2 lg:p-1 bg-black"
      >
        <span>Creative.ly</span>
      </h1>

      <div className="flex justify-start lg:overflow-hidden overflow-auto max-w-xs md:max-w-lg lg:max-w-full">
        <div className="flex gap-2 my-auto lg:gap-4 justify-center items-center px-2 py-1 lg:p-2 ">
          <button
            className="flex flex-col justify-center items-center gap-2 hover:scale-110"
            onClick={() => iconClickHandler(toolbar.DOWNLOAD)}
          >
            <Icon
              icon={<LiaDownloadSolid />}
              selected={currentTool === toolbar.DOWNLOAD}
              bgColor={"bg-slate-950"}
            />
          </button>

          {/* <div
        className="flex flex-col justify-center items-center gap-2"
        onClick={() => iconClickHandler(toolbar.UPLOAD)}
      >
        <Icon
          icon={<LiaUploadSolid />}
          selected={currentTool === toolbar.UPLOAD}
        />
      </div> */}

          <button
            onClick={() => iconClickHandler(toolbar.PEN)}
            className="flex flex-col justify-center items-center gap-2 "
          >
            <div className="hover:scale-110">
              <Icon
                icon={<BsPencil />}
                selected={currentTool === toolbar.PEN}
                bgColor={penColorsMap[selectedColorNumber]}
              />
            </div>

            <div className="absolute translate-y-28 z-50">
              <div className="relative">
                <div
                  className={`w-48 flex flex-col items-stretch justify-center gap-2 p-2 rounded-md border-2  shadow-gray-200 shadow-md ${
                    !showPenMenu && "hidden"
                  } bg-white `}
                >
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={penWidth}
                    onChange={(e) => dispatch(changePenWidth(e.target.value))}
                  />

                  <div
                    className={`flex flex-wrap gap-6 py-2 justify-center items-center border-2 border-gray-200
            `}
                  >
                    {Object.keys(penColors).map((id) => (
                      <div
                        className={`${penColorsMap[+id]} w-7 h-7 rounded-full ${
                          penColors[+id] === "#fff" && "border-2"
                        }  hover:cursor-pointer ${
                          penColors[+id] === penColor && "ring-4 ring-gray-300"
                        }`}
                        key={id}
                        // onClick={(e) => setSelectedColorNumber(+id)}
                        onClick={(e) =>
                          dispatch(changePenColor(penColors[+id]))
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </button>

          <button
            className="flex flex-col justify-center items-center gap-2 hover:scale-110"
            onClick={() => iconClickHandler(toolbar.LASER)}
          >
            <Icon
              icon={<BsPen />}
              selected={currentTool === toolbar.LASER}
              bgColor={"bg-rose-800"}
            />
          </button>

          <button
            className="flex flex-col justify-center items-center gap-2 hover:scale-110"
            onClick={() => iconClickHandler(toolbar.ERASE)}
          >
            <Icon
              icon={<BsEraser />}
              selected={currentTool === toolbar.ERASE}
              bgColor={"bg-slate-950"}
            />
          </button>

          <button className="flex flex-col justify-center items-center gap-2 hover:scale-110">
            {inputNumber.map((id) => (
              <input
                type={"file"}
                className=" absolute opacity-0 h-10 w-10"
                onChange={(e) => changeHandler(e)}
                key={id}
              />
            ))}
            <Icon icon={<BiImage />} selected={currentTool === toolbar.IMG} />
          </button>

          <button
            className="flex flex-col justify-center items-center gap-2 hover:scale-110"
            onClick={() => iconClickHandler(toolbar.NOTE)}
          >
            <Icon icon={<BsSticky />} selected={currentTool === toolbar.NOTE} />
          </button>

          <button
            className="flex flex-col justify-center items-center gap-2 hover:scale-110"
            onClick={() => iconClickHandler(toolbar.UNDO)}
          >
            <Icon icon={<CiUndo />} selected={currentTool === toolbar.UNDO} />
          </button>

          <button
            className="flex flex-col justify-center items-center gap-2 hover:scale-110"
            onClick={() => iconClickHandler(toolbar.REDO)}
          >
            <Icon icon={<CiRedo />} selected={currentTool === toolbar.REDO} />
          </button>

          <button
            className="flex flex-col justify-center items-center gap-2 hover:scale-110"
            onClick={() => iconClickHandler(toolbar.PREV)}
          >
            <Icon
              icon={<GrPrevious />}
              selected={currentTool === toolbar.PREV}
            />
          </button>

          {/* <div className="relative">
        <div className="absolute">
          <div className=" flex flex-col justify-center items-center gap-2  border-2 border-black bg-orange-500 text-lg w-12 h-8">
            {`${pageNumber.p} / ${pageNumber.t}`}
          </div>
        </div>
      </div> */}
          <div className=" flex flex-col justify-center items-center gap-2  border-2 border-black bg-orange-500  w-12 h-4 lg:w-16 lg:h-8">
            <div className=" flex flex-col justify-center items-center gap-2  border-2 border-black bg-orange-500 text-xs lg:text-lg w-12 h-4 lg:w-16 lg:h-8 translate-x-1 translate-y-1">
              {`${pageNumber.p} / ${pageNumber.t}`}
            </div>
          </div>

          <button
            className="flex flex-col justify-center items-center gap-2 hover:scale-110"
            onClick={() => iconClickHandler(toolbar.NEXT)}
          >
            <Icon icon={<GrNext />} selected={currentTool === toolbar.NEXT} />
          </button>

          <button
            className="flex flex-col justify-center items-center gap-2 hover:scale-110"
            onClick={() => iconClickHandler(toolbar.CLR)}
          >
            <Icon
              icon={<AiOutlineClear />}
              selected={currentTool === toolbar.CLR}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;

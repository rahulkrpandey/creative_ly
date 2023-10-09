import React, { useRef, useState, useEffect } from "react";
import Toolbar from "../../components/toolbar";
import { useSelector, useDispatch } from "react-redux";
import {
  updateUndoRedoTracker,
  initialiseUndoRedoTracker,
  changePenColor,
} from "../../store/slices/tool";
import { RootState } from "../../store";
import { VscChromeMinimize } from "react-icons/vsc";
import { RxCross2 } from "react-icons/rx";
import Draggable from "react-draggable";
import { v4 as newIds } from "uuid";
import DragNDrop from "../../DragNDrop";

interface DocType {
  selected: boolean;
  dimension: {
    w: number;
    h: number;
  };

  zIndex?: string;
  parentRef?: React.MutableRefObject<HTMLDivElement | null>;
}

interface NotesType {
  id: string;
  setIds: React.Dispatch<React.SetStateAction<string[]>>;
  img: boolean;
}

const StickyNotes: React.FC<NotesType> = ({ id, setIds, img }) => {
  const [minimised, setMinimised] = useState<boolean>(false);
  const [removed, setRemoved] = useState<boolean>(false);

  const minimiseHandler = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    console.log("minimised");
    setMinimised((k) => !k);
  };

  const removeHandler = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    console.log("removed");
    setIds((arr) => arr.filter((item) => item !== id));
    setRemoved(true);
  };

  if (removed) {
    return null;
  }

  return (
    <div
      className={`${!minimised && "w-52 h-60"} rounded-md shadow-lg ${
        // className={`absolute  ${!minimised && "w-52 h-60"} rounded-md shadow-lg ${
        minimised && " h-[2.125rem] w-20 z-40"
      } z-40 border-2 border-black`}
    >
      <div
        className={`h-8 bg-cyan-800 flex justify-end items-center gap-2 p-2 ${
          !minimised && "border-b-2"
        } border-black`}
      >
        <button
          className="h-5 w-5 bg-orange-500 border-2 border-black rounded-full flex items-center justify-center opacity-70 cursor-none"
          onClick={(e) => minimiseHandler(e)}
        >
          <VscChromeMinimize />
        </button>
        <button
          className="h-5 w-5 bg-red-500 border-2 border-black rounded-full flex items-center justify-center  opacity-70 cursor-none"
          onClick={(e) => removeHandler(e)}
        >
          <RxCross2 />
        </button>
      </div>
      <textarea
        className={`w-full h-[12.8rem] outline-none resize-none p-2 ${
          minimised && "hidden"
        } font-bold z-50 ${img && " opacity-0 absolute hover:cursor-pointer"} `}
        spellCheck={false}
        maxLength={img ? 0 : 160}
      ></textarea>
      {img && (
        <img
          src={id}
          className={`w-full h-[12.8rem] ${minimised && "hidden"} z-30`}
        />
      )}
    </div>
  );
};

const Document: React.FC<DocType> = ({ selected, parentRef, dimension }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const countRef = useRef<number>(2);
  // const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [moving, setMoving] = useState<boolean>(false);
  const [cord, setCord] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [url, setUrl] = useState<string>("");
  const [notes, setNotes] = useState<string[]>([]);
  const [imgUrls, setImgUrls] = useState<string[]>([]);

  const { penColor, penWidth, undoRedoTracker, createNotesToggle, imgUrl } =
    useSelector((state: RootState) => state.tool);

  const dispatch = useDispatch();

  const moveStartHandler = (X: number, Y: number) => {
    console.log("handler called a");
    const _ctx = ctxRef.current;
    if (!_ctx) {
      return;
    }

    _ctx.beginPath();
    const x = X - cord.x,
      y = Y - cord.y;
    _ctx.moveTo(x, y);
    setMoving(true);
  };

  const moveHandler = (X: number, Y: number) => {
    const _ctx = ctxRef.current;
    if (!_ctx || moving === false) {
      console.log("handler called b");
      return;
    }

    const x = X - cord.x,
      y = Y - cord.y;
    _ctx.lineTo(x, y);
    _ctx.stroke();
  };

  const moveEndHandler = () => {
    console.log("handler called c");
    const url = canvasRef.current?.toDataURL();
    console.log(url);
    if (url) {
      dispatch(updateUndoRedoTracker(url));
    }
    setMoving(false);
  };

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = dimension.w;
      canvasRef.current.height = dimension.h;
      const temp = canvasRef.current.getContext("2d");
      if (!temp) {
        return;
      }

      const rect = canvasRef.current.getBoundingClientRect();
      const x = rect.left + window.scrollX;
      const y = rect.top + window.scrollY;

      temp.lineWidth = +penWidth;
      temp.strokeStyle = penColor;
      ctxRef.current = temp;

      setCord({
        x,
        y,
      });

      const url = canvasRef.current.toDataURL();
      dispatch(initialiseUndoRedoTracker(url));
    }
  }, [dimension]);

  useEffect(() => {
    if (canvasRef.current && ctxRef.current) {
      ctxRef.current.lineWidth = +penWidth;
      ctxRef.current.strokeStyle = penColor;
    }
  }, [penColor, penWidth]);

  useEffect(() => {
    console.log(
      "mat",
      undoRedoTracker.undoRedoArraysIndex,
      undoRedoTracker.currentIndexInSingleArray
    );
    setUrl(
      undoRedoTracker.undoRedoArrays[undoRedoTracker.undoRedoArraysIndex][
        undoRedoTracker.currentIndexInSingleArray
      ]
    );
  }, [undoRedoTracker, cord]);

  useEffect(() => {
    const img = new Image();
    img.src = url;
    img.onload = (e) => {
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        console.log(
          "printed",
          undoRedoTracker.undoRedoArraysIndex,
          undoRedoTracker.currentIndexInSingleArray,
          // undoRedoTracker.undoRedoArrays[undoRedoTracker.undoRedoArraysIndex].length,
          url
        );
      }
    };
  }, [url, setUrl]);

  useEffect(() => {
    if (countRef.current > 0) {
      countRef.current--;
      return;
    }

    console.log("toggling");
    setNotes((notes) => [...notes, newIds()]);
  }, [createNotesToggle]);

  useEffect(() => {
    if (imgUrl) {
      setImgUrls((urls) => [...urls, imgUrl]);
    }
  }, [imgUrl]);

  return (
    <div className="h-full w-full relative">
      {notes.map((item, idx) => (
        <DragNDrop
          _ref={parentRef}
          key={item}
          children={<StickyNotes id={item} setIds={setNotes} img={false} />}
        />
        // <StickyNotes id={item} setIds={setNotes} key={item} img={false} />
      ))}

      {imgUrls.map((item) => (
        <DragNDrop
          _ref={parentRef}
          key={item}
          children={<StickyNotes id={item} setIds={setImgUrls} img={true} />}
        />
      ))}

      <canvas
        ref={canvasRef}
        onMouseDown={(e) => moveStartHandler(e.clientX, e.clientY)}
        onMouseMove={(e) => moveHandler(e.clientX, e.clientY)}
        onMouseUp={(e) => moveEndHandler()}
        onMouseLeave={(e) => moveEndHandler()}
        onTouchStart={(e) => {
          moveStartHandler(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          moveHandler(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={(e) => {
          moveEndHandler();
        }}
        onTouchCancel={(e) => moveEndHandler()}
        className="bg-slate-50"
      ></canvas>
    </div>
  );
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LaserCanvas
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const LaserCanvas: React.FC<DocType> = ({ dimension }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [moving, setMoving] = useState<boolean>(false);
  const [cord, setCord] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const colors: string[] = [
    "#9f1239",
    "#be123c",
    "#bf0d39",
    "#e11d48",
    "#e01441",
    "#f43f5e",
  ];

  const animationDuration: number = 300;

  const lazerAnimation = () => {
    const hexToRgb = (hex: string) => {
      // Remove the "#" character if present
      hex = hex.replace(/^#/, "");

      // Parse the hexadecimal values
      const bigint = parseInt(hex, 16);

      // Extract the RGB values
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;

      return { r, g, b };
    };

    const changeCanvasColor = (currColor: string) => {
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      if (!ctx || !canvas) {
        return;
      }

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixelData = imgData.data;
      const rgb = hexToRgb(currColor);
      for (let i = 0; i < canvas.height; i++) {
        for (let j = 0; j < canvas.width; j++) {
          const idx = (i * canvas.width + j) * 4;
          pixelData[idx] = rgb.r;
          pixelData[idx + 1] = rgb.g;
          pixelData[idx + 2] = rgb.b;
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };

    let startTime: number | null = null;
    const draw = (timeStamp: number) => {
      if (!startTime) {
        startTime = timeStamp;
      }

      const elapsed = timeStamp - startTime;
      console.log(elapsed, animationDuration);
      if (elapsed > animationDuration) {
        if (ctxRef.current && canvasRef.current) {
          ctxRef.current.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
        }
        return;
      }

      const colorIdx = Math.floor(
        (elapsed / animationDuration) * (colors.length - 1)
      );
      const currColor = colors[colorIdx];

      changeCanvasColor(currColor);

      requestAnimationFrame(draw);
    };

    requestAnimationFrame(draw);
  };

  const moveStartHandler = (X: number, Y: number) => {
    console.log("touch start");
    const _ctx = ctxRef.current;
    if (!_ctx) {
      return;
    }

    _ctx.beginPath();
    const x = X - cord.x,
      y = Y - cord.y;
    _ctx.moveTo(x, y);
    setMoving(true);
  };

  const moveHandler = (X: number, Y: number) => {
    console.log("keep touching");
    const _ctx = ctxRef.current;
    if (!_ctx || moving === false) {
      console.log("handler called b");
      return;
    }

    const x = X - cord.x,
      y = Y - cord.y;
    _ctx.lineTo(x, y);
    _ctx.stroke();
  };

  const moveEndHandler = () => {
    console.log("touching end");
    lazerAnimation();
    setMoving(false);
  };

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = dimension.w;
      canvasRef.current.height = dimension.h;
      // const temp = canvasRef.current.getContext("2d", [{ [ alpha: true ], [ desynchronized: false ] [, colorSpace: 'srgb'] [, willReadFrequently: false ]} ]);
      const temp = canvasRef.current.getContext("2d");

      if (!temp) {
        return;
      }

      const rect = canvasRef.current.getBoundingClientRect();
      const x = rect.left + window.scrollX;
      const y = rect.top + window.scrollY;

      ctxRef.current = temp;

      temp.lineWidth = 3;
      temp.strokeStyle = "#9f1239";
      // temp.strokeStyle = "#fff1f2";

      setCord({
        x,
        y,
      });

      const url = canvasRef.current.toDataURL();
    }
  }, [dimension]);

  return (
    <canvas
      ref={canvasRef}
      className="bg-opacity-0 "
      onMouseDown={(e) => moveStartHandler(e.clientX, e.clientY)}
      onMouseMove={(e) => moveHandler(e.clientX, e.clientY)}
      onMouseUp={(e) => moveEndHandler()}
      onMouseLeave={(e) => moveEndHandler()}
      onTouchStart={(e) => {
        moveStartHandler(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchMove={(e) => {
        moveHandler(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchEnd={(e) => {
        moveEndHandler();
      }}
      onTouchCancel={(e) => moveEndHandler()}
    ></canvas>
  );
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Project
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const Project: React.FC = () => {
  const [dim, setDim] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });

  const [zIndex, setZIndex] = useState<string>("z-0");
  const [border, setBorder] = useState<boolean>(false);
  const parRef = useRef<HTMLDivElement | null>(null);

  const { lazer, penColor } = useSelector((state: RootState) => state.tool);
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (parRef.current !== null) {
      console.log("i am here");
      const rect = parRef.current.getBoundingClientRect();
      const tempDim = {
        w: rect.width,
        h: rect.height,
      };

      console.log(tempDim);

      setDim(tempDim);
    }
  }, []);

  useEffect(() => {
    if (lazer) {
      setZIndex("z-40");
    } else {
      setZIndex("z-0");
    }
  }, [lazer]);

  useEffect(() => {
    if (!cursorRef.current) {
      console.log("here1");
      return;
    }

    console.log("here2");

    const cursor = cursorRef.current;
    const setCursorPos = (e: MouseEvent) => {
      cursor.style.top = `${e.pageY - 10}px`;
      cursor.style.left = `${e.pageX - 10}px`;
      cursor.style.transitionTimingFunction = "ease-out";
    };

    document.addEventListener("mousemove", setCursorPos);

    return () => {
      document.removeEventListener("mousemove", setCursorPos);
    };
  }, []);

  useEffect(() => {
    if (penColor === "#f8fafc") {
      setBorder(true);
    } else {
      setBorder(false);
    }
  }, [penColor]);

  return (
    <div className="bg-gray-300 h-screen flex flex-col justify-start border-2 border-black">
      <Toolbar />
      <div
        ref={cursorRef}
        style={{ backgroundColor: penColor }}
        className={`absolute h-5 w-5 rounded-full border-2 pointer-events-none z-30 ${
          border && "border-2 border-black "
        } invisible md:visible`}
      ></div>
      <div
        ref={parRef}
        id={"frameArea"}
        className="w-full h-full rounded-md relative bg-slate-50 cursor-none "
      >
        {/* <div className="h-full w-full z-0 absolute bg-orange-200">
          <div className="grid grid-cols-12 w-full h-full"></div>
        </div> */}
        <div className="h-full w-full absolute z-20">
          <Document parentRef={parRef} selected={true} dimension={dim} />
        </div>
        <div className={`h-full w-full absolute ${zIndex}`}>
          <LaserCanvas selected dimension={dim} />
        </div>
      </div>
    </div>
  );
};

export default Project;

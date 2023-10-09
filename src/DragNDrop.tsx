import React from "react";
import { useRef, useEffect, useState } from "react";

interface DndType {
  _ref: React.MutableRefObject<HTMLDivElement | null> | undefined;
  children: any;
}

const DragNDrop: React.FC<DndType> = ({ _ref, children }) => {
  //   const parentRef = useRef<HTMLDivElement | null>(null);
  const parentRef = _ref;
  const childRef = useRef<HTMLDivElement | null>(null);
  const movingRef = useRef<boolean>(false);
  const clientOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const clientTopLeftRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!parentRef || !parentRef.current) return;
    console.log("i am here in dnd", childRef.current, parentRef.current);
    if (!childRef.current) return;
    console.log("i am here in dnd 2");
    const parent = parentRef.current;
    const child = childRef.current;
    const onMouseDown = (e: MouseEvent) => {
      console.log("start", e);
      movingRef.current = true;
      clientOffsetRef.current.y = e.clientY - clientTopLeftRef.current.y;
      clientOffsetRef.current.x = e.clientX - clientTopLeftRef.current.x;
    };

    const onTouchStart = (e: TouchEvent) => {
      console.log("start");
      movingRef.current = true;
      clientOffsetRef.current.y =
        e.touches[0].clientY - clientTopLeftRef.current.y;
      clientOffsetRef.current.x =
        e.touches[0].clientX - clientTopLeftRef.current.x;
    };

    const onMovementEnd = () => {
      console.log("end");
      clientOffsetRef.current.x = 0;
      clientOffsetRef.current.y = 0;
      movingRef.current = false;
    };

    const onMove = (X: number, Y: number) => {
      if (!movingRef.current) return;
      console.log(X, Y);
      child.style.top = `${Y - clientOffsetRef.current.y}px`;
      child.style.left = `${X - clientOffsetRef.current.x}px`;
      clientTopLeftRef.current.y = Y - clientOffsetRef.current.y;
      clientTopLeftRef.current.x = X - clientOffsetRef.current.x;
      child.style.transitionTimingFunction = "linear";
    };

    const util = (e: MouseEvent) => {
      onMove(e.clientX, e.clientY);
    };

    const touchUtil = (e: TouchEvent) => {
      onMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    child.addEventListener("mousedown", onMouseDown);
    child.addEventListener("mouseup", onMovementEnd);
    parent.addEventListener("mousemove", util);
    parent.addEventListener("mouseleave", onMovementEnd);

    child.addEventListener("touchstart", onTouchStart);
    child.addEventListener("touchend", onMovementEnd);
    parent.addEventListener("touchmove", touchUtil);
    parent.addEventListener("touchcancel", onMovementEnd);

    return () => {
      child.removeEventListener("mousedown", onMouseDown);
      child.removeEventListener("mouseup", onMovementEnd);
      parent.removeEventListener("mousemove", util);
      parent.removeEventListener("mouseleave", onMovementEnd);

      child.removeEventListener("touchstart", onTouchStart);
      child.removeEventListener("touchend", onMovementEnd);
      parent.removeEventListener("touchmove", touchUtil);
      parent.removeEventListener("touchcancel", onMovementEnd);
    };
  }, []);

  return (
    <div ref={childRef} className="absolute top-0 left-0 ">
      {children}
    </div>
  );
};

export default DragNDrop;

import { useEffect, useRef } from "react";
import { writeSentence } from "../lib/shapes";

function Canvas(props: {
  className?: string;
  draw?: (ctx: CanvasRenderingContext2D, frameCount: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = (ctx: CanvasRenderingContext2D, frameCount: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.strokeStyle = "#00FF00";
    ctx.beginPath();
    ctx.arc(50, 50, 20 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = "#000FFF";
    ctx.beginPath();
    ctx.arc(100, 50, 20 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = "#FFF000";
    ctx.beginPath();
    ctx.arc(150, 50, 20 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI);
    ctx.stroke();

    writeSentence(
      ctx,
      "NO DRAW METHOD",
      ctx.canvas.width / 4,
      ctx.canvas.height / 2,
      46,
      2 * Math.sin(frameCount * 0.05),
      "#D2042D"
    );
    writeSentence(
      ctx,
      "Please try reloading the page",
      ctx.canvas.width / 2,
      ctx.canvas.height / 2 + 600,
      22,
      2 * Math.sin(frameCount * 0.05),
      "#D2042D"
    );
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let frameCount = 0;
    let animationFrameId: number;

    //scale it to the container
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    //scale!
    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = canvas.parentElement?.clientHeight || 600;

    //Our draw came here
    const render = () => {
      frameCount++;
      if (props.draw) props.draw(context, frameCount);
      else draw(context, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

  return <canvas ref={canvasRef} {...props} />;
}

export default Canvas;

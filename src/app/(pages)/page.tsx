"use client";

import { useEffect, useRef } from "react";

export default function TechnoCat() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const svgPathRef = useRef<SVGPathElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!videoRef.current || !svgPathRef.current) return;

    // Create canvas once and store in ref
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    function updateColor() {
      const video = videoRef.current;
      const svgPath = svgPathRef.current;
      const canvas = canvasRef.current;
      
      if (!video || !svgPath || !canvas || !context || video.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(updateColor);
        return;
      }

      // Only update canvas dimensions when video size changes
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = frame.data;

      // Calculate average color with performance optimization
      let r = 0, g = 0, b = 0;
      const totalPixels = data.length / 4;
      
      // Sample every 4th pixel for better performance
      for (let i = 0; i < data.length; i += 16) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }

      r = Math.floor(r * 4 / totalPixels);
      g = Math.floor(g * 4 / totalPixels);
      b = Math.floor(b * 4 / totalPixels);

      const reverseColor = `rgb(${255 - r}, ${255 - g}, ${255 - b})`;
      svgPath.style.fill = reverseColor;

      animationFrameRef.current = requestAnimationFrame(updateColor);
    }

    // Start animation when video plays
    const videoElement = videoRef.current;
    videoElement.addEventListener("play", updateColor);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      videoElement.removeEventListener("play", updateColor);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen">
      <video
        ref={videoRef}
        src="/images/tv-dance-loop.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  );
}
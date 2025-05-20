import React, { useEffect, useRef, useState } from 'react';

interface TarotCardFlipCanvasProps {
  width?: number;
  height?: number;
  frontImage: string; // 正面图
  backImage: string;  // 背面图
  onFlipEnd?: (isFront: boolean) => void;
}

const TarotCardFlipCanvas: React.FC<TarotCardFlipCanvasProps> = ({
  width = 300,
  height = 500,
  frontImage,
  backImage,
  onFlipEnd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isFront, setIsFront] = useState(false);
  const [progress, setProgress] = useState(0);
  const frontImgRef = useRef<HTMLImageElement | null>(null);
  const backImgRef = useRef<HTMLImageElement | null>(null);

  const CARD_WIDTH = 200;
  const CARD_HEIGHT = 400;
  const CARD_X = (width - CARD_WIDTH) / 2;
  const CARD_Y = (height - CARD_HEIGHT) / 2;

  const draw = (ctx: CanvasRenderingContext2D, progress: number) => {
    const scaleX = Math.cos(progress * Math.PI);
    const showingBack = scaleX > 0 ? !isFront : isFront;
    const img = showingBack ? backImgRef.current : frontImgRef.current;

    ctx.clearRect(0, 0, width, height);

    if (!img) return;

    ctx.save();
    ctx.translate(CARD_X + CARD_WIDTH / 2, CARD_Y + CARD_HEIGHT / 2);
    ctx.scale(scaleX, 1);
    ctx.drawImage(img, -CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT);
    ctx.restore();
  };

  const animate = () => {
    if (!isFlipping) return;

    setProgress(prev => {
      const next = prev + 0.05;
      if (next >= 1) {
        setIsFlipping(false);
        setProgress(0);
        setIsFront(prev => {
          const nextState = !prev;
          onFlipEnd?.(nextState);
          return nextState;
        });
        return 0;
      } else {
        requestAnimationFrame(animate);
        return next;
      }
    });
  };

  const handleClick = () => {
    if (!isFlipping) {
      setIsFlipping(true);
      setProgress(0);
      requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frontImg = new Image();
    const backImg = new Image();
    frontImg.src = frontImage;
    backImg.src = backImage;

    frontImg.onload = () => {
      frontImgRef.current = frontImg;
      backImgRef.current = backImg;
      draw(ctx, 0); // 初始渲染
    };
  }, [frontImage, backImage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isFlipping) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    draw(ctx, progress);
  }, [progress, isFlipping]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleClick}
      style={{ cursor: 'pointer', borderRadius: 8, boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}
    />
  );
};

export default TarotCardFlipCanvas;

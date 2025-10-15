// src/components/PortfolioValue.tsx
import React, { useEffect, useRef, useState } from "react";

type Props = {
  totalValue: number;
  lastUpdated: string | null;
};

const PortfolioValue: React.FC<Props> = ({ totalValue, lastUpdated }) => {
  const [displayValue, setDisplayValue] = useState(totalValue);
  const animationRef = useRef<number | null>(null);
  const previousValueRef = useRef(totalValue);

  useEffect(() => {
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startValue = previousValueRef.current;
    const endValue = totalValue;
    const duration = 500; // Animation duration in milliseconds
    const startTime = performance.now();

    // Easing function for smooth animation (ease-out)
    const easeOutQuart = (t: number): number => {
      return 1 - Math.pow(1 - t, 4);
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Apply easing function
      const easedProgress = easeOutQuart(progress);

      // Calculate current value
      const current = startValue + (endValue - startValue) * easedProgress;
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        previousValueRef.current = endValue;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [totalValue]);

  return (
    <>
      <div className="flex flex-col items-start gap-5">
        <span className="text-text-muted text-base font-medium">
          {totalValue > 0
            ? "Portfolio Total"
            : "No Holdings , Please add some tokens to your portfolio"}
        </span>

        <span className="text-text-default text-[40px] md:text-[56px] font-medium">
          {typeof displayValue === "number"
            ? `$${displayValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "$0.00"}
        </span>
      </div>
      <span className="pt-5 md:pt-[100px] text-text-muted text-xs">
        {totalValue > 0 ? `Last updated: ${lastUpdated ?? "—"}` : ""}
      </span>
    </>
  );
};

export default PortfolioValue;

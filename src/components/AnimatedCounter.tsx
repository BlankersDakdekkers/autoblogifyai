import React, { useState, useEffect, memo } from 'react';

interface AnimatedCounterProps {
  value: string;
  duration?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = memo(({ 
  value, 
  duration = 2000 
}) => {
  const [displayValue, setDisplayValue] = useState('0');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`counter-${value}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [value, isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    // Extract numeric value and suffix
    const numericMatch = value.match(/(\d+(?:\.\d+)?)/);
    const suffix = value.replace(/[\d.]/g, '');
    
    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }

    const targetValue = parseFloat(numericMatch[1]);
    const startValue = 0;
    const increment = targetValue / (duration / 16); // 60fps
    let currentValue = startValue;

    const timer = setInterval(() => {
      currentValue += increment;
      
      if (currentValue >= targetValue) {
        currentValue = targetValue;
        clearInterval(timer);
      }

      // Format the number based on the original value
      let formattedValue;
      if (targetValue >= 1000) {
        formattedValue = Math.floor(currentValue).toLocaleString();
      } else if (targetValue % 1 !== 0) {
        formattedValue = currentValue.toFixed(1);
      } else {
        formattedValue = Math.floor(currentValue).toString();
      }

      setDisplayValue(formattedValue + suffix);
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration, isVisible]);

  return (
    <span 
      id={`counter-${value}`}
      className="tabular-nums"
    >
      {displayValue}
    </span>
  );
});

AnimatedCounter.displayName = 'AnimatedCounter';

export default AnimatedCounter;
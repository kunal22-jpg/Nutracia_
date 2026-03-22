import { useEffect, useState, useRef } from 'react';

/**
 * A simple text decryption animation component.
 * Shuffles characters until they match the original text.
 */
export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = true,
  revealDirection = 'start',
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "view",
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
  const intervalRef = useRef(null);

  useEffect(() => {
    let iteration = 0;
    const originalText = text;
    
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(prev => 
        originalText.split("").map((char, index) => {
          if (index < iteration) {
            return originalText[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("")
      );

      if (iteration >= originalText.length) {
        clearInterval(intervalRef.current);
      }

      iteration += 1 / maxIterations;
    }, speed);

    return () => clearInterval(intervalRef.current);
  }, [text, speed, maxIterations]);

  return (
    <span className={parentClassName}>
      <span className={className}>{displayText}</span>
    </span>
  );
}

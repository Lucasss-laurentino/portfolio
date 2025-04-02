import { useState, useEffect } from "react";

export const AnimatedText = () => {
  const texts = ["Front-end", "Back-end"];
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentText = texts[index];

    if (isDeleting) {
      if (charIndex > 0) {
        setTimeout(() => setCharIndex(charIndex - 1), 100);
      } else {
        setIsDeleting(false);
        setIndex((prevIndex) => (prevIndex + 1) % texts.length);
      }
    } else {
      if (charIndex < currentText.length) {
        setTimeout(() => setCharIndex(charIndex + 1), 150);
      } else {
        setTimeout(() => setIsDeleting(true), 1000);
      }
    }

    setDisplayText(currentText.slice(0, charIndex));
  }, [charIndex, isDeleting, index, texts]);

  return (
    <span style={{ fontFamily: "Arial, sans-serif", whiteSpace: "nowrap" }}>
      {displayText}
      <span className="cursor">|</span>
    </span>
  );
}

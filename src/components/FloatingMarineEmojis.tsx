import React, { useEffect, useState } from 'react';

interface MarineEmoji {
  id: number;
  emoji: string;
  left: string;
  top: string;
  animationClass: string;
  delay: string;
  size: string;
}

const FloatingMarineEmojis: React.FC = () => {
  const [marineEmojis, setMarineEmojis] = useState<MarineEmoji[]>([]);

  // Emojis marinos disponibles
  const emojiList = ['🐟', '🐠', '🐡', '🦑', '🐙', '🦞', '🦀', '🐚', '⭐', '🌊', '🐢', '🦈', '🪼', '🦭', '🦆', '🐋', '🪸', '🧜‍♀️', '⚓', '🏖️', '🌺', '🐝', '🦋', '🌸'];
  
  // Clases de animación disponibles
  const animationClasses = [
    'animate-marine-float-1',
    'animate-marine-float-2', 
    'animate-marine-float-3',
    'animate-marine-float-4',
    'animate-marine-float-5'
  ];

  // Tamaños disponibles
  const sizes = ['text-2xl', 'text-3xl', 'text-4xl', 'text-xl'];

  useEffect(() => {
    // Generar emojis marinos con posiciones aleatorias
    const generateEmojis = (): MarineEmoji[] => {
      const emojis: MarineEmoji[] = [];
      
      // Generar entre 45-60 emojis para mucha más densidad (triple)
      const emojiCount = Math.floor(Math.random() * 16) + 45;
      
      for (let i = 0; i < emojiCount; i++) {
        // Generar posiciones que eviten el centro donde está la imagen
        let left: number, top: number;
        
        do {
          left = Math.random() * 100;
          top = Math.random() * 100;
          
          // Evitar el área central donde está la imagen de fondo (aproximadamente 30-70% horizontal y 20-80% vertical)
        } while (
          left > 25 && left < 75 && 
          top > 15 && top < 85
        );
        
        emojis.push({
          id: i,
          emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
          left: `${left}%`,
          top: `${top}%`,
          animationClass: animationClasses[Math.floor(Math.random() * animationClasses.length)],
          delay: `${Math.random() * 10}s`, // Delay aleatorio entre 0-10s
          size: sizes[Math.floor(Math.random() * sizes.length)]
        });
      }
      
      return emojis;
    };

    setMarineEmojis(generateEmojis());

    // Regenerar emojis cada 30 segundos para mantener la animación fresca
    const interval = setInterval(() => {
      setMarineEmojis(generateEmojis());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {marineEmojis.map((emoji) => (
        <div
          key={emoji.id}
          className={`absolute ${emoji.animationClass} ${emoji.size} select-none opacity-40`}
          style={{
            left: emoji.left,
            top: emoji.top,
            animationDelay: emoji.delay,
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
          }}
        >
          {emoji.emoji}
        </div>
      ))}
    </div>
  );
};

export default FloatingMarineEmojis;

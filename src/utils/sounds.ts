
// Sound effect for timer countdown
const createCountdownSound = () => {
  let audioContext: AudioContext | null = null;
  let oscillator: OscillatorNode | null = null;
  
  const init = () => {
    // Initialize audio context on user gesture
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };
  
  const play = (frequency: number = 440, duration: number = 0.1) => {
    if (!audioContext) init();
    
    // Create oscillator
    if (audioContext) {
      oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Configure oscillator
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Start sound
      oscillator.start();
      
      // Schedule stop
      oscillator.stop(audioContext.currentTime + duration);
      
      // Cleanup
      oscillator.onended = () => {
        oscillator = null;
      };
    }
  };
  
  return { init, play };
};

// Sound sequences
const playCountdownSequence = (() => {
  const sound = createCountdownSound();
  let isPlaying = false;
  
  return (secondsLeft: number) => {
    // Only play countdown sound for last 5 seconds
    if (secondsLeft <= 5 && secondsLeft > 0 && !isPlaying) {
      isPlaying = true;
      
      // Higher pitch for last second
      const frequency = secondsLeft === 1 ? 880 : 440;
      
      sound.play(frequency, 0.1);
      
      // Reset flag after short delay
      setTimeout(() => {
        isPlaying = false;
      }, 200);
    }
  };
})();

// Levelup sound
const playLevelUpSound = (() => {
  const sound = createCountdownSound();
  
  return () => {
    // Play ascending tones
    setTimeout(() => sound.play(440, 0.15), 0);
    setTimeout(() => sound.play(554, 0.15), 200);
    setTimeout(() => sound.play(659, 0.3), 400);
  };
})();

// Breaktime sound
const playBreakSound = (() => {
  const sound = createCountdownSound();
  
  return () => {
    // Play some pleasant notes
    setTimeout(() => sound.play(523, 0.2), 0);    // C
    setTimeout(() => sound.play(659, 0.2), 250);  // E
    setTimeout(() => sound.play(784, 0.2), 500);  // G
    setTimeout(() => sound.play(1047, 0.3), 750); // High C
  };
})();

export { playCountdownSequence, playLevelUpSound, playBreakSound };

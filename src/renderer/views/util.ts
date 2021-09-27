export const padStart = (num: number, len = 2, prefix = '0') => {
  return `${num}`.padStart(len, prefix);
};

export const formatTime: (time: number) => string = (time: number) => {
  const seconds = time % 60;
  let minutes = Math.floor(time / 60);
  if (minutes < 60) {
    return `${padStart(minutes)}:${padStart(seconds)}`;
  }
  const hours = Math.floor(minutes / 60);

  minutes %= 60;
  return `${padStart(hours)}:${padStart(minutes)}:${padStart(seconds)}`;
};

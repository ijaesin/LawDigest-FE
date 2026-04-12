export default function getTimeRemaining(time: string): string {
  const timeDiff = Date.now() - new Date(time).getTime();
  const minutes = Math.floor(timeDiff / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days >= 30) return time.split('T')[0];
  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  return `${minutes}분 전`;
}

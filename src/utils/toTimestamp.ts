export function toTimestamp(date: Date): { seconds: number; nanos: number } {
  const millis = date.getTime();
  return {
    seconds: Math.floor(millis / 1000),
    nanos: (millis % 1000) * 1_000_000,
  };
}

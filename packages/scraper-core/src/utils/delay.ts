/**
 * Returns a random integer delay between min and max milliseconds,
 * then waits for that duration before resolving.
 */
export async function randomDelay(min: number, max: number): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

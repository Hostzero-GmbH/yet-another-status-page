// Generate a short, URL-friendly ID
// Uses base36 (0-9, a-z) for compact representation
export function generateShortId(length: number = 8): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz'
  let result = ''
  const randomValues = new Uint8Array(length)
  
  // Use crypto for better randomness if available
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues)
  } else {
    // Fallback to Math.random
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * 256)
    }
  }
  
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length]
  }
  
  return result
}

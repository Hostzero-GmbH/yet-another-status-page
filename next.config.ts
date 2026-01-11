import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    reactCompiler: false,
  },
  // Turbopack configuration to avoid webpack/turbopack mismatch warning
  turbopack: {
    // Add any turbopack-specific configuration here if needed
  },
}

export default withPayload(nextConfig)

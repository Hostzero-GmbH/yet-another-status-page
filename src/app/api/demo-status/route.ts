import { NextResponse } from 'next/server'
import { 
  isDemoMode, 
  getTimeUntilReset, 
  getDemoResetInterval,
  getDemoUserEmail,
  getDemoUserPassword
} from '@/lib/demo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  if (!isDemoMode()) {
    return NextResponse.json({ isDemoMode: false })
  }

  return NextResponse.json({
    isDemoMode: true,
    timeUntilReset: getTimeUntilReset(),
    resetIntervalMinutes: getDemoResetInterval(),
    demoEmail: getDemoUserEmail(),
    demoPassword: getDemoUserPassword(),
  })
}

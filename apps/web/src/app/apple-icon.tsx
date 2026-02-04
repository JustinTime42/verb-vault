import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#D97757',
          borderRadius: 36,
          fontFamily: 'sans-serif',
        }}
      >
        <span
          style={{
            fontSize: 120,
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1,
          }}
        >
          V
        </span>
      </div>
    ),
    {
      ...size,
    }
  )
}

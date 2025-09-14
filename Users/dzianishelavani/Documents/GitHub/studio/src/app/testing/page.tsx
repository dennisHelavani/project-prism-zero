'use client';
import Beams from './Beams';

export default function TestingPage() {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#000' }}>
      <Beams
        beamWidth={2}
        beamHeight={15}
        beamNumber={12}
        lightColor="#ffffff"
        speed={2}
        noiseIntensity={1.75}
        scale={0.2}
        rotation={0}
      />
    </div>
  );
}

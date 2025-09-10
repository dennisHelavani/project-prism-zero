
'use client';

import { RawDataIcon } from './raw-data-icon';
import { CleanDataIcon } from './clean-data-icon';
import './data-flow-visual.css';

export function DataFlowVisual() {
  return (
    <div className="data-flow-container">
      {/* Left Block */}
      <div className="data-flow-block-wrapper">
        <div className="data-flow-block">
          <RawDataIcon />
        </div>
        <span className="data-flow-label">Raw Data</span>
      </div>

      {/* Connection Lines */}
      <div className="data-flow-connection-lines">
        <div className="data-flow-line"></div>
        <div className="data-flow-line"></div>
        <div className="data-flow-line"></div>
      </div>

      {/* Right Block */}
      <div className="data-flow-block-wrapper">
        <div className="data-flow-block">
          <CleanDataIcon />
        </div>
        <span className="data-flow-label">Clean Data</span>
      </div>
    </div>
  );
}

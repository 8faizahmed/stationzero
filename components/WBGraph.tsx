"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts";
import { EnvelopePoint } from "../data/aircraft";

interface WBGraphProps {
  envelope: EnvelopePoint[];
  takeoffWeight: number;
  takeoffCG: number;
  landingWeight?: number;
  landingCG?: number;
  isDark: boolean; // NEW PROP
}

const RenderTakeoffPoint = (props: any) => {
  const { cx, cy } = props;
  return (
    <circle cx={cx} cy={cy} r={6} fill="#dc2626" stroke="white" strokeWidth={2} cursor="pointer" />
  );
};

const RenderLandingPoint = (props: any) => {
  const { cx, cy } = props;
  return (
    <circle cx={cx} cy={cy} r={6} fill="#16a34a" stroke="white" strokeWidth={2} cursor="pointer" />
  );
};

export default function WBGraph({ envelope, takeoffWeight, takeoffCG, landingWeight, landingCG, isDark }: WBGraphProps) {
  const takeoffPoint = [{ cg: takeoffCG, weight: takeoffWeight }];
  const landingPoint = landingWeight ? [{ cg: landingCG, weight: landingWeight }] : [];

  const allWeights = [takeoffWeight, ...(landingWeight ? [landingWeight] : []), ...envelope.map(p => p.weight)];
  const allCGs = [takeoffCG, ...(landingCG ? [landingCG] : []), ...envelope.map(p => p.cg)];

  const minCG = Math.min(...allCGs) - 1.5;
  const maxCG = Math.max(...allCGs) + 1.5;
  const minWeight = Math.min(...allWeights) - 200;
  const maxWeight = Math.max(...allWeights) + 200;

  // Colors based on mode
  const axisColor = isDark ? "#9ca3af" : "#4b5563"; // gray-400 vs gray-600
  const gridColor = isDark ? "#374151" : "#e5e7eb"; // gray-700 vs gray-200
  const envColor  = isDark ? "#60a5fa" : "#2563eb"; // blue-400 vs blue-600

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            
            <XAxis 
              type="number" 
              dataKey="cg" 
              name="CG" 
              domain={[minCG, maxCG]} 
              unit=" in"
              tickCount={5}
              tickFormatter={(val) => val.toFixed(1)}
              stroke={axisColor}
              tick={{ fill: axisColor }}
            >
              <Label value="Center of Gravity (inches)" offset={-10} position="insideBottom" fill={axisColor} />
            </XAxis>

            <YAxis 
              type="number" 
              dataKey="weight" 
              name="Weight" 
              domain={[minWeight, maxWeight]} 
              unit=" lbs"
              stroke={axisColor}
              tick={{ fill: axisColor }}
            />
            
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }} 
              animationDuration={0}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className={`p-2 border shadow-lg rounded text-xs z-50 ${isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-800'}`}>
                      <p className={`font-bold mb-1 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{payload[0].name}</p>
                      <p className="opacity-80">Weight: <span className="font-mono">{data.weight.toFixed(1)}</span> lbs</p>
                      <p className="opacity-80">CG: <span className="font-mono">{data.cg.toFixed(2)}</span> in</p>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Envelope Polygon */}
            <Scatter 
              name="Envelope" 
              data={envelope} 
              fill="transparent" 
              line={{ stroke: envColor, strokeWidth: 2 }} 
              shape={() => <></>} 
              legendType="none"
              tooltipType="none" 
            />

            {/* Takeoff Point */}
            <Scatter 
              name="Takeoff" 
              data={takeoffPoint} 
              shape={<RenderTakeoffPoint />} 
              isAnimationActive={false}
            />

            {/* Landing Point & Connector */}
            {landingWeight && landingCG && (
              <>
                <ReferenceLine 
                  segment={[{ x: takeoffCG, y: takeoffWeight }, { x: landingCG, y: landingWeight }]} 
                  stroke={isDark ? "#6b7280" : "#9ca3af"} 
                  strokeDasharray="3 3" 
                />
                <Scatter 
                  name="Landing" 
                  data={landingPoint} 
                  shape={<RenderLandingPoint />}
                  isAnimationActive={false} 
                />
              </>
            )}

          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className={`flex justify-center gap-4 text-[10px] mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-600 border border-white shadow-sm"></div> Takeoff</div>
        {landingWeight && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-600 border border-white shadow-sm"></div> Landing</div>}
      </div>
    </div>
  );
}
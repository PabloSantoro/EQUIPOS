import React from 'react';

interface ChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  type?: 'bar' | 'donut' | 'line';
  className?: string;
  height?: number;
}

export const Chart: React.FC<ChartProps> = ({ 
  data, 
  type = 'bar', 
  className = '', 
  height = 200 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));

  if (type === 'bar') {
    return (
      <div className={`w-full ${className}`} style={{ height }}>
        <div className="flex items-end justify-between h-full space-x-2">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className={`chart-bar w-full rounded-t-lg ${
                  item.color || 'bg-blue-500'
                }`}
                style={{ 
                  height: `${(item.value / maxValue) * 80}%`,
                  minHeight: '4px'
                }}
                title={`${item.name}: ${item.value}`}
              ></div>
              <div className="text-xs text-gray-600 mt-2 text-center truncate">
                {item.name}
              </div>
              <div className="text-xs font-medium text-gray-900">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'donut') {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="relative" style={{ width: height, height }}>
          <svg width={height} height={height} className="transform -rotate-90">
            <circle
              cx={height / 2}
              cy={height / 2}
              r={height / 2 - 20}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="20"
            />
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${percentage * 2.827} 282.7`; // 2πr where r = 45
              const rotation = currentAngle;
              currentAngle += percentage * 3.6;
              
              return (
                <circle
                  key={index}
                  cx={height / 2}
                  cy={height / 2}
                  r={height / 2 - 20}
                  fill="none"
                  stroke={item.color || `hsl(${index * 60}, 70%, 50%)`}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeLinecap="round"
                  style={{ 
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: `${height / 2}px ${height / 2}px`
                  }}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>
        </div>
        <div className="ml-6 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)` }}
              ></div>
              <span className="text-sm text-gray-700">{item.name}</span>
              <span className="text-sm font-medium text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

// Gradient Card component for modern look
interface GradientCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  gradient: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const GradientCard: React.FC<GradientCardProps> = ({
  title,
  value,
  subtitle,
  gradient,
  icon,
  trend
}) => {
  return (
    <div className={`gradient-card p-6 text-white ${gradient} shadow-modern-lg`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {subtitle && (
              <p className="text-white/80 text-sm mt-1">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="opacity-80">
              {icon}
            </div>
          )}
        </div>
        
        {trend && (
          <div className={`flex items-center mt-3 text-sm ${
            trend.isPositive ? 'text-green-200' : 'text-red-200'
          }`}>
            <span className="mr-1">
              {trend.isPositive ? '↗' : '↘'}
            </span>
            <span>{Math.abs(trend.value)}%</span>
            <span className="text-white/70 ml-1">vs mes anterior</span>
          </div>
        )}
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className="w-full h-full rounded-full bg-white transform translate-x-16 -translate-y-16"></div>
      </div>
    </div>
  );
};
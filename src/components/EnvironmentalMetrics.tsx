
import React, { useEffect, useState } from 'react';
import { EnvironmentalMetrics as Metrics, getEnvironmentalRating, getEnvironmentalScore, getScoreColor } from '@/utils/environmental';
import { Progress } from '@/components/ui/progress';
import { Activity, ArrowDownIcon, ArrowUpIcon, Cloud, Droplet, Flame, Heart, Info, TreePine, Wind, BookOpen, Building2, LineChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchWeatherData, WeatherData } from '@/services/environmentalApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EnvironmentalMetricsProps {
  metrics: Metrics;
  isLoading?: boolean;
}

const EnvironmentalMetricsComponent: React.FC<EnvironmentalMetricsProps> = ({ metrics, isLoading = false }) => {
  const score = getEnvironmentalScore(metrics);
  const rating = getEnvironmentalRating(score);
  const scoreColorClass = getScoreColor(score);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeMetricsView, setActiveMetricsView] = useState<'environmental' | 'social' | 'economic'>('environmental');
  
  useEffect(() => {
    const getWeatherData = async () => {
      setLoading(true);
      try {
        const data = await fetchWeatherData();
        setWeatherData(data);
      } catch (error) {
        console.error("Failed to load weather data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getWeatherData();
    
    const interval = setInterval(getWeatherData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  const MetricItem = ({ 
    value, 
    label, 
    icon, 
    valuePrefix = '',
    good = false,
    bad = false,
    description = '',
    unit = ''
  }: { 
    value: number; 
    label: string; 
    icon: React.ReactNode;
    valuePrefix?: string;
    good?: boolean;
    bad?: boolean;
    description?: string;
    unit?: string;
  }) => {
    const displayedValue = Math.abs(value).toFixed(0);
    
    return (
      <div className="flex flex-col bg-white/40 rounded-lg p-2.5 border border-border/30">
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
              {icon}
            </div>
            <span className="text-sm font-medium">{label}</span>
            {description && (
              <div className="text-xs text-muted-foreground ml-1 cursor-help" title={description}>
                <Info size={12} />
              </div>
            )}
          </div>
          <div className="flex items-center">
            {value !== 0 && value < 0 && good && (
              <ArrowDownIcon size={14} className="text-green-500 mr-1" />
            )}
            {value !== 0 && value > 0 && good && (
              <ArrowUpIcon size={14} className="text-green-500 mr-1" />
            )}
            {value !== 0 && value < 0 && bad && (
              <ArrowDownIcon size={14} className="text-green-500 mr-1" />
            )}
            {value !== 0 && value > 0 && bad && (
              <ArrowUpIcon size={14} className="text-red-500 mr-1" />
            )}
            <span className={cn(
              "text-sm font-medium",
              good && value < 0 && "text-green-500",
              good && value > 0 && "text-green-500",
              bad && value < 0 && "text-green-500",
              bad && value > 0 && "text-red-500",
            )}>
              {valuePrefix}{displayedValue}{unit}
            </span>
          </div>
        </div>
        
        <Progress 
          value={Math.min(100, Math.abs(value) / 2)} 
          className={cn(
            "h-1.5 mt-1 mb-1 rounded-full",
            bad && value > 0 && "bg-red-200",
            (good && value > 0) || (bad && value < 0) && "bg-green-200"
          )}
        />
      </div>
    );
  };
  
  const EnvironmentalMetrics = () => (
    <div className="space-y-2.5">
      <MetricItem 
        value={metrics.emissions} 
        label="CO₂ Emissions" 
        valuePrefix=""
        icon={<Cloud size={15} />}
        bad={true}
        description="Metric tons of CO₂ equivalent per year"
      />
      <MetricItem 
        value={metrics.energy} 
        label="Energy Usage" 
        icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 3L13 10H17.8L11 21V14H6L13 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>}
        bad={true}
        description="Megawatt-hours per year"
      />
      <MetricItem 
        value={metrics.water} 
        label="Water Consumption" 
        icon={<Droplet size={15} />}
        bad={true}
        description="Thousands of gallons per year"
      />
      <MetricItem 
        value={metrics.heat} 
        label="Heat Effect" 
        icon={<Flame size={15} />}
        bad={true}
        description="Temperature increase in °C"
        unit="°C"
      />
      {metrics.traffic !== undefined && (
        <MetricItem 
          value={metrics.traffic || 0} 
          label="Traffic Congestion" 
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 17H19M5 12H19M5 7H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>}
          bad={true}
          description="Congestion score based on road density"
        />
      )}
    </div>
  );
  
  const SocialMetrics = () => (
    <div className="space-y-2.5">
      <MetricItem 
        value={metrics.happiness} 
        label="Community Wellbeing" 
        icon={<Heart size={15} />}
        good={true}
        description="Quality of life score (0-100)"
      />
      {metrics.education !== undefined && (
        <MetricItem 
          value={metrics.education} 
          label="Education Quality" 
          icon={<BookOpen size={15} />}
          good={true}
          description="Educational attainment and access (0-100)"
        />
      )}
      {metrics.healthcare !== undefined && (
        <MetricItem 
          value={metrics.healthcare} 
          label="Healthcare Access" 
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 13H12M16 13H12M12 13V9M12 13V17M12 3H16.2C17.8802 3 18.7202 3 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C21 5.27976 21 6.11985 21 7.8V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>}
          good={true}
          description="Healthcare quality and accessibility (0-100)"
        />
      )}
    </div>
  );
  
  const EconomicMetrics = () => (
    <div className="space-y-2.5">
      {metrics.economy !== undefined && (
        <MetricItem 
          value={metrics.economy} 
          label="Economic Strength" 
          icon={<Building2 size={15} />}
          good={true}
          description="Economic activity and resilience (0-100)"
        />
      )}
      <MetricItem 
        value={score} 
        label="Sustainability Index" 
        icon={<TreePine size={15} />}
        good={true}
        description="Overall sustainability score (0-100)"
      />
      <div className="bg-white/40 rounded-lg p-3 border border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <LineChart size={15} className="mr-2 text-blue-500" />
            <span className="text-sm font-medium">Growth Potential</span>
          </div>
          <div className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium",
            score > 70 ? "bg-green-100 text-green-800" :
            score > 50 ? "bg-yellow-100 text-yellow-800" :
            "bg-red-100 text-red-800"
          )}>
            {score > 70 ? "High" : score > 50 ? "Medium" : "Low"}
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {score > 70 
            ? "Your city design shows excellent long-term economic growth potential based on sustainability metrics."
            : score > 50 
            ? "Your city has moderate economic growth potential. Consider implementing more sustainable practices."
            : "Your city's growth potential is limited by sustainability challenges. Significant improvements recommended."
          }
        </div>
      </div>
    </div>
  );
  
  const DetailedBreakdown = () => (
    <Tabs defaultValue="impact">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="impact">Impact</TabsTrigger>
        <TabsTrigger value="weather">Weather</TabsTrigger>
      </TabsList>
      
      <TabsContent value="impact" className="space-y-2 pt-2">
        <div className="text-xs text-muted-foreground mb-2">
          Detailed environmental breakdown by building category:
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between p-2 bg-background/50 rounded border border-border/30">
            <span>Residential</span>
            <span className="font-semibold">{(metrics.emissions * 0.3).toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-background/50 rounded border border-border/30">
            <span>Commercial</span>
            <span className="font-semibold">{(metrics.emissions * 0.4).toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-background/50 rounded border border-border/30">
            <span>Industrial</span>
            <span className="font-semibold">{(metrics.emissions * 0.25).toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-background/50 rounded border border-border/30">
            <span>Transportation</span>
            <span className="font-semibold">{(metrics.emissions * 0.15).toFixed(1)}</span>
          </div>
        </div>
        
        <div className="text-xs p-2.5 bg-blue-500/10 rounded border border-blue-500/30 mt-3">
          <div className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Pro Tip</div>
          Placing parks next to high-emission buildings can reduce their environmental impact by up to 40%.
        </div>
      </TabsContent>
      
      <TabsContent value="weather" className="pt-2">
        {weatherData ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img src={weatherData.icon} alt="Weather" className="w-10 h-10" />
                <div className="ml-2">
                  <div className="text-sm font-medium">{weatherData.temperature}°C</div>
                  <div className="text-xs text-muted-foreground capitalize">{weatherData.description}</div>
                </div>
              </div>
              <div className="flex flex-col items-end text-xs">
                <div className="flex items-center">
                  <Droplet size={12} className="mr-1 text-blue-500" />
                  <span>{weatherData.humidity}%</span>
                </div>
                <div className="flex items-center mt-1">
                  <Wind size={12} className="mr-1 text-blue-500" />
                  <span>{weatherData.windSpeed} m/s</span>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p className="mb-1">Weather affects environmental impact:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>High temperatures increase cooling energy use</li>
                <li>Wind can improve natural ventilation</li>
                <li>Parks provide greater cooling during hot days</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-4">
            <div className="text-sm text-muted-foreground">
              {loading ? "Loading weather data..." : "Weather data unavailable"}
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
  
  return (
    <div className="h-full flex flex-col glass-panel rounded-lg overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-border/40 bg-gradient-to-b from-white/80 to-transparent">
        <h2 className="text-lg font-medium mb-2 flex items-center">
          <Activity size={18} className="mr-2" />
          City Analytics
        </h2>
        <Card className="border-primary/10 bg-white/70 overflow-hidden">
          <CardContent className="p-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sustainability Score</span>
              <span className={cn("font-semibold", scoreColorClass)}>
                {isLoading ? "Calculating..." : `${score}%`}
              </span>
            </div>
            <Progress 
              value={isLoading ? 15 : score} 
              className={cn(
                "h-2.5 rounded-full", 
                isLoading ? "animate-pulse" : score > 70 ? "bg-green-500" : score > 50 ? "bg-yellow-500" : "bg-red-500"
              )} 
            />
            <div className="mt-2 text-center">
              <span className={cn("font-medium text-lg", scoreColorClass)}>
                {isLoading ? "..." : rating}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex mt-3 border rounded-lg overflow-hidden">
          <button 
            onClick={() => setActiveMetricsView('environmental')}
            className={`flex-1 py-2 text-xs font-medium ${activeMetricsView === 'environmental' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-white/60 hover:bg-white/80 text-muted-foreground'}`}
          >
            Environmental
          </button>
          <button 
            onClick={() => setActiveMetricsView('social')}
            className={`flex-1 py-2 text-xs font-medium ${activeMetricsView === 'social' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-white/60 hover:bg-white/80 text-muted-foreground'}`}
          >
            Social
          </button>
          <button 
            onClick={() => setActiveMetricsView('economic')}
            className={`flex-1 py-2 text-xs font-medium ${activeMetricsView === 'economic' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-white/60 hover:bg-white/80 text-muted-foreground'}`}
          >
            Economic
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-muted-foreground animate-pulse">Calculating impact...</div>
          </div>
        ) : (
          <>
            {activeMetricsView === 'environmental' && <EnvironmentalMetrics />}
            {activeMetricsView === 'social' && <SocialMetrics />}
            {activeMetricsView === 'economic' && <EconomicMetrics />}
            
            <div className="mt-4 pt-4 border-t border-border/40">
              <DetailedBreakdown />
            </div>
          </>
        )}
      </div>
      
      <div className="p-3 border-t border-border/40 bg-gradient-to-b from-muted/20 to-muted/40">
        <div className="text-xs text-muted-foreground flex items-center">
          <TreePine size={14} className="mr-1.5 text-green-500" />
          Add more green spaces to improve your city's environmental rating.
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalMetricsComponent;

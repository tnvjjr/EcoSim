import React, { useState, useRef } from 'react';
import { BUILDING_CATEGORIES, BUILDINGS, Building, getCategoryBuildings, getCompatibilityTips } from '@/utils/buildings';
import BuildingItem from './BuildingItem';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoIcon, LayersIcon, SearchIcon, CheckCircleIcon, AlertCircleIcon, LeafIcon, BrainIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getImprovementTips, EnvironmentalMetrics, getFuturePredictions } from '@/utils/environmental';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface BuildingPaletteProps {
  onBuildingDragStart: (building: Building) => void;
  environmentalMetrics?: EnvironmentalMetrics;
}

const BuildingPalette: React.FC<BuildingPaletteProps> = ({ onBuildingDragStart, environmentalMetrics }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Building['category'] | 'all'>('all');
  const [hoveredBuilding, setHoveredBuilding] = useState<Building | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  const [activeTab, setActiveTab] = useState<'buildings' | 'recommendations' | 'predictions'>('buildings');

  const filteredBuildings = getCategoryBuildings(activeCategory).filter(building => 
    building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    building.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get improvement tips if environmental metrics are available
  const improvementTips = environmentalMetrics ? getImprovementTips(environmentalMetrics) : [];
  
  // Get future predictions if environmental metrics are available
  const futurePredictions = environmentalMetrics ? getFuturePredictions(environmentalMetrics) : [];

  const handleMouseEnter = (building: Building) => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredBuilding(building);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
    }
    
    // Add a small delay before hiding the hoveredBuilding details
    // This prevents flashing when moving between close elements
    hoverTimeoutRef.current = window.setTimeout(() => {
      setHoveredBuilding(null);
      hoverTimeoutRef.current = null;
    }, 100);
  };

  return (
    <div className="h-full flex flex-col glass-panel rounded-lg overflow-hidden shadow-elegant animate-fade-in text-black">
      <div className="p-4 border-b border-border/40 bg-gradient-to-b from-white to-muted/30">
        <h2 className="text-lg font-medium mb-2 flex items-center text-black">
          <LayersIcon size={18} className="mr-2 text-primary" />
          Building Palette
        </h2>
        <div className="relative mb-2">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search buildings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm border-primary/20 bg-white/80"
          />
        </div>
        
        <div className="flex space-x-2 mb-2">
          <button 
            onClick={() => setActiveTab('buildings')}
            className={`px-3 py-1.5 text-xs rounded-md flex items-center ${activeTab === 'buildings' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-white/60 hover:bg-white/80 text-muted-foreground'}`}
          >
            <LayersIcon size={14} className="mr-1.5" />
            Buildings
          </button>
          <button 
            onClick={() => setActiveTab('recommendations')}
            className={`px-3 py-1.5 text-xs rounded-md flex items-center ${activeTab === 'recommendations' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-white/60 hover:bg-white/80 text-muted-foreground'}`}
          >
            <LeafIcon size={14} className="mr-1.5" />
            Eco Tips
          </button>
          <button 
            onClick={() => setActiveTab('predictions')}
            className={`px-3 py-1.5 text-xs rounded-md flex items-center ${activeTab === 'predictions' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-white/60 hover:bg-white/80 text-muted-foreground'}`}
          >
            <BrainIcon size={14} className="mr-1.5" />
            Predictions
          </button>
        </div>
        
        {activeTab === 'buildings' && (
          <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setActiveCategory(value as any)}>
            <TabsList className="w-full h-auto flex flex-wrap p-1 bg-white/50">
              {BUILDING_CATEGORIES.map(category => (
                <TabsTrigger 
                  key={category.value} 
                  value={category.value}
                  className="flex-1 h-8 text-xs py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'buildings' && (
          <>
            {/* Building Information Panel */}
            {hoveredBuilding && (
              <Card className="bg-white/80 border-primary/20 shadow-sm overflow-hidden">
                <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-transparent">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <InfoIcon size={14} className="text-primary" />
                    {hoveredBuilding.name}
                  </CardTitle>
                  <CardDescription className="text-xs">{hoveredBuilding.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="flex gap-2 flex-wrap mb-2">
                    <Badge variant="outline" className="text-[10px] py-0 border-primary/30 bg-white/70">
                      {hoveredBuilding.size.width}x{hoveredBuilding.size.depth}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] py-0 border-primary/30 bg-white/70">
                      {hoveredBuilding.category}
                    </Badge>
                  </div>
                  <Separator className="my-2 bg-muted/50" />
                  <div className="space-y-1.5">
                    {getCompatibilityTips(hoveredBuilding.id).map((tip, index) => (
                      <div key={index} className="text-xs flex items-start">
                        <span className="text-primary mr-1.5 flex-shrink-0">•</span>
                        <span className="text-muted-foreground">{tip}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {filteredBuildings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-white/50 rounded-lg">
                No buildings match your search.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredBuildings.map(building => (
                  <TooltipProvider key={building.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          onMouseEnter={() => handleMouseEnter(building)}
                          onMouseLeave={handleMouseLeave}
                          className="hover-scale focus-ring"
                        >
                          <BuildingItem 
                            building={building} 
                            onDragStart={onBuildingDragStart}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[200px] bg-white/90 border-primary/20">
                        <div className="text-xs">
                          <p className="font-medium">{building.name}</p>
                          <p className="text-muted-foreground mt-1">{building.description}</p>
                          <div className="mt-1 flex gap-1 flex-wrap">
                            <Badge variant="outline" className="text-[10px] py-0">
                              {building.size.width}x{building.size.depth}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] py-0">
                              {building.category}
                            </Badge>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <Card className="bg-white/90 border-green-200 shadow-sm overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-transparent">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <LeafIcon size={14} className="text-green-500" />
                  Eco-Friendly City Building Tips
                </CardTitle>
                <CardDescription className="text-xs">
                  Data-driven recommendations based on environmental best practices
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-3 pb-1">
                {improvementTips.length > 0 ? (
                  <ul className="space-y-3">
                    {improvementTips.map((tip, index) => (
                      <li key={index} className="flex items-start bg-white/60 p-2 rounded-md border border-green-100">
                        <span className="mr-1.5 mt-0.5 text-green-500 flex-shrink-0">
                          {index % 2 === 0 ? <AlertCircleIcon size={14} /> : <CheckCircleIcon size={14} />}
                        </span>
                        <span className="text-sm text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    Start building your city to see eco-friendly recommendations.
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 border-blue-200 shadow-sm overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-transparent">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <InfoIcon size={14} className="text-blue-500" />
                  Eco-City Design Principles
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <ul className="space-y-2">
                  <li className="flex items-start text-sm">
                    <span className="text-blue-500 mr-1.5 flex-shrink-0">•</span>
                    <span>
                      <strong className="text-slate-700">Mixed-Use Development:</strong>
                      <span className="text-muted-foreground ml-1">Combine residential, commercial, and recreational areas to reduce transportation needs.</span>
                    </span>
                  </li>
                  <li className="flex items-start text-sm">
                    <span className="text-blue-500 mr-1.5 flex-shrink-0">•</span>
                    <span>
                      <strong className="text-slate-700">Green Buffer Zones:</strong>
                      <span className="text-muted-foreground ml-1">Place parks between industrial and residential areas to mitigate pollution.</span>
                    </span>
                  </li>
                  <li className="flex items-start text-sm">
                    <span className="text-blue-500 mr-1.5 flex-shrink-0">•</span>
                    <span>
                      <strong className="text-slate-700">Renewable Energy:</strong>
                      <span className="text-muted-foreground ml-1">Integrate solar and wind farms strategically throughout your city.</span>
                    </span>
                  </li>
                  <li className="flex items-start text-sm">
                    <span className="text-blue-500 mr-1.5 flex-shrink-0">•</span>
                    <span>
                      <strong className="text-slate-700">Walkability:</strong>
                      <span className="text-muted-foreground ml-1">Design compact neighborhoods with essential services within walking distance.</span>
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === 'predictions' && (
          <div className="space-y-4">
            <Card className="bg-white/90 border-purple-200 shadow-sm overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-transparent">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <BrainIcon size={14} className="text-purple-500" />
                  Future City Predictions
                </CardTitle>
                <CardDescription className="text-xs">
                  Data-driven forecasts based on your current city design
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-3 pb-1">
                {futurePredictions.length > 0 ? (
                  <ul className="space-y-3">
                    {futurePredictions.map((prediction, index) => (
                      <li key={index} className="bg-white/60 p-2.5 rounded-md border border-purple-100">
                        <div className="flex items-center mb-1">
                          <div className={`h-2 w-2 rounded-full mr-1.5 ${
                            prediction.impact === 'positive' ? 'bg-green-500' : 
                            prediction.impact === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}></div>
                          <span className="font-medium text-sm">{prediction.timeframe}</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-3.5">{prediction.description}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    Build your city to see future predictions.
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 border-indigo-200 shadow-sm overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50 to-transparent">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <InfoIcon size={14} className="text-indigo-500" />
                  Long-Term Sustainability
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="text-sm text-muted-foreground mb-3">
                  Your current city design is projected to have the following long-term impacts:
                </p>
                
                {environmentalMetrics ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Carbon Footprint</span>
                      <span className={`text-sm font-medium ${
                        environmentalMetrics.emissions < 30 ? 'text-green-500' : 
                        environmentalMetrics.emissions < 70 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {environmentalMetrics.emissions < 30 ? 'Sustainable' : 
                         environmentalMetrics.emissions < 70 ? 'Moderate Impact' : 'High Impact'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Climate Resilience</span>
                      <span className={`text-sm font-medium ${
                        environmentalMetrics.heat < 30 ? 'text-green-500' : 
                        environmentalMetrics.heat < 70 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {environmentalMetrics.heat < 30 ? 'Resilient' : 
                         environmentalMetrics.heat < 70 ? 'Moderate Risk' : 'Vulnerable'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Resource Efficiency</span>
                      <span className={`text-sm font-medium ${
                        (environmentalMetrics.water + environmentalMetrics.energy) / 2 < 30 ? 'text-green-500' : 
                        (environmentalMetrics.water + environmentalMetrics.energy) / 2 < 70 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {(environmentalMetrics.water + environmentalMetrics.energy) / 2 < 30 ? 'Highly Efficient' : 
                         (environmentalMetrics.water + environmentalMetrics.energy) / 2 < 70 ? 'Moderate' : 'Inefficient'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 text-muted-foreground">
                    No metrics available yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-border/40 bg-gradient-to-b from-muted/20 to-muted/40">
        <div className="text-xs text-muted-foreground">
          {activeTab === 'buildings' && "Drag buildings onto the grid to place them in your city. Press 'R' to rotate buildings."}
          {activeTab === 'recommendations' && "These recommendations are based on environmental best practices and your current city design."}
          {activeTab === 'predictions' && "Predictions are based on data analysis of your current city's environmental metrics."}
        </div>
      </div>
    </div>
  );
};

export default BuildingPalette;

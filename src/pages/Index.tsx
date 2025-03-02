
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import CityGrid from '@/components/CityGrid';
import BuildingPalette from '@/components/BuildingPalette';
import EnvironmentalMetrics from '@/components/EnvironmentalMetrics';
import { Building } from '@/utils/buildings';
import { EnvironmentalMetrics as Metrics, GridItem, calculateEnvironmentalImpact } from '@/utils/environmental';
import { useToast } from '@/components/ui/use-toast';
import { BUILDINGS } from '@/utils/buildings';

const createEmptyGrid = (): GridItem[][] => {
  const grid: GridItem[][] = [];
  for (let x = 0; x < 20; x++) {
    grid[x] = [];
    for (let y = 0; y < 20; y++) {
      grid[x][y] = { x, y, building: null };
    }
  }
  return grid;
};

const Index = () => {
  const [grid, setGrid] = useState<GridItem[][]>(createEmptyGrid());
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({
    emissions: 0,
    energy: 0,
    water: 0,
    heat: 0,
    happiness: 0,
    traffic: 0,
  });
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.BUILDINGS = BUILDINGS;
    
    // Display welcome message
    toast({
      title: "Welcome to EcoCity Planner",
      description: "Drag buildings from the palette to start building your sustainable city.",
    });
  }, []);

  useEffect(() => {
    const updateMetrics = async () => {
      setIsLoading(true);
      try {
        const newMetrics = await calculateEnvironmentalImpact(grid);
        setMetrics(newMetrics);
      } catch (error) {
        console.error("Error calculating environmental impact:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    updateMetrics();
  }, [grid]);

  const handleBuildingDragStart = (building: Building) => {
    setSelectedBuilding(building);
  };

  const handleCellUpdate = async () => {
    setIsLoading(true);
    try {
      const newMetrics = await calculateEnvironmentalImpact(grid);
      setMetrics(newMetrics);
    } catch (error) {
      console.error("Error updating metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setGrid(createEmptyGrid());
    setMetrics({
      emissions: 0,
      energy: 0,
      water: 0,
      heat: 0,
      happiness: 0,
      traffic: 0,
    });
    setSelectedBuilding(null);
    toast({
      title: "City Reset",
      description: "Your city has been cleared. Start building again!",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Header onReset={handleReset} />
      
      <main className="flex-1 p-4 md:p-6 flex flex-col">
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
          <div className="w-full lg:w-72 flex flex-col">
            <BuildingPalette onBuildingDragStart={handleBuildingDragStart} />
          </div>
          
          <div className="flex-1 glass-panel rounded-lg overflow-hidden">
            <CityGrid 
              grid={grid} 
              setGrid={setGrid}
              selectedBuilding={selectedBuilding}
              onCellUpdate={handleCellUpdate}
            />
          </div>
          
          <div className="w-full lg:w-72 flex flex-col">
            <EnvironmentalMetrics metrics={metrics} isLoading={isLoading} />
          </div>
        </div>
      </main>
      
      <footer className="py-4 px-6 text-center text-sm text-muted-foreground">
        Built By Aiden Lim, Allan Wang, Evan Zhou, and Vijay Shrivarshan Vijayaraja.
      </footer>
    </div>
  );
};

export default Index;

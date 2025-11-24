import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw } from "lucide-react";

interface NetworkConfig {
  inputNodes: number;
  hiddenLayers: number[];
  outputNodes: number;
}

interface Connection {
  from: { layer: number; node: number };
  to: { layer: number; node: number };
  weight: number;
  active: boolean;
}

const NeuralNetworkVisualizer = () => {
  const [inputNodes, setInputNodes] = useState(3);
  const [hiddenLayers, setHiddenLayers] = useState([4, 3]);
  const [outputNodes, setOutputNodes] = useState(2);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(50);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeConnections, setActiveConnections] = useState<Set<string>>(new Set());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Generate network connections
  useEffect(() => {
    const newConnections: Connection[] = [];
    const layers = [inputNodes, ...hiddenLayers, outputNodes];
    
    for (let l = 0; l < layers.length - 1; l++) {
      for (let i = 0; i < layers[l]; i++) {
        for (let j = 0; j < layers[l + 1]; j++) {
          newConnections.push({
            from: { layer: l, node: i },
            to: { layer: l + 1, node: j },
            weight: Math.random() * 2 - 1,
            active: false
          });
        }
      }
    }
    
    setConnections(newConnections);
  }, [inputNodes, hiddenLayers, outputNodes]);

  // Draw the neural network
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    const layers = [inputNodes, ...hiddenLayers, outputNodes];
    const layerPositions: { x: number; y: number }[][] = [];
    
    // Calculate node positions
    const layerSpacing = width / (layers.length + 1);
    
    layers.forEach((nodeCount, layerIndex) => {
      const positions: { x: number; y: number }[] = [];
      const nodeSpacing = height / (nodeCount + 1);
      
      for (let i = 0; i < nodeCount; i++) {
        positions.push({
          x: layerSpacing * (layerIndex + 1),
          y: nodeSpacing * (i + 1)
        });
      }
      
      layerPositions.push(positions);
    });

    // Draw connections
    connections.forEach(conn => {
      const fromPos = layerPositions[conn.from.layer][conn.from.node];
      const toPos = layerPositions[conn.to.layer][conn.to.node];
      
      ctx.beginPath();
      ctx.moveTo(fromPos.x, fromPos.y);
      ctx.lineTo(toPos.x, toPos.y);
      
      const connectionKey = `${conn.from.layer}-${conn.from.node}-${conn.to.layer}-${conn.to.node}`;
      const isActive = activeConnections.has(connectionKey);
      
      if (isActive) {
        ctx.strokeStyle = conn.weight > 0 ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;
      } else {
        ctx.strokeStyle = conn.weight > 0 ? '#3b82f6' : '#f97316';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.2;
      }
      
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Draw nodes
    layerPositions.forEach((layer, layerIndex) => {
      layer.forEach((pos, nodeIndex) => {
        // Node circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 15, 0, 2 * Math.PI);
        
        // Color based on layer
        if (layerIndex === 0) {
          ctx.fillStyle = '#3b82f6'; // Input - blue
        } else if (layerIndex === layers.length - 1) {
          ctx.fillStyle = '#22c55e'; // Output - green
        } else {
          ctx.fillStyle = '#8b5cf6'; // Hidden - purple
        }
        
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });

    // Draw layer labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    
    layerPositions.forEach((layer, layerIndex) => {
      let label = '';
      if (layerIndex === 0) label = 'Input';
      else if (layerIndex === layers.length - 1) label = 'Output';
      else label = `Hidden ${layerIndex}`;
      
      ctx.fillText(label, layerSpacing * (layerIndex + 1), 20);
    });

  }, [connections, activeConnections, inputNodes, hiddenLayers, outputNodes]);

  // Animation loop
  useEffect(() => {
    if (!isAnimating) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    let step = 0;
    const layers = [inputNodes, ...hiddenLayers, outputNodes];
    
    const animate = () => {
      const currentLayer = Math.floor(step / 10) % (layers.length - 1);
      const progress = (step % 10) / 10;
      
      // Activate connections for current layer
      const active = new Set<string>();
      
      for (let i = 0; i < layers[currentLayer]; i++) {
        for (let j = 0; j < layers[currentLayer + 1]; j++) {
          if (Math.random() < progress) {
            active.add(`${currentLayer}-${i}-${currentLayer + 1}-${j}`);
          }
        }
      }
      
      setActiveConnections(active);
      step++;
      
      animationRef.current = setTimeout(() => {
        requestAnimationFrame(animate);
      }, 100 - animationSpeed);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isAnimating, animationSpeed, inputNodes, hiddenLayers, outputNodes]);

  const handleAddLayer = () => {
    setHiddenLayers([...hiddenLayers, 3]);
  };

  const handleRemoveLayer = () => {
    if (hiddenLayers.length > 0) {
      setHiddenLayers(hiddenLayers.slice(0, -1));
    }
  };

  const handleLayerNodesChange = (layerIndex: number, value: number) => {
    const newLayers = [...hiddenLayers];
    newLayers[layerIndex] = Math.max(1, Math.min(10, value));
    setHiddenLayers(newLayers);
  };

  const handleReset = () => {
    setIsAnimating(false);
    setActiveConnections(new Set());
    setInputNodes(3);
    setHiddenLayers([4, 3]);
    setOutputNodes(2);
    setAnimationSpeed(50);
  };

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Canvas */}
      <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-3 md:p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-auto bg-background/50 rounded-lg"
        />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        {/* Network Configuration */}
        <div className="space-y-3 md:space-y-4 bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 md:p-5">
          <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3">Network Architecture</h3>
          
          <div className="space-y-2">
            <Label htmlFor="input-nodes">Input Nodes: {inputNodes}</Label>
            <Slider
              id="input-nodes"
              min={1}
              max={10}
              step={1}
              value={[inputNodes]}
              onValueChange={([value]) => setInputNodes(value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="output-nodes">Output Nodes: {outputNodes}</Label>
            <Slider
              id="output-nodes"
              min={1}
              max={10}
              step={1}
              value={[outputNodes]}
              onValueChange={([value]) => setOutputNodes(value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Hidden Layers: {hiddenLayers.length}</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRemoveLayer}
                  disabled={hiddenLayers.length === 0}
                >
                  -
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddLayer}
                  disabled={hiddenLayers.length >= 5}
                >
                  +
                </Button>
              </div>
            </div>
            
            {hiddenLayers.map((nodes, index) => (
              <div key={index} className="space-y-1">
                <Label className="text-xs">Layer {index + 1} Nodes: {nodes}</Label>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[nodes]}
                  onValueChange={([value]) => handleLayerNodesChange(index, value)}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Animation Controls */}
        <div className="space-y-3 md:space-y-4 bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 md:p-5">
          <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3">Learning Simulation</h3>
          
          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="animation-speed" className="text-xs md:text-sm">Animation Speed: {animationSpeed}%</Label>
            <Slider
              id="animation-speed"
              min={10}
              max={90}
              step={10}
              value={[animationSpeed]}
              onValueChange={([value]) => setAnimationSpeed(value)}
              className="w-full"
            />
          </div>

          <div className="flex gap-2 pt-3 md:pt-4">
            <Button
              onClick={() => setIsAnimating(!isAnimating)}
              className="flex-1 bg-gradient-primary hover:opacity-90 text-white text-xs md:text-sm h-9 md:h-10"
            >
              {isAnimating ? (
                <>
                  <Pause className="w-3 md:w-4 h-3 md:h-4 mr-1.5 md:mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-3 md:w-4 h-3 md:h-4 mr-1.5 md:mr-2" />
                  Start
                </>
              )}
            </Button>
            
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 text-xs md:text-sm h-9 md:h-10"
            >
              <RotateCcw className="w-3 md:w-4 h-3 md:h-4 mr-1.5 md:mr-2" />
              Reset
            </Button>
          </div>

          <div className="mt-4 md:mt-6 p-2.5 md:p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <h4 className="text-xs md:text-sm font-semibold mb-1.5 md:mb-2">Legend</h4>
            <div className="space-y-1 text-[10px] md:text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                <span>Input Layer</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#8b5cf6]"></div>
                <span>Hidden Layers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
                <span>Output Layer</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-[#22c55e]"></div>
                <span>Positive Weight</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-[#ef4444]"></div>
                <span>Negative Weight</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-3 md:p-4">
        <h3 className="text-base md:text-lg font-semibold mb-1.5 md:mb-2">About Neural Network Visualization</h3>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          This interactive visualization demonstrates how neural networks are structured. 
          Configure the network architecture by adjusting input/output nodes and adding/removing hidden layers. 
          The learning simulation shows how information flows through the network during training, 
          with connections lighting up to represent active pathways. Green connections indicate positive weights, 
          while red connections show negative weights.
        </p>
      </div>
    </div>
  );
};

export default NeuralNetworkVisualizer;

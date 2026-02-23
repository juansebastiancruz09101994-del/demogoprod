import { useState, useEffect, useCallback, useRef } from "react";
import { Layers, X, Move, Maximize, ZoomIn, ZoomOut, Trash2, Download, MessageSquare, GraduationCap } from "lucide-react";
import { FeedbackModal } from "./FeedbackModal";
import { exportStrategyPDF } from "./ExportPDF";
import { Node } from "./Node";
import { ConnectionLine } from "./ConnectionLine";
import { ReportPanel } from "./ReportPanel";
import { MODULES } from "./modules";
import { NodeData, Edge, ReportData } from "./types";
import { DemoProvider, useDemo, ScenarioCards, DemoOverlay, DEMO_SCENARIOS } from "./DemoMode";

const DEFAULT_NODES: NodeData[] = [
  { id: "root", type: "production_target", x: 0, y: 0, data: { target: 280000 } },
];

const SimulationMapInner = () => {
  const [nodes, setNodes] = useState<NodeData[]>(() => {
    try {
      const saved = localStorage.getItem('goprod_nodes');
      return saved ? JSON.parse(saved) : DEFAULT_NODES;
    } catch { return DEFAULT_NODES; }
  });
  const [edges, setEdges] = useState<Edge[]>(() => {
    try {
      const saved = localStorage.getItem('goprod_edges');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(() => {
    return !localStorage.getItem('goprod_welcomed');
  });

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [reportData, setReportData] = useState<ReportData | null>(() => {
    try {
      const saved = localStorage.getItem('goprod_report');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [isPanningCanvas, setIsPanningCanvas] = useState(false);
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const demo = useDemo();
  const prevScenarioRef = useRef(demo.currentScenario);

  // Demo: swap canvas when scenario changes
  useEffect(() => {
    const prev = prevScenarioRef.current;
    const curr = demo.currentScenario;
    prevScenarioRef.current = curr;

    if (!demo.isDemoActive || curr < 1 || curr > 3) return;
    if (prev === curr) return;

    // Save previous scenario canvas (if it was a valid scenario)
    if (prev >= 1 && prev <= 3) {
      demo.saveScenarioCanvas(prev, nodes, edges);
    }

    // Load new scenario canvas or start clean
    const saved = demo.loadScenarioCanvas(curr);
    if (saved) {
      setNodes(saved.nodes);
      setEdges(saved.edges);
    } else {
      setNodes([...DEFAULT_NODES]);
      setEdges([]);
    }

    // Reset view
    setPan({ x: window.innerWidth / 2 - 160, y: 100 });
    setZoom(1);
  }, [demo.currentScenario]);
  useEffect(() => {
    localStorage.setItem('goprod_nodes', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem('goprod_edges', JSON.stringify(edges));
  }, [edges]);

  useEffect(() => {
    if (reportData) {
      localStorage.setItem('goprod_report', JSON.stringify(reportData));
    } else {
      localStorage.removeItem('goprod_report');
    }
  }, [reportData]);

  // Demo: detect report loaded
  useEffect(() => {
    if (demo.isDemoActive && reportData && !demo.reportLoaded) {
      demo.setReportLoaded(true);
      // Auto-select scenario 1
      demo.selectScenario(1);
    }
  }, [reportData, demo.isDemoActive, demo.reportLoaded]);

  // Demo: auto-pan to target node when step changes
  const [isAutoPanning, setIsAutoPanning] = useState(false);
  useEffect(() => {
    if (!demo.isDemoActive) return;
    const step = demo.getCurrentStep();
    if (!step || !step.targetNodeType) return;
    const targetNode = nodes.find(n => n.type === step.targetNodeType);
    if (!targetNode) return;

    const screenX = targetNode.x * zoom + pan.x;
    const screenY = targetNode.y * zoom + pan.y;
    const nodeW = 320 * zoom;
    const nodeH = 200 * zoom;
    const nodeCenterX = screenX + nodeW / 2;
    const nodeCenterY = screenY + nodeH / 2;
    const margin = 150;

    const inView =
      nodeCenterX > margin &&
      nodeCenterX < window.innerWidth - margin &&
      nodeCenterY > margin &&
      nodeCenterY < window.innerHeight - margin;

    if (!inView) {
      setIsAutoPanning(true);
      const newPanX = window.innerWidth / 2 - (targetNode.x + 160) * zoom;
      const newPanY = window.innerHeight / 2 - (targetNode.y + 100) * zoom;
      setPan({ x: newPanX, y: newPanY });
      setTimeout(() => setIsAutoPanning(false), 450);
    }
  }, [demo.currentStep, demo.currentScenario, demo.isDemoActive]);

  // Demo: open feedback after all scenarios done
  useEffect(() => {
    if (demo.isDemoActive && demo.currentScenario === 4) {
      setFeedbackOpen(true);
    }
  }, [demo.currentScenario, demo.isDemoActive]);

  // Demo: detect step completion
  useEffect(() => {
    if (!demo.isDemoActive) return;
    const step = demo.getCurrentStep();
    if (!step) return;

    if (step.targetType === 'fill-input' && step.targetNodeType && step.targetVariable && step.expectedValue !== undefined) {
      const targetNode = nodes.find(n => n.type === step.targetNodeType);
      if (targetNode) {
        const currentValue = targetNode.data[step.targetVariable!] || 0;
        const expected = step.expectedValue;
        const tol = step.tolerance || 0.05;
        if (expected !== 0 && Math.abs(currentValue - expected) / Math.abs(expected) <= tol) {
          // Step completed!
          setTimeout(() => demo.advanceStep(), 300);
        }
      }
    }
  }, [nodes, demo.isDemoActive, demo.currentScenario, demo.currentStep]);

  const handleCloseOverlay = () => {
    setShowOverlay(false);
    localStorage.setItem('goprod_welcomed', 'true');
  };

  useEffect(() => {
    setPan({ x: window.innerWidth / 2 - 160, y: 100 });
  }, []);

  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      return {
        x: (screenX - pan.x) / zoom,
        y: (screenY - pan.y) / zoom,
      };
    },
    [pan, zoom],
  );

  const fitView = useCallback(() => {
    if (nodes.length === 0) return;

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    const nodeWidth = 320;
    const nodeHeight = 300;

    nodes.forEach((node) => {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x + nodeWidth);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y + nodeHeight);
    });

    const padding = 50;
    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const scaleX = screenW / contentWidth;
    const scaleY = screenH / contentHeight;
    let newZoom = Math.min(scaleX, scaleY);
    newZoom = Math.min(Math.max(newZoom, 0.2), 1.5);

    const contentCenterX = (minX + maxX) / 2;
    const contentCenterY = (minY + maxY) / 2;

    const newPanX = screenW / 2 - contentCenterX * newZoom;
    const newPanY = screenH / 2 - contentCenterY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [nodes]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanningCanvas(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    setIsDraggingNode(true);
    setDragNodeId(nodeId);

    const worldMouse = screenToWorld(e.clientX, e.clientY);
    setDragOffset({
      x: worldMouse.x - node.x,
      y: worldMouse.y - node.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingNode && dragNodeId) {
      const worldMouse = screenToWorld(e.clientX, e.clientY);
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === dragNodeId) {
            return {
              ...n,
              x: worldMouse.x - dragOffset.x,
              y: worldMouse.y - dragOffset.y,
            };
          }
          return n;
        }),
      );
    } else if (isPanningCanvas) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingNode(false);
    setIsPanningCanvas(false);
    setDragNodeId(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    const newZoom = Math.min(Math.max(zoom + delta, 0.2), 3);

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const worldX = (mouseX - pan.x) / zoom;
    const worldY = (mouseY - pan.y) / zoom;

    const newPanX = mouseX - worldX * newZoom;
    const newPanY = mouseY - worldY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  const handleNodeUpdate = (id: string, newData: Record<string, number>) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, data: newData } : n)));
  };

  const handleAddChild = (parentId: string, childType: string, varMap: Record<string, string>) => {
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent) return;

    const newId = `node_${Date.now()}`;
    const newY = parent.y + 350;
    const existingChildren = edges.filter((e) => e.from === parentId);
    const newX = parent.x + (existingChildren.length === 0 ? 0 : 340);

    const initialData: Record<string, number> = {};

    // 1. Direct Parent Mapping
    if (varMap && parent.data) {
      Object.entries(varMap).forEach(([childVar, parentVar]) => {
        if (parent.data[parentVar] !== undefined) {
          initialData[childVar] = parent.data[parentVar];
        }
      });
    }

    // 2. GLOBAL CONTEXT MAPPING
    if (childType === "total_cost") {
      const matNode = nodes.find((n) => n.type === "cost_material");
      if (matNode && matNode.data.cost) initialData.mat_cost = matNode.data.cost;

      const labNode = nodes.find((n) => n.type === "cost_labor");
      if (labNode && labNode.data.cost) initialData.lab_cost = labNode.data.cost;

      const packNode = nodes.find((n) => n.type === "cost_packaging");
      if (packNode && packNode.data.cost) initialData.disc_cost = packNode.data.cost;
    }

    const moduleDef = MODULES[childType];
    moduleDef.variables.forEach((v) => {
      if (initialData[v.id] === undefined) initialData[v.id] = 0;
    });

    const newNode: NodeData = {
      id: newId,
      type: childType,
      x: newX,
      y: newY,
      data: initialData,
    };

    setNodes((prev) => [...prev, newNode]);
    setEdges((prev) => [...prev, { from: parentId, to: newId }]);
    setSelectedNodeId(newId);

    // Demo: detect click-suggestion step completion
    if (demo.isDemoActive) {
      const step = demo.getCurrentStep();
      if (step && step.targetType === 'click-suggestion' && step.suggestionId === childType) {
        setTimeout(() => demo.advanceStep(), 300);
      }
    }
  };

  const handleDelete = (id: string) => {
    if (id === "root") return;
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id));
  };

  const handleResetAll = () => {
    if (!window.confirm('¿Estás seguro de que quieres reiniciar el simulador? Se borrarán todos los cálculos.')) return;
    setNodes([...DEFAULT_NODES]);
    setEdges([]);
    setReportData(null);
    localStorage.removeItem('goprod_nodes');
    localStorage.removeItem('goprod_edges');
    localStorage.removeItem('goprod_report');
    setPan({ x: window.innerWidth / 2 - 160, y: 100 });
    setZoom(1);
  };

  const handleStartDemo = () => {
    // Reset everything first
    setNodes([...DEFAULT_NODES]);
    setEdges([]);
    setReportData(null);
    localStorage.removeItem('goprod_nodes');
    localStorage.removeItem('goprod_edges');
    localStorage.removeItem('goprod_report');
    setPan({ x: window.innerWidth / 2 - 160, y: 100 });
    setZoom(1);
    demo.startDemo();
  };

  // Get current demo highlight info for nodes
  const getDemoHighlight = (nodeType: string) => {
    if (!demo.isDemoActive) return null;
    const step = demo.getCurrentStep();
    if (!step || step.targetNodeType !== nodeType) return null;
    if (step.targetType !== 'fill-input' && step.targetType !== 'click-suggestion') return null;
    const scenario = DEMO_SCENARIOS.find(s => s.id === demo.currentScenario);
    return { step, accentColor: scenario?.accentColor ?? '#3b82f6' };
  };

  return (
    <div
      className="w-full h-screen bg-slate-50 overflow-hidden relative cursor-grab active:cursor-grabbing font-sans text-slate-800"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: "radial-gradient(#475569 1px, transparent 1px)",
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* Report Panel */}
      <ReportPanel
        reportData={reportData}
        onReportLoaded={setReportData}
        onReportCleared={() => setReportData(null)}
        demoHighlight={demo.isDemoActive && demo.currentScenario === 0 && !reportData}
      />

      {/* Demo Scenario Cards */}
      {demo.isDemoActive && demo.reportLoaded && (
        <ScenarioCards />
      )}

      {/* Demo Overlay */}
      <DemoOverlay />

      {/* Welcome Modal */}
      {showOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-4 animate-scale-in">
            <div className="flex justify-between items-start mb-4">
              <h1 className="font-bold text-xl flex items-center gap-2 text-slate-800">
                <Layers className="text-blue-600" />
                GoProd
              </h1>
              <button
                onClick={handleCloseOverlay}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Comienza adjuntando tu reporte de resultados en el panel izquierdo. Luego, define tu producción objetivo.
              Haz clic en los <strong className="text-blue-600">botones +</strong> dentro de las burbujas para calcular
              valores derivados (Costos, Mano de obra, etc).
            </p>

            <div className="mt-4 space-y-2 text-sm text-slate-500">
              <p className="flex items-center gap-2">
                <Move className="w-4 h-4 text-blue-500" />
                Arrastra el fondo para mover.
              </p>
              <p className="flex items-center gap-2">
                <Move className="w-4 h-4 text-blue-500" />
                Arrastra burbujas para organizar.
              </p>
              <p className="flex items-center gap-2">
                <Maximize className="w-4 h-4 text-blue-500" />
                Scroll para hacer zoom.
              </p>
            </div>

            <button
              onClick={handleCloseOverlay}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Controls - Bottom Right */}
      <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />

      <div className="absolute bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-auto">
        {/* Demo Mode Button */}
        <button
          onClick={handleStartDemo}
          className={`p-2 rounded-lg shadow border transition-colors ${
            demo.isDemoActive
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-white text-slate-400 hover:text-blue-600 hover:border-blue-300 border-slate-200'
          }`}
          title="Modo Demo"
        >
          <GraduationCap className="w-4 h-4" />
        </button>
        <button
          onClick={() => setFeedbackOpen(true)}
          className="bg-white p-2 rounded-lg shadow border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-colors"
          title="Enviar feedback"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
        <button
          onClick={() => exportStrategyPDF(nodes, reportData)}
          className="bg-white p-2 rounded-lg shadow border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-colors"
          title="Exportar resumen estratégico"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetAll}
          className="bg-white p-2 rounded-lg shadow border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-300 transition-colors"
          title="Reiniciar simulador"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          onClick={fitView}
          className="bg-white p-2 rounded-lg shadow border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors"
          title="Ajuste Automático"
        >
          <Maximize className="w-5 h-5" />
        </button>
        <div className="flex flex-col rounded-lg shadow border border-slate-200 bg-white overflow-hidden">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
            className="p-2 hover:bg-slate-50 text-slate-600 border-b border-slate-100"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.2))}
            className="p-2 hover:bg-slate-50 text-slate-600"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-white/80 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-slate-400 text-center border border-slate-200">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Canvas Content */}
      <div
        className="absolute top-0 left-0 w-full h-full origin-top-left pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition: isAutoPanning ? 'transform 0.4s ease' : 'none',
        }}
      >
        <svg className="absolute overflow-visible top-0 left-0 w-full h-full z-0">
          {edges.map((edge, i) => {
            const fromNode = nodes.find((n) => n.id === edge.from);
            const toNode = nodes.find((n) => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            const start = { x: fromNode.x + 160, y: fromNode.y + 100 };
            const end = { x: toNode.x + 160, y: toNode.y };

            return <ConnectionLine key={i} start={start} end={end} />;
          })}
        </svg>

        <div className="relative pointer-events-auto">
          {nodes.map((node) => (
            <Node
              key={node.id}
              node={node}
              data={node.data}
              onUpdate={handleNodeUpdate}
              onDragStart={handleNodeDragStart}
              onAddChild={handleAddChild}
              onDelete={handleDelete}
              isSelected={selectedNodeId === node.id}
              onSelect={setSelectedNodeId}
              demoHighlight={getDemoHighlight(node.type)}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <div className="bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-t-lg border border-b-0 border-slate-200/50 text-[10px] font-mono text-slate-400 whitespace-nowrap shadow-sm">
          GoProd © 2026. Visualize logic, maximize output. Developed by Uniandes. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export const SimulationMap = () => (
  <DemoProvider>
    <SimulationMapInner />
  </DemoProvider>
);

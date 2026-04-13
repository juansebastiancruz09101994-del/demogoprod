import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Layers, X, Move, Maximize, ZoomIn, ZoomOut, Trash2, Download, MessageSquare, GraduationCap, PlayCircle, Package, Activity, DollarSign, TrendingUp, Lightbulb } from "lucide-react";
import { FeedbackModal } from "./FeedbackModal";
import { exportStrategyPDF } from "./ExportPDF";
import { Node } from "./Node";
import { ConnectionLine } from "./ConnectionLine";
import { ReportPanel } from "./ReportPanel";
import { MODULES } from "./modules";
import { NodeData, Edge, ReportData } from "./types";
import { DemoProvider, useDemo, ScenarioCards, DemoOverlay, DEMO_SCENARIOS } from "./DemoMode";
import { GuideProvider, useGuide, GuideOverlay } from "./Guide";

const STARTER_MODULES = [
  { id: 'production_target', title: 'Plan de Producción', icon: <PlayCircle className="w-5 h-5" />, color: 'bg-emerald-500', category: 'Start' },
  { id: 'material_needs', title: 'Req. Materia Prima', icon: <Package className="w-5 h-5" />, color: 'bg-blue-500', category: 'Production' },
  { id: 'labor_needs', title: 'Req. Mano de Obra', icon: <Activity className="w-5 h-5" />, color: 'bg-indigo-500', category: 'Production' },
  { id: 'cost_material', title: 'Costo Material', icon: <DollarSign className="w-5 h-5" />, color: 'bg-teal-600', category: 'Finance' },
  { id: 'cost_labor', title: 'Costo Mano de Obra', icon: <DollarSign className="w-5 h-5" />, color: 'bg-teal-600', category: 'Finance' },
  { id: 'total_cost', title: 'Costo Total Prod.', icon: <DollarSign className="w-5 h-5" />, color: 'bg-slate-700', category: 'Finance' },
  { id: 'unit_cost', title: 'Costo Unitario', icon: <TrendingUp className="w-5 h-5" />, color: 'bg-red-600', category: 'Finance' },
];

const DEFAULT_NODES: NodeData[] = [
  { id: "root", type: "production_target", x: 0, y: 0, data: { target: 280000 } },
];

const SimulationMapInner = () => {
  const [nodes, setNodes] = useState<NodeData[]>(() => {
    try {
      const saved = localStorage.getItem('goprod_nodes');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [showModulePicker, setShowModulePicker] = useState(() => {
    try {
      const saved = localStorage.getItem('goprod_nodes');
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.length === 0;
    } catch { return true; }
  });
  const [edges, setEdges] = useState<Edge[]>(() => {
    try {
      const saved = localStorage.getItem('goprod_edges');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; descendants: string[] } | null>(null);
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
  const guide = useGuide();
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

  const propagateValues = useCallback((updatedNodes: NodeData[], startNodeId: string, currentEdges: Edge[]) => {
    const visited = new Set<string>();
    const queue = [startNodeId];
    let result = [...updatedNodes];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const parentNode = result.find(n => n.id === nodeId);
      if (!parentNode) continue;

      const outEdges = currentEdges.filter(e => e.from === nodeId);
      for (const edge of outEdges) {
        if (visited.has(edge.to)) continue;
        const childIdx = result.findIndex(n => n.id === edge.to);
        if (childIdx === -1) continue;

        const child = result[childIdx];
        const childMod = MODULES[child.type];
        if (!childMod) continue;

        let childData = { ...child.data };
        let changed = false;

        // Copy mapped values from parent to child
        if (edge.varMap) {
          Object.entries(edge.varMap).forEach(([childVar, parentVar]) => {
            const parentVal = parentNode.data[parentVar];
            if (parentVal !== undefined && childData[childVar] !== parentVal) {
              childData[childVar] = parentVal;
              changed = true;
            }
          });
        }

        if (changed) {
          // Use the stored targetId to know which variable to recalculate
          const vars = childMod.variables;
          const storedTarget = child.targetId || (vars.length > 1 ? vars[0].id : null);
          if (storedTarget && childMod.solve) {
            const solved = childMod.solve(childData, storedTarget);
            if (solved !== null) {
              childData[storedTarget] = parseFloat(solved.toFixed(2));
            }
          }

          result[childIdx] = { ...child, data: childData };
          queue.push(edge.to);
        }
      }
    }
    return result;
  }, []);

  const handleNodeUpdate = (id: string, newData: Record<string, number>) => {
    setNodes((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, data: newData } : n));
      return propagateValues(updated, id, edges);
    });
  };

  const handleTargetChange = (id: string, targetId: string) => {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, targetId } : n));
  };

  const handleAddChild = (parentId: string, childType: string, varMap: Record<string, string>) => {
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent) return;

    // Anti-duplicate: if a node of this type already exists, connect to it instead
    const existingNode = nodes.find((n) => n.type === childType);
    if (existingNode) {
      const edgeExists = edges.some(e => 
        (e.from === parentId && e.to === existingNode.id) || 
        (e.from === existingNode.id && e.to === parentId)
      );
      if (!edgeExists) {
        setEdges((prev) => [...prev, { from: parentId, to: existingNode.id, varMap }]);
      }
      setSelectedNodeId(existingNode.id);
      // Demo: detect click-suggestion step completion
      if (demo.isDemoActive) {
        const step = demo.getCurrentStep();
        if (step && step.targetType === 'click-suggestion' && step.suggestionId === childType) {
          setTimeout(() => demo.advanceStep(), 300);
        }
      }
      return;
    }

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
    setEdges((prev) => [...prev, { from: parentId, to: newId, varMap }]);
    setSelectedNodeId(newId);

    // Demo: detect click-suggestion step completion
    if (demo.isDemoActive) {
      const step = demo.getCurrentStep();
      if (step && step.targetType === 'click-suggestion' && step.suggestionId === childType) {
        setTimeout(() => demo.advanceStep(), 300);
      }
    }
  };

  const getDescendants = useCallback((nodeId: string, currentEdges: Edge[]): string[] => {
    const descendants: string[] = [];
    const queue = [nodeId];
    const visited = new Set<string>();
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      const children = currentEdges.filter(e => e.from === current).map(e => e.to);
      for (const child of children) {
        if (!visited.has(child)) {
          descendants.push(child);
          queue.push(child);
        }
      }
    }
    return descendants;
  }, []);

  const handleDelete = (id: string) => {
    const descendants = getDescendants(id, edges);
    const nodeDef = MODULES[nodes.find(n => n.id === id)?.type || ''];
    const nodeName = nodeDef?.title || 'este nodo';
    setDeleteConfirm({ id, name: nodeName, descendants });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    const { id, descendants } = deleteConfirm;
    const idsToRemove = new Set([id, ...descendants]);
    setNodes(prev => {
      const remaining = prev.filter(n => !idsToRemove.has(n.id));
      if (remaining.length === 0) setShowModulePicker(true);
      return remaining;
    });
    setEdges(prev => prev.filter(e => !idsToRemove.has(e.from) && !idsToRemove.has(e.to)));
    setDeleteConfirm(null);
  };

  const handleSelectStartModule = (moduleId: string) => {
    const moduleDef = MODULES[moduleId];
    const initialData: Record<string, number> = {};
    moduleDef.variables.forEach((v) => { initialData[v.id] = 0; });
    
    const newNode: NodeData = {
      id: "root",
      type: moduleId,
      x: 0,
      y: 0,
      data: initialData,
    };
    setNodes([newNode]);
    setEdges([]);
    setShowModulePicker(false);
    setPan({ x: window.innerWidth / 2 - 160, y: 100 });
    setZoom(1);
  };

  const handleResetAll = () => {
    if (!window.confirm('¿Estás seguro de que quieres reiniciar el simulador? Se borrarán todos los cálculos.')) return;
    setNodes([]);
    setEdges([]);
    setReportData(null);
    setShowModulePicker(true);
    localStorage.removeItem('goprod_nodes');
    localStorage.removeItem('goprod_edges');
    localStorage.removeItem('goprod_report');
    setPan({ x: window.innerWidth / 2 - 160, y: 100 });
    setZoom(1);
  };

  const handleStartDemo = () => {
    setNodes([...DEFAULT_NODES]);
    setEdges([]);
    setReportData(null);
    setShowModulePicker(false);
    localStorage.removeItem('goprod_nodes');
    localStorage.removeItem('goprod_edges');
    localStorage.removeItem('goprod_report');
    setPan({ x: window.innerWidth / 2 - 160, y: 100 });
    setZoom(1);
    demo.startDemo();
  };

  // Recompute guide whenever selected node or node data changes
  useEffect(() => {
    if (demo.isDemoActive) {
      // Guide is disabled during demo
      return;
    }
    guide.computeGuidance(selectedNodeId, nodes);
  }, [selectedNodeId, nodes, demo.isDemoActive, guide.isGuideActive]);

  // Get current demo highlight info for nodes
  const getDemoHighlight = (nodeType: string) => {
    if (!demo.isDemoActive) return null;
    const step = demo.getCurrentStep();
    if (!step || step.targetNodeType !== nodeType) return null;
    if (step.targetType !== 'fill-input' && step.targetType !== 'click-suggestion') return null;
    const scenario = DEMO_SCENARIOS.find(s => s.id === demo.currentScenario);
    return { step, accentColor: scenario?.accentColor ?? '#3b82f6' };
  };

  // Get guide highlight for a specific node
  const getGuideHighlight = (nodeId: string) => {
    if (demo.isDemoActive || !guide.isGuideActive) return null;
    if (guide.activeNodeId !== nodeId) return null;
    return {
      highlightFields: guide.highlightFields,
      highlightSuggestions: guide.highlightSuggestions,
    };
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

      {/* Module Picker */}
      {showModulePicker && !demo.isDemoActive && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg mx-4 pointer-events-auto animate-scale-in border border-slate-200">
            <h2 className="font-bold text-lg text-slate-800 mb-1">¿Por dónde quieres empezar?</h2>
            <p className="text-sm text-slate-500 mb-4">Elige el módulo inicial. Luego podrás derivar los demás cálculos desde ahí.</p>
            <div className="grid grid-cols-2 gap-3">
              {STARTER_MODULES.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => handleSelectStartModule(mod.id)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left group"
                >
                  <div className={`p-2 rounded-lg text-white ${mod.color}`}>
                    {mod.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-700 group-hover:text-blue-700 transition-colors">{mod.title}</div>
                    <div className="text-[10px] text-slate-400 uppercase">{mod.category}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
              onTargetChange={handleTargetChange}
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

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-red-100">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Eliminar nodo</h3>
            </div>
            <p className="text-sm text-slate-600 mb-1">
              ¿Eliminar <span className="font-semibold">"{deleteConfirm.name}"</span>?
            </p>
            {deleteConfirm.descendants.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-red-600 font-medium mb-2">
                  También se eliminarán {deleteConfirm.descendants.length} nodo(s) conectado(s):
                </p>
                <ul className="space-y-1 ml-1">
                  {deleteConfirm.descendants.map(dId => {
                    const dNode = nodes.find(n => n.id === dId);
                    const dMod = dNode ? MODULES[dNode.type] : null;
                    return (
                      <li key={dId} className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                        {dMod?.title || 'Nodo desconocido'}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {deleteConfirm.descendants.length === 0 && <div className="mb-4" />}
            <p className="text-xs text-slate-400 mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const SimulationMap = () => (
  <DemoProvider>
    <SimulationMapInner />
  </DemoProvider>
);

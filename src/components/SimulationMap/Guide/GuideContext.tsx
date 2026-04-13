import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { NodeData } from '../types';
import { MODULES } from '../modules';
import { MODULE_HINTS, SUGGESTION_HINTS, GENERIC_COMPLETION } from './guideHints';

interface GuideState {
  isGuideActive: boolean;
  guideMessage: string | null;
  highlightFields: string[];        // variable IDs to pulse blue
  highlightSuggestions: boolean;     // pulse green on suggestions
  activeNodeId: string | null;
}

interface GuideContextType extends GuideState {
  toggleGuide: () => void;
  setGuideActive: (v: boolean) => void;
  computeGuidance: (selectedNodeId: string | null, nodes: NodeData[]) => void;
}

const GuideContext = createContext<GuideContextType | null>(null);

export const useGuide = () => {
  const ctx = useContext(GuideContext);
  if (!ctx) throw new Error('useGuide must be inside GuideProvider');
  return ctx;
};

export const GuideProvider = ({ children }: { children: ReactNode }) => {
  const [isGuideActive, setIsGuideActive] = useState(() => {
    const saved = localStorage.getItem('goprod_guide_active');
    return saved !== null ? saved === 'true' : true; // on by default
  });

  const [guideMessage, setGuideMessage] = useState<string | null>(null);
  const [highlightFields, setHighlightFields] = useState<string[]>([]);
  const [highlightSuggestions, setHighlightSuggestions] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('goprod_guide_active', String(isGuideActive));
  }, [isGuideActive]);

  const toggleGuide = useCallback(() => {
    setIsGuideActive(prev => !prev);
  }, []);

  const setGuideActive = useCallback((v: boolean) => {
    setIsGuideActive(v);
  }, []);

  const computeGuidance = useCallback((selectedNodeId: string | null, nodes: NodeData[]) => {
    if (!isGuideActive || !selectedNodeId) {
      setGuideMessage(null);
      setHighlightFields([]);
      setHighlightSuggestions(false);
      setActiveNodeId(null);
      return;
    }

    const node = nodes.find(n => n.id === selectedNodeId);
    if (!node) {
      setGuideMessage(null);
      setHighlightFields([]);
      setHighlightSuggestions(false);
      setActiveNodeId(null);
      return;
    }

    setActiveNodeId(selectedNodeId);
    const moduleDef = MODULES[node.type];
    if (!moduleDef) return;

    const targetId = node.targetId || (moduleDef.variables.length > 1 ? moduleDef.variables[0].id : null);

    // Find empty non-target variables (these need user input)
    const emptyVars = moduleDef.variables.filter(v => {
      if (v.id === targetId) return false; // skip the computed target
      const val = node.data[v.id];
      return val === undefined || val === 0;
    });

    if (emptyVars.length > 0) {
      // State A: has empty fields
      setHighlightFields(emptyVars.map(v => v.id));
      setHighlightSuggestions(false);

      // Build hint message from the first empty var
      const hints = MODULE_HINTS[node.type];
      const firstEmpty = emptyVars[0];
      const hint = hints?.[firstEmpty.id] || `Ingresa un valor para "${firstEmpty.label}".`;
      
      if (emptyVars.length === 1) {
        setGuideMessage(hint);
      } else {
        const otherNames = emptyVars.slice(1).map(v => `"${v.label}"`).join(', ');
        setGuideMessage(`${hint}\n\nTambién necesitas completar: ${otherNames}.`);
      }
    } else {
      // State B: all fields filled
      setHighlightFields([]);
      const suggestions = moduleDef.suggestions || [];
      setHighlightSuggestions(suggestions.length > 0);
      
      if (suggestions.length > 0) {
        const lines = suggestions.map(s => {
          const hint = SUGGESTION_HINTS[s.id] || '';
          return `• ${s.label} → ${hint}`;
        }).join('\n');
        setGuideMessage(`${GENERIC_COMPLETION}\n\n${lines}`);
      } else {
        setGuideMessage('¡Cálculo completo!');
      }
    }
  }, [isGuideActive]);

  return (
    <GuideContext.Provider value={{
      isGuideActive,
      guideMessage,
      highlightFields,
      highlightSuggestions,
      activeNodeId,
      toggleGuide,
      setGuideActive,
      computeGuidance,
    }}>
      {children}
    </GuideContext.Provider>
  );
};

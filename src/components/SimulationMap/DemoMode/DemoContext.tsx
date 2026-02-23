import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { DEMO_SCENARIOS, DemoStep } from './demoScenarios';

interface DemoContextType {
  isDemoActive: boolean;
  currentScenario: number; // 0 = pre-load, 1-3 = scenario index
  currentStep: number;
  scenarioExpanded: number | null;
  reportLoaded: boolean;
  startDemo: () => void;
  exitDemo: () => void;
  setReportLoaded: (loaded: boolean) => void;
  selectScenario: (id: number) => void;
  advanceStep: () => void;
  skipStep: () => void;
  getCurrentStep: () => DemoStep | null;
  isScenarioCompleted: (id: number) => boolean;
  completedScenarios: number[];
}

const DemoContext = createContext<DemoContextType | null>(null);

export const useDemo = () => {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
};

export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [scenarioExpanded, setScenarioExpanded] = useState<number | null>(null);
  const [reportLoaded, setReportLoaded] = useState(false);
  const [completedScenarios, setCompletedScenarios] = useState<number[]>([]);

  const startDemo = useCallback(() => {
    setIsDemoActive(true);
    setCurrentScenario(0);
    setCurrentStep(0);
    setScenarioExpanded(null);
    setCompletedScenarios([]);
  }, []);

  const exitDemo = useCallback(() => {
    setIsDemoActive(false);
    setCurrentScenario(0);
    setCurrentStep(0);
    setScenarioExpanded(null);
  }, []);

  const selectScenario = useCallback((id: number) => {
    setScenarioExpanded(prev => prev === id ? null : id);
    if (currentScenario !== id) {
      setCurrentScenario(id);
      setCurrentStep(0);
    }
  }, [currentScenario]);

  const advanceStep = useCallback(() => {
    const scenario = DEMO_SCENARIOS.find(s => s.id === currentScenario);
    if (!scenario) return;

    const nextStep = currentStep + 1;
    if (nextStep >= scenario.steps.length) {
      // Scenario completed
      setCompletedScenarios(prev => [...prev, currentScenario]);
      const nextScenarioId = currentScenario + 1;
      if (nextScenarioId <= 3) {
        setCurrentScenario(nextScenarioId);
        setCurrentStep(0);
        setScenarioExpanded(nextScenarioId);
      } else {
        // All done - signal to open feedback
        setCurrentScenario(4); // signal completed all
      }
    } else {
      setCurrentStep(nextStep);
    }
  }, [currentScenario, currentStep]);

  const skipStep = useCallback(() => {
    advanceStep();
  }, [advanceStep]);

  const getCurrentStep = useCallback((): DemoStep | null => {
    if (currentScenario === 0 || currentScenario > 3) return null;
    const scenario = DEMO_SCENARIOS.find(s => s.id === currentScenario);
    if (!scenario || currentStep >= scenario.steps.length) return null;
    return scenario.steps[currentStep];
  }, [currentScenario, currentStep]);

  const isScenarioCompleted = useCallback((id: number) => {
    return completedScenarios.includes(id);
  }, [completedScenarios]);

  return (
    <DemoContext.Provider value={{
      isDemoActive,
      currentScenario,
      currentStep,
      scenarioExpanded,
      reportLoaded,
      startDemo,
      exitDemo,
      setReportLoaded,
      selectScenario,
      advanceStep,
      skipStep,
      getCurrentStep,
      isScenarioCompleted,
      completedScenarios,
    }}>
      {children}
    </DemoContext.Provider>
  );
};

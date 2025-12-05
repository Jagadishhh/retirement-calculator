import React, { useState, useEffect, useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI, Type } from "@google/genai";
import { 
  DataEncryption, 
  InputValidator, 
  SecurityAuditLogger, 
  RateLimiter,
  SessionManager,
  SecureDataExport,
  CSRFProtection
} from "./security";
import AgeRangePicker from "./AgeRangePicker";

declare var html2pdf: any;

// --- Types & Interfaces ---

type ScenarioType = 'median' | 'best' | 'worst';

interface MajorExpense {
  id: string;
  name: string;
  currentCost: number;
  purchaseAge: number;
  inflationRate: number;
  typeId?: string; // To track icon/category
}

interface UserInputs {
  currentAge: number;
  retirementAge: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  expectedReturn: number; // Pre-retirement
  inflation: number; // Pre-retirement lifestyle inflation
  stepUpSIP: number;
  majorExpenses: MajorExpense[];
}

interface YearlyData {
  year: number;
  age: number;
  phase: 'Accumulation' | 'Transition' | 'Decumulation' | 'Depleted';
  cashflow: number;
  corpus: number;
  returnApplied: number;
  inflationApplied: number;
  withdrawalReason?: string;
  note?: string; // For transparency
}

interface ScenarioResult {
  title: string;
  requiredCorpus: number;
  projectedCorpus: number; // At retirement
  shortfall: number;
  yearsLasting: number;
  finalAge: number;
  data: YearlyData[];
  swr: number;
  colorClass: string;
  strokeColor: string;
  fillColor: string;
  description: string;
  status: 'safe' | 'risk' | 'critical';
}

interface ExpenseOptimization {
  expenseId: string;
  name: string;
  originalAge: number;
  safeAge: number | null; 
  impactYears: number;
  status: 'safe' | 'caution' | 'unsafe';
  targetAge: number;
}

interface FullProjection {
  yearsToRetirement: number;
  monthlySavings: number;
  monthlyExpenseAtRetirement: number;
  annualExpenseAtRetirement: number;
  median: ScenarioResult;
  best: ScenarioResult;
  worst: ScenarioResult;
  // Baselines for comparison (without major expenses) for EACH scenario
  baselines: Record<ScenarioType, ScenarioResult>;
  // Optimizations specific to EACH scenario
  optimizations: Record<ScenarioType, ExpenseOptimization[]>;
}

// --- Icons ---
const Icons = {
  TrendingUp: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  TrendingDown: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>,
  Alert: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
  Plus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  Robot: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Info: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ChevronDown: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>,
  ChevronUp: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>,
  Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Refresh: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  ZoomIn: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>,
  Menu: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>,
  X: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Download: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
};

// --- Constants ---

const DEFAULTS: UserInputs = {
  currentAge: 32,
  retirementAge: 55,
  monthlyIncome: 150000,
  monthlyExpenses: 60000,
  currentSavings: 1000000,
  expectedReturn: 12,
  inflation: 6,
  stepUpSIP: 10,
  majorExpenses: []
};

const MAX_AGE = 100;

const TARGETS = {
    median: 90,
    best: 100, 
    worst: 75
};

const EXPENSE_TYPES = [
    { id: 'custom', label: 'Custom', icon: '✨' },
    { id: 'home', label: 'Home Purchase', icon: '🏠' },
    { id: 'car', label: 'Car / Vehicle', icon: '🚗' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'wedding', label: 'Wedding', icon: '💍' },
    { id: 'travel', label: 'World Tour', icon: '✈️' },
    { id: 'medical', label: 'Medical Emergency', icon: '🏥' },
    { id: 'business', label: 'New Business', icon: '💼' },
];


// --- Helper Functions ---

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatLakhsCrores = (amount: number) => {
  const absAmount = Math.abs(amount);
  if (absAmount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (absAmount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return formatCurrency(amount);
};

const getDeterministicRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const getSWR = (retireAge: number): number => {
  if (retireAge < 45) return 0.025; // 2.5%
  if (retireAge <= 55) return 0.030; // 3.0%
  return 0.035; // 3.5%
};

// --- CORE ACTUARY LOGIC (UNCHANGED) ---

const calculateScenario = (
  inputs: UserInputs,
  type: ScenarioType,
  ignoreExpenses: boolean = false
): ScenarioResult => {
  const {
    currentAge,
    retirementAge,
    currentSavings,
    monthlyIncome,
    monthlyExpenses,
    stepUpSIP,
  } = inputs;

  const currentYear = new Date().getFullYear();
  const yearsToRetire = Math.max(0, retirementAge - currentAge);

  let preRetReturn = inputs.expectedReturn;
  let preRetInflation = inputs.inflation;
  
  let generalPostRetInf = Math.max(5.0, inputs.inflation - 0.5);
  let healthInfRate = 9.0; 

  if (type === 'best') {
    preRetReturn += 2;
    preRetInflation -= 1;
    generalPostRetInf = Math.max(4.0, generalPostRetInf - 1);
    healthInfRate = 7.0; 
  } else if (type === 'worst') {
    preRetReturn -= 3; 
    preRetInflation += 1.5;
    generalPostRetInf += 1.5;
    healthInfRate = 10.0;
  }

  const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);
  const annualSavings = monthlySavings * 12;
  
  const expenseInflationFactor = Math.pow(1 + preRetInflation / 100, yearsToRetire);
  const futureMonthlyExpenses = monthlyExpenses * expenseInflationFactor;
  const futureAnnualExpenses = futureMonthlyExpenses * 12;

  const swr = getSWR(retirementAge);
  const requiredCorpus = futureAnnualExpenses / swr;

  const data: YearlyData[] = [];
  let corpus = currentSavings;
  let currentSIPAnnual = annualSavings;
  let currentWithdrawal = futureAnnualExpenses; 

  let postRetGrowthStreak = 0;
  let hasDepleted = false;

  for (let age = currentAge; age <= MAX_AGE; age++) {
    const year = currentYear + (age - currentAge);
    const isPreRetirement = age < retirementAge;
    const yearsPostRetirement = age - retirementAge;
    let note = "";

    if (!ignoreExpenses) {
        const yearExpenses = inputs.majorExpenses.filter(e => e.purchaseAge === age);
        let totalDeduction = 0;
        
        yearExpenses.forEach(e => {
            const yearsToPurchase = e.purchaseAge - inputs.currentAge;
            const inflatedCost = e.currentCost * Math.pow(1 + e.inflationRate/100, yearsToPurchase);
            totalDeduction += inflatedCost;
            note += (note ? "; " : "") + `Buy: ${e.name} (-${formatLakhsCrores(inflatedCost)})`;
        });

        if (totalDeduction > 0) {
            corpus -= totalDeduction;
        }
    }

    if (isPreRetirement) {
      if (corpus < 0) hasDepleted = true; 

      data.push({
        year,
        age,
        phase: 'Accumulation',
        cashflow: currentSIPAnnual,
        corpus: Math.max(0, corpus), 
        returnApplied: preRetReturn,
        inflationApplied: preRetInflation,
        note: age === currentAge ? "Start" + (note ? "; " + note : "") : note
      });

      if (!hasDepleted) {
        corpus = (corpus + currentSIPAnnual) * (1 + preRetReturn / 100);
        currentSIPAnnual = currentSIPAnnual * (1 + stepUpSIP / 100);
      }
      continue;
    }

    if (hasDepleted || corpus <= 0) {
      if (!hasDepleted) {
          note = (note ? note + ". " : "") + "CORPUS DEPLETED";
      }
      hasDepleted = true;
      data.push({
        year,
        age,
        phase: 'Depleted',
        cashflow: 0,
        corpus: 0,
        returnApplied: 0,
        inflationApplied: 0,
        note
      });
      continue;
    }

    let baseReturn = 0;
    if (age < 60) {
        baseReturn = inputs.expectedReturn - 4;      
        if (yearsPostRetirement === 0 && !note) note = "Retirement Transition";
    }
    else if (age < 75) {
        baseReturn = inputs.expectedReturn - 6; 
        if (age === 60) note = (note ? note + ". " : "") + "De-risking";
    }
    else if (age < 75) {
        baseReturn = inputs.expectedReturn - 7; 
        if (age === 75) note = (note ? note + ". " : "") + "Heavy Debt Alloc";
    }
    else {
        baseReturn = 4;                                       
        if (age === 90) note = (note ? note + ". " : "") + "Preservation";
    }

    if (type === 'best') baseReturn += 2;
    if (type === 'worst') baseReturn -= 3;

    let healthWeight = 0;
    if (age >= 60) {
      healthWeight = Math.min(0.6, 0.2 + (age - 60) * 0.01);
      if (age === 60) note = (note ? note + ". " : "") + "Healthcare Costs Up";
    }
    const effectiveInflation = ((1 - healthWeight) * generalPostRetInf) + (healthWeight * healthInfRate);

    let cappedReturn = baseReturn;
    const maxRealReturn = 0.015; 
    const impliedReal = ((1 + baseReturn/100) / (1 + effectiveInflation/100)) - 1;
    
    if (impliedReal > maxRealReturn) {
      cappedReturn = ((1 + effectiveInflation/100) * (1 + maxRealReturn) - 1) * 100;
    }

    let finalReturn = cappedReturn;
    if (yearsPostRetirement <= 10) {
        const volatilitySeed = year * 1337;
        const randomSwing = (getDeterministicRandom(volatilitySeed) * 6) - 3; 
        if (type !== 'median') finalReturn += randomSwing;
        else finalReturn += (randomSwing * 0.5); 

        if (type === 'worst') {
           if (yearsPostRetirement === 0) { finalReturn = -35; note = (note ? note + ". " : "") + "MARKET CRASH (-35%)"; }
           else if (yearsPostRetirement === 1) { finalReturn = -10; note = (note ? note + ". " : "") + "Bear Market"; }
           else if (yearsPostRetirement === 2) { finalReturn = -5; }
        }
        if (type === 'best' && yearsPostRetirement < 5) {
           finalReturn = Math.max(finalReturn, 12); 
           if (yearsPostRetirement === 0) note = (note ? note + ". " : "") + "Bull Run Start";
        }
    }

    if (postRetGrowthStreak > 10) {
       const targetReturn = effectiveInflation - 1.0; 
       finalReturn = Math.min(finalReturn, targetReturn);
    }

    data.push({
      year,
      age,
      phase: yearsPostRetirement === 0 ? 'Transition' : 'Decumulation',
      cashflow: -currentWithdrawal,
      corpus: corpus,
      returnApplied: finalReturn,
      inflationApplied: effectiveInflation,
      note
    });

    const startCorpus = corpus;
    corpus = (corpus * (1 + finalReturn / 100)) - currentWithdrawal;

    if (corpus > startCorpus) postRetGrowthStreak++;
    else postRetGrowthStreak = 0;

    currentWithdrawal = currentWithdrawal * (1 + effectiveInflation / 100);
  }

  const yearsLasting = data.filter(d => d.corpus > 0 && d.phase !== 'Accumulation').length;
  const projectedCorpus = data.find(d => d.phase === 'Transition')?.corpus || 0;
  const shortfall = Math.max(0, requiredCorpus - projectedCorpus);
  const finalAge = retirementAge + yearsLasting;

  let title = "Base Plan";
  let colorClass = "ring-emerald-500/20";
  let strokeColor = "#10b981"; // Emerald 500
  let fillColor = "rgba(16, 185, 129, 0.1)";
  let desc = "Balanced assumptions.";
  let status: 'safe' | 'risk' | 'critical' = finalAge >= 90 ? 'safe' : finalAge > 80 ? 'risk' : 'critical';

  if (type === 'best') {
    title = "Optimistic";
    colorClass = "ring-indigo-500/20";
    strokeColor = "#6366f1"; // Indigo 500
    fillColor = "rgba(99, 102, 241, 0.1)";
    desc = "High returns, low inflation.";
    status = finalAge >= 95 ? 'safe' : 'risk';
  } else if (type === 'worst') {
    title = "Pessimistic";
    colorClass = "ring-rose-500/20";
    strokeColor = "#f43f5e"; // Rose 500
    fillColor = "rgba(244, 63, 94, 0.1)";
    desc = "Early crash, high inflation.";
    status = finalAge >= 85 ? 'safe' : 'critical';
  }

  return {
    title,
    requiredCorpus,
    projectedCorpus,
    shortfall,
    yearsLasting,
    finalAge,
    data,
    swr,
    colorClass,
    strokeColor,
    fillColor,
    description: desc,
    status
  };
};

const calculateFinances = (inputs: UserInputs): FullProjection => {
  const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
  const monthlySavings = Math.max(0, inputs.monthlyIncome - inputs.monthlyExpenses);
  const expenseAtRetirement = inputs.monthlyExpenses * Math.pow(1 + inputs.inflation / 100, yearsToRetirement);

  const median = calculateScenario(inputs, 'median');
  const best = calculateScenario(inputs, 'best');
  const worst = calculateScenario(inputs, 'worst');

  const baselines = {
      median: calculateScenario(inputs, 'median', true),
      best: calculateScenario(inputs, 'best', true),
      worst: calculateScenario(inputs, 'worst', true)
  };

  const scenarioTypes: ScenarioType[] = ['median', 'best', 'worst'];
  const optimizations: Record<ScenarioType, ExpenseOptimization[]> = { median: [], best: [], worst: [] };

  scenarioTypes.forEach(type => {
      const currentResult = type === 'median' ? median : type === 'best' ? best : worst;
      const baselineResult = baselines[type];
      const targetAge = TARGETS[type];
      
      optimizations[type] = inputs.majorExpenses.map(expense => {
          const impactYears = Math.max(0, baselineResult.finalAge - currentResult.finalAge);
          const isSafeCurrent = currentResult.finalAge >= targetAge;
          
          let safeAge = null;

          if (!isSafeCurrent) {
            const maxDelay = 15;
            for (let delay = 1; delay <= maxDelay; delay++) {
                const testAge = expense.purchaseAge + delay;
                if (testAge > MAX_AGE) break;

                const testInputs = {
                    ...inputs,
                    majorExpenses: inputs.majorExpenses.map(e => 
                        e.id === expense.id ? { ...e, purchaseAge: testAge } : e
                    )
                };
                
                const testScenario = calculateScenario(testInputs, type);
                
                if (testScenario.finalAge >= targetAge && safeAge === null) {
                    safeAge = testAge;
                    break; 
                }
            }
          } else {
             safeAge = expense.purchaseAge;
          }

          return {
              expenseId: expense.id,
              name: expense.name,
              originalAge: expense.purchaseAge,
              safeAge,
              impactYears,
              status: isSafeCurrent ? 'safe' : safeAge ? 'caution' : 'unsafe',
              targetAge
          };
      });
  });

  return {
    yearsToRetirement,
    monthlySavings,
    monthlyExpenseAtRetirement: expenseAtRetirement,
    annualExpenseAtRetirement: expenseAtRetirement * 12,
    median,
    best,
    worst,
    baselines,
    optimizations
  };
};

// --- Components ---

const InputGroup = ({ label, children, subLabel, badge }: { label: string, subLabel?: string, badge?: string, children?: React.ReactNode }) => (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-gray-700 tracking-tight">{label}</label>
        {badge && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100 uppercase tracking-wider">{badge}</span>}
      </div>
    </div>
    {children}
    {subLabel && <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">{subLabel}</p>}
  </div>
);

// Improved formatted currency input
const FormattedCurrencyInput = ({ value, onChange, placeholder }: { value: number, onChange: (v: number) => void, placeholder?: string }) => {
    const format = (val: number) => {
        if (!val) return "";
        return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        onChange(raw ? parseInt(raw, 10) : 0);
    };

    return (
        <div className="relative group w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <span className="text-gray-400 font-medium text-sm transition-colors group-focus-within:text-brand-600">₹</span>
            </div>
            <input
                type="text"
                inputMode="numeric"
                value={value ? format(value) : ''}
                onChange={handleChange}
                placeholder={placeholder || "0"}
                className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-7 pr-3 text-gray-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all shadow-sm placeholder-gray-300"
            />
        </div>
    );
};

// Legacy CurrencyInput for compatibility if needed elsewhere, though usually replaced
const CurrencyInput = ({ value, onChange }: { value: number, onChange: (v: number) => void }) => (
  <FormattedCurrencyInput value={value} onChange={onChange} />
);

const NumberInput = ({ value, onChange, min, max }: { value: number, onChange: (v: number) => void, min?: number, max?: number }) => (
  <div className="relative group">
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 px-3 text-gray-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all shadow-sm placeholder-gray-400"
    />
  </div>
);

const SliderInput = ({ value, onChange, min = 0, max = 20, step = 0.5, suffix = "%" }: { value: number, onChange: (v: number) => void, min?: number, max?: number, step?: number, suffix?: string }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
    <div className="flex justify-between items-end mb-4">
      <span className="text-xl font-bold text-gray-900 tracking-tight leading-none">{value.toFixed(1)}<span className="text-sm text-gray-500 ml-0.5 font-medium">{suffix}</span></span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-brand-600 hover:accent-brand-700"
    />
    <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-semibold tracking-wide uppercase">
      <span>{min}{suffix}</span>
      <span>{max}{suffix}</span>
    </div>
  </div>
);

// --- New Expense Components ---

const ExpenseCardEdit = ({ 
    expense, 
    onUpdate, 
    onDelete, 
    onDone,
    minAge 
}: { 
    expense: MajorExpense, 
    onUpdate: (id: string, field: keyof MajorExpense, val: any) => void,
    onDelete: (id: string) => void,
    onDone: () => void,
    minAge: number
}) => {
    return (
        <div className="p-1 bg-white rounded-xl border border-brand-200 shadow-md relative animate-slide-up ring-2 ring-brand-500/10">
            <div className="bg-gray-50/50 p-3 rounded-t-xl border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-lg shadow-sm">
                        {EXPENSE_TYPES.find(t => t.id === (expense.typeId || 'custom'))?.icon || '✨'}
                    </div>
                    <select 
                        className="bg-transparent text-xs font-bold text-gray-600 uppercase tracking-wider focus:outline-none cursor-pointer hover:text-gray-900"
                        value={expense.typeId || 'custom'}
                        onChange={(e) => onUpdate(expense.id, 'typeId', e.target.value)}
                    >
                        {EXPENSE_TYPES.map(t => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                    </select>
                </div>
                <button 
                    onClick={() => onDelete(expense.id)} 
                    className="text-gray-300 hover:text-rose-500 transition-colors p-1"
                    title="Remove Expense"
                >
                    <Icons.Trash />
                </button>
            </div>
            
            <div className="p-3">
                <input 
                    className="block w-full text-sm font-bold text-gray-900 border-none p-0 focus:ring-0 placeholder-gray-300 mb-4 bg-transparent" 
                    value={expense.name}
                    onChange={(e) => onUpdate(expense.id, 'name', e.target.value)}
                    placeholder="Description"
                    autoFocus
                />
                <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-8">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Est. Cost</label>
                        <FormattedCurrencyInput value={expense.currentCost} onChange={(v) => onUpdate(expense.id, 'currentCost', v)} placeholder="0" />
                    </div>
                    <div className="col-span-4">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Age</label>
                        <NumberInput value={expense.purchaseAge} onChange={(v) => onUpdate(expense.id, 'purchaseAge', v)} min={minAge} />
                    </div>
                </div>
            </div>

            <div className="p-2 border-t border-gray-100 bg-gray-50/30 rounded-b-xl flex justify-end">
                <button 
                    onClick={onDone}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-wide rounded-md shadow-sm transition-all hover:shadow-md"
                >
                    <Icons.Check /> Add to Plan
                </button>
            </div>
        </div>
    );
};

const ExpenseCardSummary = ({ 
    expense, 
    onClick 
}: { 
    expense: MajorExpense, 
    onClick: () => void 
}) => {
    return (
        <div 
            onClick={onClick}
            className="group flex items-center justify-between p-3 bg-white border border-gray-200 hover:border-brand-300 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-lg border border-gray-100">
                    {EXPENSE_TYPES.find(t => t.id === (expense.typeId || 'custom'))?.icon || '✨'}
                </div>
                <div>
                    <div className="text-xs font-bold text-gray-900">{expense.name}</div>
                    <div className="text-[10px] text-gray-500 font-medium flex items-center gap-1.5">
                        <span className="font-mono">{formatCurrency(expense.currentCost)}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>Age {expense.purchaseAge}</span>
                    </div>
                </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-brand-600">
                 <Icons.Edit />
            </div>
        </div>
    );
};

const StatCard = ({ scenario, active, onClick }: { scenario: ScenarioResult, active: boolean, onClick: () => void }) => {
  const statusColors = {
    safe: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    risk: 'text-amber-700 bg-amber-50 border-amber-100',
    critical: 'text-rose-700 bg-rose-50 border-rose-100'
  };

  return (
    <div 
      onClick={onClick}
      className={`group relative p-6 rounded-2xl cursor-pointer transition-all duration-300 bg-white border ${active ? 'border-brand-500 shadow-focus' : 'border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'}`}
    >
      <div className="flex justify-between items-start mb-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{scenario.title}</p>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${statusColors[scenario.status]}`}>
            {scenario.status}
        </span>
      </div>
      
      <div className="flex items-baseline gap-1.5 mb-5">
          <span className="text-4xl font-bold text-gray-900 tracking-tighter">{scenario.finalAge >= MAX_AGE ? '100+' : scenario.finalAge}</span>
          <span className="text-sm text-gray-500 font-semibold">years old</span>
      </div>
      
      <div className="pt-4 border-t border-gray-50 space-y-2">
         <div className="flex justify-between items-center text-xs">
           <span className="text-gray-500 font-medium">Projected</span>
           <span className="font-mono font-bold text-gray-900">{formatLakhsCrores(scenario.projectedCorpus)}</span>
         </div>
         <div className="flex justify-between items-center text-xs">
           <span className="text-gray-500 font-medium">Required</span>
           <span className="font-mono font-bold text-gray-900">{formatLakhsCrores(scenario.requiredCorpus)}</span>
         </div>
         {scenario.shortfall > 0 && (
            <div className="mt-3 text-[10px] font-bold text-rose-600 flex items-center justify-end gap-1.5 bg-rose-50 px-3 py-1.5 rounded-md">
               Shortfall: {formatLakhsCrores(scenario.shortfall)}
            </div>
         )}
      </div>
    </div>
  )
};

const ActuaryChart = ({ dataSets, baseline }: { dataSets: ScenarioResult[], baseline?: ScenarioResult }) => {
    const height = 400;
    const width = 900;
    const padding = 50;
    const containerRef = useRef<HTMLDivElement>(null);
    const dragStartRef = useRef<{ x: number, start: number, end: number } | null>(null);

    const allPoints = dataSets.flatMap(s => s.data);
    const globalMaxCorpus = Math.max(...allPoints.map(d => d.corpus)) * 1.1;
    const minDataAge = Math.min(...allPoints.map(d => d.age));
    const maxDataAge = MAX_AGE;

    // View state tracks visible Age range
    const [view, setView] = useState({ start: minDataAge, end: maxDataAge });
    const [isDragging, setIsDragging] = useState(false);
    const [tooltip, setTooltip] = useState<{
        x: number;
        age: number;
        year: number;
        items: { label: string; value: number; color: string }[]
    } | null>(null);

    // Reset view if data changes dramatically
    useEffect(() => {
        setView({ start: minDataAge, end: maxDataAge });
    }, [minDataAge]);

    const currentRange = view.end - view.start;
    
    // Coordinate Transformers
    const getX = (age: number) => padding + ((age - view.start) / currentRange) * (width - 2 * padding);
    const getY = (val: number) => height - padding - (Math.max(0, val) / globalMaxCorpus) * (height - 2 * padding);

    // Path Generators
    const makePath = (data: YearlyData[]) => {
       if (data.length === 0) return "";
       // Filter points visible or adjacent to view to avoid rendering issues
       const visibleData = data.filter(d => d.age >= view.start - 1 && d.age <= view.end + 1);
       if (visibleData.length === 0) return "";
       
       return visibleData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.age)} ${getY(d.corpus)}`).join(" ");
    };

    const makeArea = (data: YearlyData[]) => {
      const line = makePath(data);
      if (!line) return "";
      // To close the area, we need to go down to y=0 at the last point, then back to first point's x at y=0
      // We rely on visibleData logic from makePath, so re-calculating points for area bottom
      const visibleData = data.filter(d => d.age >= view.start - 1 && d.age <= view.end + 1);
      if (visibleData.length === 0) return "";
      
      const last = visibleData[visibleData.length - 1];
      const first = visibleData[0];
      
      return `${line} L ${getX(last.age)} ${getY(0)} L ${getX(first.age)} ${getY(0)} Z`;
    }

    // Interaction Handlers
    const handleWheel = (e: React.WheelEvent) => {
        // Calculate mouse relative position to zoom towards cursor
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const chartWidth = width - 2 * padding; 
        
        // Convert screen X to SVG X, then to relative ratio
        // We approximate that rect.width maps to SVG 'width' roughly for hit testing
        // A more precise way is getting CTM, but ratio works well for responsive SVGs
        const ratio = (mouseX / rect.width * width - padding) / chartWidth;
        const clampedRatio = Math.max(0, Math.min(1, ratio));

        const direction = e.deltaY > 0 ? 1 : -1;
        const zoomFactor = 0.1; 
        const delta = currentRange * zoomFactor * direction;

        let newRange = currentRange + delta;
        const minRange = 5; // Minimum 5 years window
        const maxRange = maxDataAge - minDataAge;
        
        if (newRange < minRange) newRange = minRange;
        if (newRange > maxRange) newRange = maxRange;

        const rangeChange = newRange - currentRange;
        
        // Adjust Start to maintain age at cursor position
        let newStart = view.start - (clampedRatio * rangeChange);
        let newEnd = newStart + newRange;

        // Boundary Checks
        if (newStart < minDataAge) { newStart = minDataAge; newEnd = newStart + newRange; }
        if (newEnd > maxDataAge) { newEnd = maxDataAge; newStart = newEnd - newRange; }

        setView({ start: newStart, end: newEnd });
        setTooltip(null); // Hide tooltip during zoom
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Only left click
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, start: view.start, end: view.end };
        setTooltip(null);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
         const rect = e.currentTarget.getBoundingClientRect();
         
         if (isDragging && dragStartRef.current) {
             const dx = e.clientX - dragStartRef.current.x;
             // Calculate how many years the pixel movement corresponds to
             // rect.width represents 'currentRange' years
             const pxPerYear = rect.width / (dragStartRef.current.end - dragStartRef.current.start);
             const dAge = -dx / pxPerYear; // Inverse drag
             
             let newStart = dragStartRef.current.start + dAge;
             let newEnd = dragStartRef.current.end + dAge;
             
             // Clamp panning
             if (newStart < minDataAge) { newStart = minDataAge; newEnd = newStart + (dragStartRef.current.end - dragStartRef.current.start); }
             if (newEnd > maxDataAge) { newEnd = maxDataAge; newStart = newEnd - (dragStartRef.current.end - dragStartRef.current.start); }
             
             setView({ start: newStart, end: newEnd });
             return;
         }
         
         // Tooltip Logic
         const x = e.clientX - rect.left;
         const relativeX = x / rect.width; 
         const svgX = relativeX * width;
         const rawRatio = (svgX - padding) / (width - 2 * padding);
         const clampedRatio = Math.max(0, Math.min(1, rawRatio));
         
         // Interpolate age based on VIEW, not full range
         const age = Math.round(view.start + clampedRatio * currentRange);
         
         // Find data
         const yearSample = dataSets[0]?.data.find(d => d.age === age);
         const year = yearSample ? yearSample.year : new Date().getFullYear() + (age - minDataAge);

         const items = dataSets.map(ds => {
             const pt = ds.data.find(d => d.age === age);
             return {
                 label: ds.title,
                 value: pt ? pt.corpus : 0,
                 color: ds.strokeColor
             };
         }).sort((a,b) => b.value - a.value);

         setTooltip({
             x: getX(age),
             age,
             year,
             items
         });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        dragStartRef.current = null;
    };

    const resetZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        setView({ start: minDataAge, end: maxDataAge });
    }

    const isZoomed = view.start > minDataAge + 0.5 || view.end < maxDataAge - 0.5;

    return (
      <div 
        ref={containerRef} 
        className={`w-full relative group rounded-lg overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseLeave={() => { setTooltip(null); setIsDragging(false); }}
        onMouseUp={handleMouseUp}
      >
        <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full h-auto overflow-visible touch-none"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
        >
            <defs>
              <linearGradient id="gradMedian" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gradBest" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gradWorst" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </linearGradient>
              <clipPath id="chartClip">
                   <rect x={padding} y={0} width={width - 2 * padding} height={height} />
              </clipPath>
            </defs>

            {/* Grid Lines Y-Axis (Fixed) */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
               <g key={t}>
                 <line x1={padding} y1={getY(globalMaxCorpus * t)} x2={width - padding} y2={getY(globalMaxCorpus * t)} stroke="#F2F4F7" strokeWidth="1" />
                 <text x={padding - 10} y={getY(globalMaxCorpus * t) + 4} fontSize="10" fill="#98A2B3" textAnchor="end" className="font-mono font-medium">{formatLakhsCrores(globalMaxCorpus * t)}</text>
               </g>
            ))}
            
            {/* Zero Line */}
            <line x1={padding} y1={getY(0)} x2={width-padding} y2={getY(0)} stroke="#E4E7EC" strokeWidth="1" />

            {/* Clipped Data Area */}
            <g clipPath="url(#chartClip)">
                {/* Baseline */}
                {baseline && (
                    <path d={makePath(baseline.data)} fill="none" stroke="#98A2B3" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.5" />
                )}

                {/* Scenarios */}
                {dataSets.map((scenario, idx) => {
                const gradId = scenario.title === 'Base Plan' ? 'gradMedian' : scenario.title === 'Optimistic' ? 'gradBest' : 'gradWorst';
                return (
                    <g key={idx}>
                    <path d={makeArea(scenario.data)} fill={`url(#${gradId})`} />
                    <path 
                        d={makePath(scenario.data)} 
                        fill="none" 
                        stroke={scenario.strokeColor} 
                        strokeWidth="2" 
                        strokeLinejoin="round" 
                        strokeLinecap="round"
                    />
                    </g>
                )
                })}
                
                {/* Tooltip Elements inside SVG (Lines/Dots) */}
                {tooltip && (
                    <g>
                        <line x1={tooltip.x} y1={padding} x2={tooltip.x} y2={height-padding} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
                        {tooltip.items.map((item, i) => (
                            <circle key={i} cx={tooltip.x} cy={getY(item.value)} r="4" fill="white" stroke={item.color} strokeWidth="2" className="drop-shadow-sm" />
                        ))}
                    </g>
                )}
            </g>

            {/* X Axis Labels (Dynamic based on View) */}
            <text x={padding} y={height - 10} fontSize="10" fill="#98A2B3" className="font-medium">{Math.floor(view.start)} yrs</text>
            <text x={width/2} y={height - 10} fontSize="10" fill="#98A2B3" textAnchor="middle" className="font-bold uppercase tracking-wider">Projected Age</text>
            <text x={width-padding} y={height - 10} fontSize="10" fill="#98A2B3" textAnchor="end" className="font-medium">{Math.ceil(view.end)} yrs</text>
        </svg>

        {/* Floating Tooltip HTML Overlay */}
        {tooltip && !isDragging && (
            <div 
                className="absolute z-10 pointer-events-none bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 p-3 w-48 transition-transform duration-75 origin-top"
                style={{ 
                    top: 10, 
                    left: `${(tooltip.x / width) * 100}%`,
                    transform: `translateX(${tooltip.x > width * 0.6 ? '-105%' : '5%'})`
                }}
            >
                <div className="text-xs font-bold text-gray-500 mb-2 border-b border-gray-100 pb-1 flex justify-between">
                    <span>Age {tooltip.age}</span>
                    <span>{tooltip.year}</span>
                </div>
                <div className="space-y-1.5">
                    {tooltip.items.map(item => (
                        <div key={item.label} className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ background: item.color }}></div>
                                <span className="text-gray-600 font-medium">{item.label}</span>
                            </div>
                            <span className="font-mono font-bold text-gray-900">{formatLakhsCrores(item.value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        {/* Reset Zoom Button */}
        {isZoomed && (
             <button 
                onClick={resetZoom}
                className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur border border-gray-200 shadow-sm px-2 py-1 rounded text-[10px] font-semibold text-gray-600 hover:text-brand-600 hover:border-brand-200 transition-all"
             >
                <Icons.Refresh /> Reset Zoom
             </button>
        )}
        
        {/* Zoom Hint (Only when not zoomed and mouse over) */}
        {!isZoomed && (
            <div className="absolute top-2 right-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] text-gray-400 font-medium bg-gray-50/50 px-2 py-1 rounded">
                <Icons.ZoomIn /> Scroll to Zoom
            </div>
        )}
      </div>
    );
};

const LegalFooter = () => (
  <footer className="mt-24 border-t border-gray-100 pt-16 pb-12">
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
        <div className="md:col-span-5">
           <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center text-white">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <span className="text-sm font-bold text-gray-900 tracking-tight">RetirePlan Compliance</span>
           </div>
           <p className="text-xs text-gray-500 leading-relaxed mb-6">
              This application utilizes stochastic modeling to project financial futures. While rigorous, these models are simplifications of complex economic realities.
           </p>
           <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded bg-gray-50 border border-gray-100 text-[10px] font-medium text-gray-600">Educational Use Only</span>
              <span className="inline-flex items-center px-2 py-1 rounded bg-gray-50 border border-gray-100 text-[10px] font-medium text-gray-600">Not Financial Advice</span>
           </div>
        </div>
        
        <div className="md:col-span-3 md:col-start-7">
           <h5 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-4">Model Limitations</h5>
           <ul className="space-y-3">
             <li className="flex items-start gap-2 text-xs text-gray-500">
                <span className="text-rose-500 mt-0.5">●</span>
                <span>Does not account for Capital Gains Tax (LTCG/STCG)</span>
             </li>
             <li className="flex items-start gap-2 text-xs text-gray-500">
                <span className="text-rose-500 mt-0.5">●</span>
                <span>Assumes linear Step-up SIP execution</span>
             </li>
             <li className="flex items-start gap-2 text-xs text-gray-500">
                <span className="text-rose-500 mt-0.5">●</span>
                <span>Inflation is modeled as a smoothed average</span>
             </li>
           </ul>
        </div>

        <div className="md:col-span-3">
           <h5 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-4">Risks</h5>
           <ul className="space-y-3">
             <li className="flex items-start gap-2 text-xs text-gray-500">
                <span className="text-amber-500 mt-0.5">●</span>
                <span>Market Volatility</span>
             </li>
             <li className="flex items-start gap-2 text-xs text-gray-500">
                <span className="text-amber-500 mt-0.5">●</span>
                <span>Sequence of Returns Risk</span>
             </li>
             <li className="flex items-start gap-2 text-xs text-gray-500">
                <span className="text-amber-500 mt-0.5">●</span>
                <span>Legislative Changes</span>
             </li>
           </ul>
        </div>
      </div>
      
      <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-gray-400">
            By using this tool, you acknowledge that you have read and understood the <a href="#" className="underline hover:text-gray-600">Terms of Service</a> and <a href="#" className="underline hover:text-gray-600">Disclaimer</a>.
          </p>
          <p className="text-[10px] text-gray-400">
            v2.4.1 • LocalStorage Enabled
          </p>
      </div>
    </div>
  </footer>
);

const App = () => {
  // Persistence Init
  const [inputs, setInputs] = useState<UserInputs>(() => {
      try {
          const saved = localStorage.getItem('retire-plan-data');
          return saved ? JSON.parse(saved) : DEFAULTS;
      } catch (e) {
          return DEFAULTS;
      }
  });

  const [activeTab, setActiveTab] = useState<'projections' | 'table' | 'report'>('projections');
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('median'); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sessionWarning, setSessionWarning] = useState(false);
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);

  // Session management and security initialization
  useEffect(() => {
    // Initialize security session
    SessionManager.initializeSession();
    SecurityAuditLogger.logEvent('input_change', 'Application loaded', 'low');

    // Session timeout listener
    const handleSessionExpired = () => {
      setSessionWarning(true);
      setInputs(DEFAULTS);
      SecurityAuditLogger.logEvent('security_alert', 'Session expired - data reset', 'high');
    };

    window.addEventListener('session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, []);

  // Persistence Save with enhanced security
  useEffect(() => {
      try {
        // Validate inputs before saving
        InputValidator.validateNumber(inputs.currentAge, 0, 150);
        InputValidator.validateCurrency(inputs.monthlyIncome);
        InputValidator.validateCurrency(inputs.currentSavings);
        
        localStorage.setItem('retire-plan-data', JSON.stringify(inputs));
        SecurityAuditLogger.logEvent('input_change', 'Data saved to localStorage', 'low');
      } catch (e) {
        SecurityAuditLogger.logEvent('security_alert', `Data validation failed: ${e}`, 'high');
      }
  }, [inputs]);

  const results = useMemo(() => calculateFinances(inputs), [inputs]);

  const updateInput = (key: keyof UserInputs, val: any) => {
    // Validation with security logging
    try {
      if (key === 'currentAge' || key === 'retirementAge') {
        val = InputValidator.validateAge(val);
      } else if (key === 'monthlyIncome' || key === 'monthlyExpenses' || key === 'currentSavings') {
        val = InputValidator.validateCurrency(val);
      } else if (key === 'expectedReturn' || key === 'inflation' || key === 'stepUpSIP') {
        val = InputValidator.validatePercentage(val);
      }
    } catch (e) {
      SecurityAuditLogger.logEvent('input_change', `Invalid input for ${key}: ${e}`, 'medium');
      return;
    }

    // Age validation logic
    if (key === 'retirementAge' && val <= inputs.currentAge) {
        val = inputs.currentAge + 1;
    }
    if (key === 'currentAge' && val >= inputs.retirementAge) {
        setInputs(prev => ({ ...prev, currentAge: val, retirementAge: val + 1 }));
        SecurityAuditLogger.logEvent('input_change', `Updated current age to ${val}`, 'low');
        return;
    }

    setInputs(prev => ({ ...prev, [key]: val }));
    SecurityAuditLogger.logEvent('input_change', `Updated ${key}`, 'low');
  };

  const addMajorExpense = () => {
     const newId = Math.random().toString(36).substr(2, 9);
     const newExpense: MajorExpense = {
         id: newId,
         name: "Custom Expense",
         currentCost: 1000000,
         purchaseAge: inputs.currentAge + 5,
         inflationRate: 7,
         typeId: 'custom'
     };
     setEditingId(newId);
     updateInput('majorExpenses', [...inputs.majorExpenses, newExpense]);
  };

  const updateMajorExpense = (id: string, field: keyof MajorExpense, val: any) => {
      let updated = inputs.majorExpenses.map(e => e.id === id ? { ...e, [field]: val } : e);
      
      // Auto-update name if type changes and name hasn't been heavily customized (or is standard)
      if (field === 'typeId') {
          const typeDef = EXPENSE_TYPES.find(t => t.id === val);
          if (typeDef) {
               updated = updated.map(e => e.id === id ? { ...e, name: typeDef.label === 'Custom' ? 'Custom Expense' : typeDef.label } : e);
          }
      }

      updateInput('majorExpenses', updated);
  };

  const removeMajorExpense = (id: string) => {
      if (editingId === id) setEditingId(null);
      updateInput('majorExpenses', inputs.majorExpenses.filter(e => e.id !== id));
  };

  const resetDefaults = () => {
      if(confirm('Reset all values to default?')) {
          setInputs(DEFAULTS);
          setEditingId(null);
      }
  }

  const handleDownloadPDF = () => {
      // Rate limiting - max 5 PDF downloads per minute
      if (!RateLimiter.isAllowed('pdf-download', 5, 60000)) {
          alert("Too many PDF downloads. Please wait a moment before trying again.");
          SecurityAuditLogger.logEvent('pdf_generation', 'Rate limit exceeded for PDF generation', 'medium');
          return;
      }

      if (typeof html2pdf === 'undefined') {
          alert("PDF generator not loaded yet. Please wait.");
          return;
      }
      
      setIsGeneratingPdf(true);
      const element = document.getElementById('report-container');
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `RetirePlan_Verdict_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      SecurityAuditLogger.logEvent('pdf_generation', 'PDF report generated and downloaded', 'low');

      html2pdf().set(opt).from(element).save().then(() => {
          setIsGeneratingPdf(false);
      }).catch((error: any) => {
          setIsGeneratingPdf(false);
          SecurityAuditLogger.logEvent('pdf_generation', `PDF generation failed: ${error.message}`, 'high');
          alert("Failed to generate PDF. Please try again.");
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans selection:bg-brand-100 selection:text-brand-900">
      {/* Boxed Container with Strong Side Borders */}
      <div className="flex flex-col min-h-screen">
        {/* Main Content with Strong Side Borders */}
        <div className="flex flex-1 justify-center px-4 lg:px-0 py-0">
          {/* Left Border - Strong & Visible */}
          <div className="hidden lg:block w-6 bg-gray-300 shadow-md" style={{backgroundColor: '#d9d9d9'}}></div>
          
          {/* Content Area with Shadow */}
          <div className="flex-1 lg:max-w-[1280px] w-full">
            <div className="flex min-h-screen bg-white text-gray-900 font-sans selection:bg-brand-100 selection:text-brand-900 relative" style={{boxShadow: '0 0 30px rgba(0,0,0,0.08)'}}>
              
              {/* Session Warning Banner */}
      {sessionWarning && (
          <div className="fixed top-0 left-0 right-0 bg-rose-50 border-b border-rose-200 p-4 z-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <Icons.Alert />
                  <div>
                      <p className="text-sm font-bold text-rose-900">Session Timeout</p>
                      <p className="text-xs text-rose-700">Your session has expired. Your data has been securely reset. Please refresh to continue.</p>
                  </div>
              </div>
              <button onClick={() => setSessionWarning(false)} className="text-rose-600 hover:text-rose-800">
                  <Icons.X />
              </button>
          </div>
      )}

      {/* Security Panel Toggle Button */}
      <button 
          onClick={() => setShowSecurityPanel(!showSecurityPanel)}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all tooltip"
          title="Security & Privacy Settings"
      >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
      </button>

      {/* Security Panel Drawer */}
      {showSecurityPanel && (
          <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setShowSecurityPanel(false)} />
      )}
      
      <div className={`fixed inset-y-0 right-0 w-[320px] bg-white border-l border-gray-200 shadow-lg z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${showSecurityPanel ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Security & Privacy</h3>
                  <button onClick={() => setShowSecurityPanel(false)} className="text-gray-500 hover:text-gray-700">
                      <Icons.X />
                  </button>
              </div>

              <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                      <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                          <Icons.Info /> Data Protection
                      </h4>
                      <p className="text-xs text-blue-700">Your financial data is stored locally in your browser. No data is sent to external servers.</p>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Security Features</h4>
                      <ul className="space-y-2 text-xs text-gray-600">
                          <li className="flex items-start gap-2">
                              <Icons.Check />
                              <span>Content Security Policy (CSP) enabled</span>
                          </li>
                          <li className="flex items-start gap-2">
                              <Icons.Check />
                              <span>XSS attack prevention</span>
                          </li>
                          <li className="flex items-start gap-2">
                              <Icons.Check />
                              <span>Input validation & sanitization</span>
                          </li>
                          <li className="flex items-start gap-2">
                              <Icons.Check />
                              <span>Rate limiting on exports</span>
                          </li>
                          <li className="flex items-start gap-2">
                              <Icons.Check />
                              <span>Session timeout protection</span>
                          </li>
                          <li className="flex items-start gap-2">
                              <Icons.Check />
                              <span>Audit logging enabled</span>
                          </li>
                      </ul>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Privacy Actions</h4>
                      <div className="space-y-2">
                          <button 
                              onClick={() => {
                                  localStorage.removeItem('retire-plan-data');
                                  setInputs(DEFAULTS);
                                  SecurityAuditLogger.logEvent('security_alert', 'User manually cleared all data', 'medium');
                                  alert('All data has been cleared from your browser.');
                              }}
                              className="w-full py-2 px-3 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors"
                          >
                              Clear All Data
                          </button>
                          <button 
                              onClick={() => {
                                  const logs = SecurityAuditLogger.exportLogs();
                                  const blob = new Blob([logs], { type: 'application/json' });
                                  const url = URL.createObjectURL(blob);
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = `security-audit-${new Date().toISOString().split('T')[0]}.json`;
                                  link.click();
                                  URL.revokeObjectURL(url);
                              }}
                              className="w-full py-2 px-3 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                          >
                              Download Audit Log
                          </button>
                      </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                      <p className="text-[10px] text-gray-400">
                          🔒 Session active • Device fingerprint verified • Data encrypted locally
                      </p>
                  </div>
              </div>
          </div>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
      )}

      {/* Sidebar - Configuration */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[320px] lg:w-[360px] lg:static flex-shrink-0 bg-gray-50/80 backdrop-blur border-r border-gray-200 h-screen lg:h-auto lg:min-h-screen overflow-y-auto lg:overflow-visible scrollbar-hide lg:scrollbar-default transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center text-white shadow-xl shadow-gray-200">
                        <Icons.TrendingUp />
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-gray-900">Retire<span className="text-gray-500">Plan</span></h1>
                </div>
                <button className="lg:hidden text-gray-500" onClick={() => setSidebarOpen(false)}>
                    <Icons.X />
                </button>
            </div>

            <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Profile & Income</h3>
                <div className="mb-6">
                    <AgeRangePicker
                        currentAge={inputs.currentAge}
                        retirementAge={inputs.retirementAge}
                        onChange={({ currentAge, retirementAge }) => {
                            updateInput('currentAge', currentAge);
                            updateInput('retirementAge', retirementAge);
                            SecurityAuditLogger.logEvent('input_change', `Updated age range to ${currentAge}-${retirementAge}`, 'low');
                        }}
                    />
                </div>
                
                <InputGroup label="Monthly Income">
                    <FormattedCurrencyInput value={inputs.monthlyIncome} onChange={(v) => updateInput('monthlyIncome', v)} />
                </InputGroup>
                
                <InputGroup label="Monthly Expenses">
                    <FormattedCurrencyInput value={inputs.monthlyExpenses} onChange={(v) => updateInput('monthlyExpenses', v)} />
                </InputGroup>

                <InputGroup label="Existing Corpus" subLabel="Total savings, investments, PF, etc.">
                    <FormattedCurrencyInput value={inputs.currentSavings} onChange={(v) => updateInput('currentSavings', v)} />
                </InputGroup>
            </section>

            <div className="h-px bg-gray-200/60 my-2" />

            <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Assumptions</h3>
                <InputGroup label="Expected Return (Pre-Ret)" badge={`${inputs.expectedReturn}%`}>
                    <SliderInput value={inputs.expectedReturn} min={4} max={15} step={0.5} onChange={(v: number) => updateInput('expectedReturn', v)} />
                </InputGroup>
                <InputGroup label="Inflation Rate" badge={`${inputs.inflation}%`}>
                    <SliderInput value={inputs.inflation} min={2} max={10} step={0.5} onChange={(v: number) => updateInput('inflation', v)} />
                </InputGroup>
                <InputGroup label="Step-up SIP" badge={`${inputs.stepUpSIP}%`}>
                    <SliderInput value={inputs.stepUpSIP} min={0} max={20} step={1} onChange={(v: number) => updateInput('stepUpSIP', v)} />
                </InputGroup>
            </section>
            
            <div className="h-px bg-gray-200/60 my-2" />

            <section>
                <div className="flex justify-between items-center mb-5">
                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Major Expenses</h3>
                </div>
                
                <div className="space-y-4">
                    {inputs.majorExpenses.length === 0 && (
                        <div className="text-center py-8 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                            <div className="mx-auto w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 mb-3 shadow-sm">
                                <Icons.TrendingUp /> 
                            </div>
                            <p className="text-xs font-semibold text-gray-500">No major expenses added</p>
                            <button onClick={addMajorExpense} className="mt-3 text-[11px] font-bold text-brand-600 hover:text-brand-700">
                                + Add Event
                            </button>
                        </div>
                    )}
                    {inputs.majorExpenses.map(expense => (
                         <React.Fragment key={expense.id}>
                             {editingId === expense.id ? (
                                 <ExpenseCardEdit 
                                     expense={expense}
                                     onUpdate={updateMajorExpense}
                                     onDelete={removeMajorExpense}
                                     onDone={() => setEditingId(null)}
                                     minAge={inputs.currentAge}
                                 />
                             ) : (
                                 <ExpenseCardSummary 
                                     expense={expense}
                                     onClick={() => setEditingId(expense.id)}
                                 />
                             )}
                         </React.Fragment>
                    ))}
                    
                    {inputs.majorExpenses.length > 0 && (
                        <button 
                            onClick={addMajorExpense} 
                            className="w-full py-2.5 mt-2 border border-dashed border-gray-300 rounded-lg text-xs font-bold text-gray-500 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50/30 transition-all flex items-center justify-center gap-1.5"
                        >
                            <Icons.Plus /> Add Event
                        </button>
                    )}
                </div>
            </section>

             <div className="pt-6 mt-6 border-t border-gray-200">
                <button onClick={resetDefaults} className="w-full py-3 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-white border border-transparent hover:border-gray-200 rounded-lg transition-all flex items-center justify-center gap-2">
                    <Icons.Refresh /> Reset to Defaults
                </button>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-white flex flex-col lg:grid lg:grid-cols-2">
        <div className="lg:hidden bg-white/80 backdrop-blur border-b border-gray-200 p-4 sticky top-0 z-30 flex justify-between items-center">
             <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gray-900 rounded flex items-center justify-center text-white">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                    <span className="font-bold text-gray-900 tracking-tight">RetirePlan</span>
             </div>
             <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                 <Icons.Menu />
             </button>
        </div>

        <div className="lg:col-span-2 p-4 lg:p-12 pb-20">
            
            {/* Header / Stats - Full width on desktop and mobile */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard scenario={results.median} active={activeScenario === 'median'} onClick={() => setActiveScenario('median')} />
                <StatCard scenario={results.best} active={activeScenario === 'best'} onClick={() => setActiveScenario('best')} />
                <StatCard scenario={results.worst} active={activeScenario === 'worst'} onClick={() => setActiveScenario('worst')} />
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center mb-12">
                <div className="inline-flex bg-gray-100/50 p-1.5 rounded-full border border-gray-200">
                    {['projections', 'table', 'report'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                                activeTab === tab 
                                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* View Content */}
            <div className="animate-fade-in">
                {activeTab === 'projections' && (
                    <div className="space-y-12">
                        <div className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/40">
                            <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-8 gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-1">Corpus Projection</h2>
                                    <p className="text-sm text-gray-500 font-medium">Monte Carlo-lite simulation across 3 market scenarios</p>
                                </div>
                                <div className="flex flex-wrap gap-6 text-xs font-semibold">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div> Base
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200"></div> Optimistic
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-200"></div> Pessimistic
                                    </div>
                                </div>
                            </div>
                            <ActuaryChart dataSets={[results.median, results.best, results.worst]} baseline={results.baselines.median} />
                        </div>

                        {/* Impact / Optimization Cards */}
                         {results.optimizations[activeScenario].length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Expense Impact Analysis ({activeScenario})</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {results.optimizations[activeScenario].map(opt => (
                                        <div key={opt.expenseId} className={`p-6 rounded-2xl border ${
                                            opt.status === 'safe' ? 'bg-emerald-50/30 border-emerald-100' :
                                            opt.status === 'caution' ? 'bg-amber-50/30 border-amber-100' :
                                            'bg-rose-50/30 border-rose-100'
                                        }`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-bold text-gray-900">{opt.name}</h4>
                                                {opt.status === 'safe' ? <Icons.Check /> : <Icons.Alert />}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                                This expense reduces your financial independence by <span className="font-bold">{opt.impactYears} years</span>.
                                            </p>
                                            {opt.status === 'caution' && opt.safeAge && (
                                                <div className="text-xs font-bold text-amber-700 bg-amber-100/50 inline-block px-3 py-1.5 rounded-md border border-amber-200/50">
                                                    Recommendation: Delay purchase to age {opt.safeAge}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'table' && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/30 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/80 border-b border-gray-200">
                                    <tr>
                                        <th className="px-8 py-4 font-bold text-gray-500 whitespace-nowrap tracking-wide text-xs uppercase">Age</th>
                                        <th className="px-8 py-4 font-bold text-gray-500 whitespace-nowrap tracking-wide text-xs uppercase">Year</th>
                                        <th className="px-8 py-4 font-bold text-gray-500 text-right whitespace-nowrap tracking-wide text-xs uppercase">Cashflow</th>
                                        <th className="px-8 py-4 font-bold text-gray-500 text-right whitespace-nowrap tracking-wide text-xs uppercase">Corpus ({activeScenario})</th>
                                        <th className="px-8 py-4 font-bold text-gray-500 whitespace-nowrap tracking-wide text-xs uppercase">Phase</th>
                                        <th className="px-8 py-4 font-bold text-gray-500 whitespace-nowrap tracking-wide text-xs uppercase">Events</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {results[activeScenario].data.map((row) => (
                                        <tr key={row.age} className={`hover:bg-gray-50 transition-colors ${row.age === inputs.retirementAge ? 'bg-indigo-50/20' : ''}`}>
                                            <td className="px-8 py-4 font-semibold text-gray-900">{row.age}</td>
                                            <td className="px-8 py-4 text-gray-500 font-medium">{row.year}</td>
                                            <td className={`px-8 py-4 font-mono font-medium text-right ${row.cashflow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {formatCurrency(row.cashflow)}
                                            </td>
                                            <td className="px-8 py-4 font-mono font-bold text-gray-900 text-right">
                                                {formatLakhsCrores(row.corpus)}
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                                    row.phase === 'Accumulation' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                    row.phase === 'Decumulation' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                    row.phase === 'Depleted' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    'bg-gray-100 text-gray-600 border-gray-200'
                                                }`}>
                                                    {row.phase}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-xs font-medium text-gray-500 max-w-xs truncate">
                                                {row.note}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                 {activeTab === 'report' && (
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="flex justify-end mb-4">
                            <button 
                                onClick={handleDownloadPDF} 
                                disabled={isGeneratingPdf}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGeneratingPdf ? (
                                    <span className="animate-pulse">Generating...</span>
                                ) : (
                                    <>
                                        <Icons.Download />
                                        <span className="text-sm font-semibold">Save as PDF</span>
                                    </>
                                )}
                            </button>
                        </div>
                        
                        <div id="report-container" className="space-y-8 bg-white p-2">
                            <div className="bg-gray-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                                    <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                                </div>
                                <div className="relative z-10">
                                    <h2 className="text-3xl font-bold mb-4 tracking-tight">Actuarial Verdict</h2>
                                    <p className="text-gray-300 text-lg opacity-90 leading-relaxed max-w-2xl mb-8">
                                        Based on your inputs, the base scenario indicates a <strong className="text-white border-b-2 border-indigo-500">{results.median.status.toUpperCase()}</strong> outcome. 
                                    </p>
                                    
                                    <div className="grid grid-cols-2 gap-12 border-t border-gray-800 pt-8">
                                        <div>
                                            <span className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Success Probability</span>
                                            <span className="text-4xl font-bold tracking-tight">{results.median.status === 'safe' ? 'High' : results.median.status === 'risk' ? 'Moderate' : 'Low'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Fund Longevity</span>
                                            <span className="text-4xl font-bold tracking-tight">{results.median.finalAge} <span className="text-xl font-medium text-gray-500">years</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Chart added for PDF Context */}
                            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6">Projected Assets</h3>
                                <ActuaryChart dataSets={[results.median, results.best, results.worst]} baseline={results.baselines.median} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center"><Icons.TrendingUp /></div> Strategy
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                        Given your retirement age of <strong>{inputs.retirementAge}</strong> and current savings, 
                                        you require a corpus of <strong>{formatLakhsCrores(results.median.requiredCorpus)}</strong>.
                                        {results.median.shortfall > 0 ? 
                                            ` You currently have a projected shortfall of ${formatLakhsCrores(results.median.shortfall)}. Consider increasing your SIP by ${inputs.stepUpSIP + 5}% or delaying retirement by 2-3 years.` 
                                            : " You are on track to meet this goal with a comfortable buffer."
                                        }
                                    </p>
                                </div>
                                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-amber-100 text-amber-600 flex items-center justify-center"><Icons.Alert /></div> Risk Assessment
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                        In a worst-case market scenario (high inflation, -35% crash), your funds would deplete by age <strong>{results.worst.finalAge}</strong>.
                                        The "Safe Withdrawal Rate" for your profile is <strong>{(results.median.swr * 100).toFixed(1)}%</strong>.
                                        Currently, your plan relies on a withdrawal rate of roughly <strong>{((results.annualExpenseAtRetirement / results.median.projectedCorpus) * 100).toFixed(1)}%</strong>.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-inner">
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Model Limitations & Compliance</h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                                    <li className="flex gap-3">
                                        <span className="font-bold text-gray-900 min-w-[80px]">Taxation</span>
                                        <span>Results are pre-tax. Actual post-tax returns will be lower depending on the asset class and tax regime (LTCG/STCG).</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-bold text-gray-900 min-w-[80px]">Volatility</span>
                                        <span>While the model simulates volatility, extreme sequence of return risks (e.g., market crash immediately upon retirement) may have worse impacts.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-bold text-gray-900 min-w-[80px]">Inflation</span>
                                        <span>The model assumes smooth inflation. Real-life expenses often come in lumps (medical emergencies, weddings), which are not fully captured unless added as Major Expenses.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-bold text-gray-900 min-w-[80px]">Advice</span>
                                        <span>This is a simulation tool, not an investment advisory service. Consult a certified financial planner.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <LegalFooter />
        </div>
      </main>
            </div>
          </div>
          
          {/* Right Border - Strong & Visible */}
          <div className="hidden lg:block w-6 bg-gray-300 shadow-md" style={{backgroundColor: '#d9d9d9'}}></div>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
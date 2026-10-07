
import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import TypingTest from './components/TypingTest';
import ResultView from './components/ResultView';
import ThemeSelector from './components/ThemeSelector';
import { THEMES } from './constants';
import { TestSettings, TestResult } from './types';
import { AllocationDatabase } from '../../lib/gameDatabase';
import './App.css';

const MonkeyType: React.FC = () => {
  const [settings, setSettings] = useState<TestSettings>({
    theme: 'dark'
  });

  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [awardNotice, setAwardNotice] = useState('');

  const activeTheme = useMemo(() =>
    THEMES.find(t => t.id === settings.theme) || THEMES[0],
    [settings.theme]
  );

  useEffect(() => {
    document.body.style.backgroundColor = activeTheme.bgColor;
    document.body.style.color = activeTheme.subColor;
  }, [activeTheme]);

  const handleTestEnd = (result: TestResult) => {
    setTestResult(result);
    setIsTestRunning(false);

    try {
      const sessionRaw = localStorage.getItem('nexus_player_session');
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw);
        if (session?.teamId) {
          const res = AllocationDatabase.recordGameCompletion(
            session.teamId,
            'monkeytype',
            'Code Typer Mission',
            Math.round(result.wpm)
          );
          if (res.success) {
            setAwardNotice(`✅ MISSION ACCOMPLISHED! Terminal code verified for Team ${session.teamName || session.teamId}. Logged to central control.`);
          }
        }
      }
    } catch (e) {
      console.warn('MonkeyType score error:', e);
    }
  };

  const startTest = () => {
    setTestResult(null);
    setIsTestRunning(false);
  };

  const resetTest = () => {
    setTestResult(null);
    setIsTestRunning(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{ backgroundColor: activeTheme.bgColor, color: activeTheme.subColor }}
    >
      <Navbar
        theme={activeTheme}
        onToggleThemeSelector={() => setShowThemeSelector(!showThemeSelector)}
        isTestRunning={isTestRunning}
        onReset={resetTest}
      />

      <div className="max-w-5xl mx-auto w-full px-4 pt-2 flex items-center justify-between">
        <button
          onClick={() => window.location.replace('/player')}
          className="px-3 py-1 bg-neutral-900 border border-neutral-700 hover:border-neutral-500 rounded text-xs font-mono transition text-neutral-300"
        >
          ← Return to Player Terminal
        </button>
        {awardNotice && (
          <div className="bg-emerald-950 border border-emerald-500 text-emerald-200 px-3 py-1 rounded text-xs font-mono font-bold animate-pulse">
            {awardNotice}
          </div>
        )}
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-5xl mx-auto w-full">
        <div className="w-full">
          {testResult ? (
            <ResultView
              result={testResult}
              theme={activeTheme}
              onRestart={startTest}
            />
          ) : (
            <TypingTest
              theme={activeTheme}
              onTestEnd={handleTestEnd}
              isTestRunning={isTestRunning}
              setIsTestRunning={setIsTestRunning}
            />
          )}
        </div>
      </main>

      {showThemeSelector && (
        <ThemeSelector
          currentTheme={settings.theme}
          onSelect={(themeId) => {
            setSettings(prev => ({ ...prev, theme: themeId }));
            setShowThemeSelector(false);
          }}
          onClose={() => setShowThemeSelector(false)}
          theme={activeTheme}
        />
      )}

      <footer className="py-8 text-center text-xs opacity-50 flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-4 opacity-70">
          <span>Press <kbd className="bg-gray-700/20 px-1 rounded">Tab</kbd> + <kbd className="bg-gray-700/20 px-1 rounded">Enter</kbd> to restart</span>
          <span>&bull;</span>
          <span>MonkeyType v1.0</span>
        </div>
      </footer>
    </div>
  );
};

export default MonkeyType;

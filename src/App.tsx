/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FloorPlanModel } from './types/floorplan';
import { SAMPLE_BLUEPRINTS } from './services/sampleBlueprints';
import {
  getProjects,
  saveProject,
  deleteProject,
  duplicateProject,
} from './services/storageService';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { UploadScreen } from './components/UploadScreen';
import { AnalysisCorrectionScreen } from './components/AnalysisCorrectionScreen';
import { Workspace3D } from './components/Workspace3D';
import { ExportModal } from './components/ExportModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<
    'landing' | 'dashboard' | 'upload' | 'analysis' | 'viewer'
  >('landing');

  const [projects, setProjects] = useState<FloorPlanModel[]>(SAMPLE_BLUEPRINTS);
  const [activeProject, setActiveProject] = useState<FloorPlanModel | null>(null);
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Load projects from backend/localStorage on mount
  useEffect(() => {
    async function loadData() {
      const data = await getProjects();
      if (data && data.length > 0) {
        setProjects(data);
      }
    }
    loadData();
  }, []);

  // Handlers
  const handleSelectSample = (sample: FloorPlanModel) => {
    setActiveProject(sample);
    setCurrentScreen('viewer');
  };

  const handleOpenProject = (project: FloorPlanModel) => {
    setActiveProject(project);
    setCurrentScreen('viewer');
  };

  const handleEditProjectGeometry = (project: FloorPlanModel) => {
    setActiveProject(project);
    setCurrentScreen('analysis');
  };

  const handlePlanAnalyzed = async (plan: FloorPlanModel) => {
    const saved = await saveProject(plan);
    setActiveProject(saved);
    const updatedList = await getProjects();
    setProjects(updatedList);
    setCurrentScreen('analysis');
  };

  const handleUpdatePlan = async (updated: FloorPlanModel) => {
    setActiveProject(updated);
    const saved = await saveProject(updated);
    const all = await getProjects();
    setProjects(all);
  };

  const handleDuplicateProject = async (id: string) => {
    const duplicated = await duplicateProject(id);
    if (duplicated) {
      const all = await getProjects();
      setProjects(all);
    }
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    const all = await getProjects();
    setProjects(all);
    if (activeProject?.id === id) {
      setActiveProject(null);
      setCurrentScreen('dashboard');
    }
  };

  const handleRenameProject = async (id: string, newName: string) => {
    const target = projects.find((p) => p.id === id);
    if (target) {
      const updated = { ...target, name: newName };
      await saveProject(updated);
      const all = await getProjects();
      setProjects(all);
      if (activeProject?.id === id) {
        setActiveProject(updated);
      }
    }
  };

  const handleNewProject = () => {
    setCurrentScreen('upload');
  };

  const handleToggleUnit = () => {
    setUnit((prev) => (prev === 'metric' ? 'imperial' : 'metric'));
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col font-sans antialiased">
      {/* Navigation Header */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        hasActiveProject={Boolean(activeProject)}
        activeProjectName={activeProject?.name}
        unit={unit}
        onToggleUnit={handleToggleUnit}
        onNewProject={handleNewProject}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {currentScreen === 'landing' && (
          <LandingPage
            onStartUpload={() => setCurrentScreen('upload')}
            onOpenDashboard={() => setCurrentScreen('dashboard')}
            onLoadSample={handleSelectSample}
          />
        )}

        {currentScreen === 'dashboard' && (
          <Dashboard
            projects={projects}
            onOpenProject={handleOpenProject}
            onEditProjectGeometry={handleEditProjectGeometry}
            onDuplicateProject={handleDuplicateProject}
            onDeleteProject={handleDeleteProject}
            onRenameProject={handleRenameProject}
            onNewProject={handleNewProject}
            onExportProject={(p) => {
              setActiveProject(p);
              setIsExportModalOpen(true);
            }}
          />
        )}

        {currentScreen === 'upload' && (
          <UploadScreen
            onPlanAnalyzed={handlePlanAnalyzed}
            onCancel={() => setCurrentScreen(activeProject ? 'viewer' : 'dashboard')}
          />
        )}

        {currentScreen === 'analysis' && activeProject && (
          <AnalysisCorrectionScreen
            plan={activeProject}
            onUpdatePlan={handleUpdatePlan}
            onProceedTo3D={() => setCurrentScreen('viewer')}
            onBackToUpload={() => setCurrentScreen('upload')}
          />
        )}

        {currentScreen === 'viewer' && activeProject && (
          <Workspace3D
            plan={activeProject}
            onUpdatePlan={handleUpdatePlan}
            onBackToDashboard={() => setCurrentScreen('dashboard')}
            onBackToReview={() => setCurrentScreen('analysis')}
            unit={unit}
          />
        )}
      </main>

      {/* Modal for direct export from Dashboard */}
      {isExportModalOpen && activeProject && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          plan={activeProject}
        />
      )}
    </div>
  );
}

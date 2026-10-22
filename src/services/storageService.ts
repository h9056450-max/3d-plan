/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FloorPlanModel } from '../types/floorplan';
import { SAMPLE_BLUEPRINTS } from './sampleBlueprints';

const LOCAL_STORAGE_KEY = 'teju_ai_floorplan_projects';

export async function getProjects(): Promise<FloorPlanModel[]> {
  try {
    // Try backend first
    const res = await fetch('/api/projects');
    if (res.ok) {
      const data = await res.json();
      if (data.projects && data.projects.length > 0) {
        return data.projects;
      }
    }
  } catch (e) {
    console.warn('Backend projects fetch failed, using local storage fallback:', e);
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading localStorage projects:', err);
  }

  // If empty, return initial sample blueprints
  return SAMPLE_BLUEPRINTS;
}

export async function saveProject(project: FloorPlanModel): Promise<FloorPlanModel> {
  const updatedProject = {
    ...project,
    updatedAt: new Date().toISOString(),
  };

  // Save to backend
  try {
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProject),
    });
  } catch (e) {
    console.warn('Could not save to backend:', e);
  }

  // Save to localStorage
  try {
    const all = await getProjects();
    const idx = all.findIndex((p) => p.id === updatedProject.id);
    let newAll: FloorPlanModel[];
    if (idx >= 0) {
      newAll = [...all];
      newAll[idx] = updatedProject;
    } else {
      newAll = [updatedProject, ...all];
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newAll));
  } catch (e) {
    console.error('Failed to save in localStorage:', e);
  }

  return updatedProject;
}

export async function deleteProject(id: string): Promise<void> {
  try {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
  } catch (e) {
    console.warn('Backend delete failed:', e);
  }

  try {
    const all = await getProjects();
    const filtered = all.filter((p) => p.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete from localStorage:', e);
  }
}

export async function duplicateProject(id: string): Promise<FloorPlanModel | null> {
  const all = await getProjects();
  const source = all.find((p) => p.id === id);
  if (!source) return null;

  const duplicated: FloorPlanModel = {
    ...source,
    id: 'project-' + Date.now(),
    name: `${source.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return await saveProject(duplicated);
}

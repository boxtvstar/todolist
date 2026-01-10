import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, deleteField } from 'firebase/firestore';
import { View, Task, Category, Project, ProjectStatus, Memo, Reminder } from './types';
import { INITIAL_CATEGORIES, INITIAL_PROJECTS } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import ProjectsView from './components/ProjectsView';
import HistoryView from './components/HistoryView';
import LoginView from './components/LoginView';
import { useAuth } from './services/authContext';
import { db } from './services/firebase';
import {
  addTaskToDb,
  updateTaskInDb,
  deleteTaskFromDb,
  addProjectToDb,
  updateProjectInDb,
  deleteProjectFromDb,
  addCategoryToDb,
  addMemoToDb,
  updateMemoInDb,
  deleteMemoFromDb,
  deleteCategoryFromDb,
  addReminderToDb,
  updateReminderInDb,
  deleteReminderFromDb
} from './services/db';
import MemoView from './components/MemoView';
import ReminderView from './components/ReminderView';

const App: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [autoStartProjectCreation, setAutoStartProjectCreation] = useState(false);

  // Data states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // Orphan Category Cleanup
  const hasRunCleanup = React.useRef(false);

  useEffect(() => {
    if (!user || loading || hasRunCleanup.current) return;
    if (projects.length === 0 && tasks.length === 0 && categories.length === INITIAL_CATEGORIES.length) return; // Wait for data

    const timer = setTimeout(() => {
      if (hasRunCleanup.current) return;

      const initialIds = new Set(INITIAL_CATEGORIES.map(c => c.id));
      const usedCategoryIds = new Set<string>();

      projects.forEach(p => usedCategoryIds.add(p.categoryId));
      tasks.forEach(t => usedCategoryIds.add(t.categoryId));

      const orphans = categories.filter(c => !initialIds.has(c.id) && !usedCategoryIds.has(c.id));

      if (orphans.length > 0) {
        console.log("Cleaning up orphan categories:", orphans);
        orphans.forEach(c => deleteCategoryFromDb(c.id));
        setCategories(prev => prev.filter(c => !orphans.find(o => o.id === c.id)));
      }

      hasRunCleanup.current = true;
    }, 2000); // 2 second delay to wait for initial sync

    return () => clearTimeout(timer);
  }, [user, loading, categories, projects, tasks]);

  // Firestore Subscriptions
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setProjects([]);
      setMemos([]);
      setReminders([]);
      setCategories(INITIAL_CATEGORIES);
      return;
    }

    // Tasks Listener
    const qTasks = query(collection(db, "tasks"), where("userId", "==", user.uid));
    const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
      const taskData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(taskData);
    });

    // Projects Listener
    const qProjects = query(collection(db, "projects"), where("userId", "==", user.uid));
    const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
      const projectData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projectData);
    });

    // Memos Listener
    const qMemos = query(collection(db, "memos"), where("userId", "==", user.uid));
    const unsubscribeMemos = onSnapshot(qMemos, (snapshot) => {
      const memoData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Memo));
      setMemos(memoData);
    });

    // Reminders Listener
    const qReminders = query(collection(db, "reminders"), where("userId", "==", user.uid));
    const unsubscribeReminders = onSnapshot(qReminders, (snapshot) => {
      const reminderData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder));
      setReminders(reminderData);
    });

    // Categories Listener
    const qCategories = query(collection(db, "categories"), where("userId", "==", user.uid));
    const unsubscribeCategories = onSnapshot(qCategories, (snapshot) => {
      const customCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      // Merge initial categories with custom ones, removing duplicates if any
      const initialIds = new Set(INITIAL_CATEGORIES.map(c => c.id));
      const filteredCustom = customCategories.filter(c => !initialIds.has(c.id));
      setCategories([...INITIAL_CATEGORIES, ...filteredCustom]);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeProjects();
      unsubscribeCategories();
      unsubscribeMemos();
      unsubscribeReminders();
    };
  }, [user]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#0f1712] text-white">Loading...</div>;
  }

  if (!user) {
    return <LoginView />;
  }

  // Handlers wrapped with DB calls
  const addTask = async (title: string, categoryId: string, dueDate?: string) => {
    if (!user) return;
    try {
      const newTask: Task = {
        id: Date.now().toString(),
        title,
        completed: false,
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        categoryId,
        projectId: selectedProjectId || undefined,
        createdAt: new Date().toISOString(),
        subSteps: []
      };
      await addTaskToDb(user.uid, newTask);
    } catch (error: any) {
      console.error("Task add failed:", error);
      alert(`할 일 추가 실패: ${error.message}`);
    }
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      try {
        const newCompleted = !task.completed;
        await updateTaskInDb(id, {
          completed: newCompleted,
          completedAt: (newCompleted ? new Date().toISOString() : deleteField()) as any
        });
      } catch (error: any) {
        console.error("Task update failed:", error);
        alert(`상태 업데이트 실패: ${error.message}`);
      }
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      await updateTaskInDb(id, updates);
    } catch (error: any) {
      console.error("Task update failed:", error);
      alert(`할 일 수정 실패: ${error.message}`);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteTaskFromDb(id);
    } catch (error: any) {
      console.error("Task delete failed:", error);
      alert(`할 일 삭제 실패: ${error.message}`);
    }
  };

  const handleAddCategory = async (name: string) => {
    if (!user) return "";
    const id = name.toLowerCase().replace(/\s+/g, '-');
    if (categories.some(c => c.id === id)) return id;

    try {
      const newCat: Category = { id, name, icon: '📁' };
      await addCategoryToDb(user.uid, newCat);
      return id;
    } catch (error: any) {
      console.error("Category add failed:", error);
      alert(`카테고리 추가 실패: ${error.message}`);
      return "";
    }
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'progress' | 'status'>) => {
    if (!user) return;
    try {
      const newProject: Project = {
        ...projectData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        progress: 0,
        status: ProjectStatus.ON_TRACK,
        members: [] // default empty
      };
      await addProjectToDb(user.uid, newProject);
    } catch (error: any) {
      console.error("Project add failed:", error);
      alert(`프로젝트 추가 실패: ${error.message}`);
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      await updateProjectInDb(id, updates);
    } catch (error: any) {
      console.error("Project update failed:", error);
      alert(`프로젝트 수정 실패: ${error.message}`);
    }
  };

  const deleteProject = async (id: string) => {
    const projectToDelete = projects.find(p => p.id === id);
    try {
      await deleteProjectFromDb(id);
      if (selectedProjectId === id) setSelectedProjectId(null);

      // Check for unused custom category cleanup
      if (projectToDelete && projectToDelete.categoryId) {
        const catId = projectToDelete.categoryId;
        const isDefault = INITIAL_CATEGORIES.some(c => c.id === catId);

        if (!isDefault) {
          // Check if any other project uses this category
          const otherProjectsUse = projects.filter(p => p.id !== id).some(p => p.categoryId === catId);
          const tasksUse = tasks.some(t => t.categoryId === catId);

          if (!otherProjectsUse && !tasksUse) {
            try {
              await deleteCategoryFromDb(catId);
              setCategories(prev => prev.filter(c => c.id !== catId));
            } catch (err) {
              console.error("Failed to cleanup category:", err);
            }
          }
        }
      }

    } catch (error: any) {
      console.error("Project delete failed:", error);
      alert(`프로젝트 삭제 실패: ${error.message}`);
    }
  };

  const updateProjectProgress = async (id: string, delta: number) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      try {
        const nextProgress = Math.min(100, Math.max(0, project.progress + delta));
        await updateProjectInDb(id, { progress: nextProgress });
      } catch (error: any) {
        console.error("Progress update failed:", error);
        alert(`진행률 업데이트 실패: ${error.message}`);
      }
    }
  };

  const addMemo = async (title: string) => {
    if (!user) return "";
    const id = Date.now().toString();
    try {
      const newMemo: Memo = {
        id,
        title,
        content: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await addMemoToDb(user.uid, newMemo);
      return id;
    } catch (error: any) {
      console.error("Memo add failed:", error);
      alert(`메모 추가 실패: ${error.message}`);
      return "";
    }
  };

  const updateMemo = async (id: string, updates: Partial<Memo>) => {
    try {
      await updateMemoInDb(id, updates);
    } catch (error: any) {
      console.error("Memo update failed:", error);
    }
  };

  const deleteMemo = async (id: string) => {
    try {
      await deleteMemoFromDb(id);
    } catch (error: any) {
      console.error("Memo delete failed:", error);
      alert(`메모 삭제 실패: ${error.message}`);
    }
  };

  const saveReminder = async (reminderData: Omit<Reminder, 'createdAt' | 'userId'>) => {
    if (!user) return;
    try {
      if (reminders.some(r => r.id === reminderData.id)) {
        // Update
        await updateReminderInDb(reminderData.id, reminderData);
      } else {
        // Create
        const newReminder: Reminder = {
          ...reminderData,
          createdAt: new Date().toISOString(),
          userId: user.uid
        };
        await addReminderToDb(user.uid, newReminder);
      }
    } catch (error: any) {
      console.error("Reminder save failed:", error);
      alert("리마인더 저장 실패");
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      await deleteReminderFromDb(id);
    } catch (error: any) {
      console.error("Delete reminder failed:", error);
    }
  };

  const toggleReminder = async (id: string) => {
    if (!user) return;
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      const updates = {
        completed: !reminder.completed,
        completedAt: !reminder.completed ? new Date().toISOString() : deleteField()
      };
      try {
        await updateReminderInDb(id, updates);
      } catch (error) {
        console.error("Failed to toggle reminder", error);
      }
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileNav = (view: View) => {
    setActiveView(view);
    setSelectedProjectId(null);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden text-white bg-[#0f1712] relative">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="md:hidden absolute top-4 left-4 z-50 p-2 bg-[#0d1310]/80 rounded-lg border border-white/10 backdrop-blur-sm shadow-lg text-2xl"
      >
        ☰
      </button>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container - Responsive */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-[80%] max-w-[320px] bg-[#0d1310] transition-transform duration-300 transform shadow-2xl border-r border-white/5
        md:relative md:translate-x-0 md:w-[30%] md:max-w-none md:shadow-none md:z-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar
          activeView={activeView}
          setActiveView={handleMobileNav}
          categories={categories}
          projects={projects}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={(id) => { setSelectedProjectId(id); setMobileMenuOpen(false); }}
          tasks={tasks}
          onAddCategory={handleAddCategory}
          user={user}
          logout={logout}
          onStartNewProject={() => {
            setActiveView(View.PROJECTS);
            setAutoStartProjectCreation(true);
            setMobileMenuOpen(false);
          }}
        />
      </div>

      <main className="w-full md:w-[70%] flex flex-col min-w-0 bg-[#1c2621]">
        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-16 md:p-10 custom-scrollbar">
          <div className={`max-w-6xl mx-auto w-full ${activeView === View.MEMO ? 'h-full' : ''}`}>
            {activeView === View.DASHBOARD && (
              <Dashboard
                tasks={tasks}
                reminders={reminders}
                toggleTask={toggleTask}
                addTask={addTask}
                categories={categories}
                selectedProjectId={selectedProjectId}
                updateTask={updateTask}
                deleteTask={deleteTask}
                onNavigate={setActiveView}
              />
            )}
            {activeView === View.CALENDAR && (
              <CalendarView
                tasks={tasks}
                projects={projects}
                reminders={reminders}
                categories={categories}
                toggleTask={toggleTask}
                addTask={addTask}
              />
            )}
            {activeView === View.REMINDER && (
              <ReminderView
                reminders={reminders}
                saveReminder={saveReminder}
                deleteReminder={deleteReminder}
                toggleReminder={toggleReminder}
              />
            )}
            {activeView === View.PROJECTS && (
              <ProjectsView
                projects={projects}
                categories={categories}
                addProject={addProject}
                updateProject={updateProject}
                deleteProject={deleteProject}
                updateProgress={updateProjectProgress}
                onAddCategory={handleAddCategory}
                autoStartCreation={autoStartProjectCreation}
                setAutoStartCreation={() => setAutoStartProjectCreation(false)}
              />
            )}
            {activeView === View.HISTORY && (
              <HistoryView
                tasks={tasks}
                projects={projects}
                reminders={reminders}
                toggleTask={toggleTask}
                deleteTask={deleteTask}
                updateProject={updateProject}
                deleteProject={deleteProject}
                toggleReminder={toggleReminder}
                deleteReminder={deleteReminder}
              />
            )}
            {activeView === View.MEMO && (
              <MemoView
                memos={memos}
                addMemo={addMemo}
                updateMemo={updateMemo}
                deleteMemo={deleteMemo}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

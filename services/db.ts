import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    getDocs,
    setDoc,
    getDoc
} from "firebase/firestore";
import { db, storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Task, Project, Category, Memo, VideoNote, FavoriteSite } from "../types";

// Collections
const TASKS_COLLECTION = "tasks";
const PROJECTS_COLLECTION = "projects";
const CATEGORIES_COLLECTION = "categories";

// Tasks
export const fetchTasks = async (userId: string): Promise<Task[]> => {
    const q = query(collection(db, TASKS_COLLECTION), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
};

export const addTaskToDb = async (userId: string, task: Task) => {
    // We use setDoc with task.id if we want to preserve client-generated ID, 
    // or addDoc if we want auto-generated ID. 
    // Since the app generates IDs, we'll use setDoc.
    const { id, ...taskData } = task;
    // undefined 값을 제거 (Firestore는 undefined를 지원하지 않음)
    const validTaskData = Object.fromEntries(
        Object.entries(taskData).filter(([_, v]) => v !== undefined)
    );
    await setDoc(doc(db, TASKS_COLLECTION, id), { ...validTaskData, userId });
};

export const updateTaskInDb = async (taskId: string, updates: Partial<Task>) => {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await updateDoc(taskRef, updates);
};

export const deleteTaskFromDb = async (taskId: string) => {
    await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
};

// Projects
export const fetchProjects = async (userId: string): Promise<Project[]> => {
    const q = query(collection(db, PROJECTS_COLLECTION), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
};

export const addProjectToDb = async (userId: string, project: Project) => {
    const { id, ...projectData } = project;
    await setDoc(doc(db, PROJECTS_COLLECTION, id), { ...projectData, userId });
};

export const updateProjectInDb = async (projectId: string, updates: Partial<Project>) => {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(projectRef, updates);
};

export const deleteProjectFromDb = async (projectId: string) => {
    await deleteDoc(doc(db, PROJECTS_COLLECTION, projectId));
};

// Categories
export const fetchCategories = async (userId: string): Promise<Category[]> => {
    const q = query(collection(db, CATEGORIES_COLLECTION), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
};

export const addCategoryToDb = async (userId: string, category: Category) => {
    const { id, ...categoryData } = category;
    await setDoc(doc(db, CATEGORIES_COLLECTION, id), { ...categoryData, userId });
};

export const updateCategoryInDb = async (categoryId: string, updates: Partial<Category>) => {
    const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    await updateDoc(categoryRef, updates);
};

export const deleteCategoryFromDb = async (categoryId: string) => {
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
};

// Helper: Batch update or specialized queries can be added here

// Memos
const MEMOS_COLLECTION = "memos";



export const addMemoToDb = async (userId: string, memo: Memo) => {
    const { id, ...memoData } = memo;
    const validMemoData = Object.fromEntries(
        Object.entries(memoData).filter(([_, v]) => v !== undefined)
    );
    await setDoc(doc(db, MEMOS_COLLECTION, id), { ...validMemoData, userId });
};

export const updateMemoInDb = async (memoId: string, updates: Partial<Memo>) => {
    const memoRef = doc(db, MEMOS_COLLECTION, memoId);
    await updateDoc(memoRef, updates);
};

export const deleteMemoFromDb = async (memoId: string) => {
    await deleteDoc(doc(db, "memos", memoId));
};

// Reminders
export const addReminderToDb = async (userId: string, reminder: any) => {
    await setDoc(doc(db, "reminders", reminder.id), { ...reminder, userId });
};

export const updateReminderInDb = async (reminderId: string, updates: any) => {
    await updateDoc(doc(db, "reminders", reminderId), updates);
};

export const deleteReminderFromDb = async (reminderId: string) => {
    await deleteDoc(doc(db, "reminders", reminderId));
};

export const uploadMemoImage = async (file: File, userId: string): Promise<string> => {
    if (!storage) throw new Error("Storage not initialized");
    const storageRef = ref(storage, `memos/${userId}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
};

// Video Notes
export const addVideoNoteToDb = async (userId: string, videoNote: VideoNote) => {
    const { id, ...noteData } = videoNote;
    const validNoteData = Object.fromEntries(
        Object.entries(noteData).filter(([_, v]) => v !== undefined)
    );
    await setDoc(doc(db, "videoNotes", id), { ...validNoteData, userId });
};

export const updateVideoNoteInDb = async (noteId: string, updates: Partial<VideoNote>) => {
    const noteRef = doc(db, "videoNotes", noteId);
    await updateDoc(noteRef, updates);
};

export const deleteVideoNoteFromDb = async (noteId: string) => {
    await deleteDoc(doc(db, "videoNotes", noteId));
};

// Favorite Sites
export const addFavoriteSiteToDb = async (userId: string, site: FavoriteSite) => {
    const { id, ...siteData } = site;
    await setDoc(doc(db, "favoriteSites", id), { ...siteData, userId });
};

export const updateFavoriteSiteInDb = async (siteId: string, updates: Partial<FavoriteSite>) => {
    const siteRef = doc(db, "favoriteSites", siteId);
    await updateDoc(siteRef, updates);
};

export const deleteFavoriteSiteFromDb = async (siteId: string) => {
    await deleteDoc(doc(db, "favoriteSites", siteId));
};

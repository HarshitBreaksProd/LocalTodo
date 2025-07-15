"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Task = {
  id: number;
  text: string;
  completed: boolean;
  createdAt: number;
  completedAt: number | null;
};

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Clock = () => {
  const [time, setTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time to show HH:MM:SS
  const formattedTime = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <div className="text-base font-semibold text-neutral-400">
      {isClient ? formattedTime : "00:00:00"}
    </div>
  );
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [filter, setFilter] = useState("all");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTaskText, setEditingTaskText] = useState("");

  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem("tasks");
      if (storedTasks) {
        const tasksFromStorage: any[] = JSON.parse(storedTasks);
        const migratedTasks = tasksFromStorage.map((task) => ({
          ...task,
          createdAt: task.createdAt || Date.now(),
          completedAt: task.completedAt || (task.completed ? Date.now() : null),
        }));
        setTasks(migratedTasks);
      }
    } catch (error) {
      console.error("Failed to parse tasks from localStorage", error);
    }
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks, isInitialLoad]);

  const handleAddTask = () => {
    if (newTaskText.trim() === "") return;

    const newTask: Task = {
      id: Date.now(),
      text: newTaskText,
      completed: false,
      createdAt: Date.now(),
      completedAt: null,
    };

    setTasks([newTask, ...tasks]);
    setNewTaskText("");
  };

  const handleToggleComplete = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? Date.now() : null,
            }
          : task
      )
    );
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskText(task.text);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingTaskText("");
  };

  const handleSelectAll = () => {
    const allCompleted = filteredTasks.every((task) => task.completed);
    setTasks(
      tasks.map((task) => {
        if (filteredTasks.find((ft) => ft.id === task.id)) {
          return {
            ...task,
            completed: !allCompleted,
            completedAt: !allCompleted ? Date.now() : null,
          };
        }
        return task;
      })
    );
  };

  const handleSaveEdit = (id: number) => {
    if (editingTaskText.trim() === "") {
      handleDeleteTask(id);
    } else {
      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, text: editingTaskText } : task
        )
      );
    }
    handleCancelEdit();
  };

  const handleClearCompleted = () => {
    setTasks(tasks.filter((task) => !task.completed));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  return (
    <main className="flex min-h-screen flex-col items-center bg-neutral-950 text-neutral-50 font-mono p-4">
      <div className="w-full h-full flex flex-col flex-grow">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <h1 className="text-xl font-bold flex items-center gap-2">
            My Todo App
          </h1>
          <Clock />
        </header>

        <div className="flex flex-col flex-grow max-w-6xl w-full mx-auto pt-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a new task..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddTask();
                }
              }}
              className="flex-grow bg-neutral-900 border-none rounded-md px-3 py-2 text-sm text-neutral-50 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-700 transition-all"
            />
            <button
              onClick={handleAddTask}
              className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-50 font-semibold px-3 py-2 rounded-md transition-all whitespace-nowrap cursor-pointer hover:scale-105 transform"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Add</span>
            </button>
          </div>

          <div className="border-b border-neutral-900 my-6"></div>

          <div className="flex flex-col flex-grow h-0 min-h-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h2 className="text-base font-semibold">
                Tasks ({filteredTasks.length})
              </h2>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    filteredTasks.length > 0 &&
                    filteredTasks.every((task) => task.completed)
                  }
                  className="cursor-pointer min-h-4 min-w-4 max-h-4 max-w-4 rounded-xs appearance-none checked:appearance-auto bg-neutral-900 border border-neutral-600 focus:ring-green-500 focus:ring-offset-neutral-950 accent-green-500"
                />
                <p>Complete All</p>
              </div>
            </div>
            <div className="overflow-y-auto space-y-2 pr-2 h-full [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-neutral-900 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:hover:bg-neutral-700 [&::-webkit-scrollbar-thumb]:rounded-full">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="group relative flex items-center gap-3 p-3 rounded-md border border-neutral-900 transition-colors hover:border-neutral-700"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task.id)}
                    className="cursor-pointer min-h-4 min-w-4 max-h-4 max-w-4 rounded-xs appearance-none checked:appearance-auto bg-neutral-900 border border-neutral-600 text-green-500 focus:ring-green-500 focus:ring-offset-neutral-950 accent-green-500"
                  />
                  {editingTaskId === task.id ? (
                    <input
                      type="text"
                      value={editingTaskText}
                      onChange={(e) => setEditingTaskText(e.target.value)}
                      onBlur={() => handleSaveEdit(task.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(task.id);
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      className="flex-grow bg-transparent border-b border-neutral-700 focus:outline-none text-sm"
                      autoFocus
                    />
                  ) : (
                    <>
                      <div className="flex-grow">
                        <span
                          className={`cursor-pointer text-sm ${
                            task.completed
                              ? "line-through text-neutral-500"
                              : ""
                          }`}
                          onClick={() => handleStartEdit(task)}
                        >
                          {task.text}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500 gap-1 ml-auto whitespace-nowrap">
                        {task.completed && task.completedAt ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="flex items-center gap-1.5 cursor-pointer">
                                  <Check className="h-3 w-3 text-green-500" />
                                  {formatTimestamp(task.completedAt)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="flex flex-col gap-1 text-xs">
                                  <span>
                                    Created: {formatTimestamp(task.createdAt)}
                                  </span>
                                  <span>
                                    Completed:{" "}
                                    {formatTimestamp(task.completedAt)}
                                  </span>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span>{formatTimestamp(task.createdAt)}</span>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 px-2 py-1 h-full rounded-r-md pl-8 backdrop-blur-[0.5px] bg-linear-to-r from-transparent to-neutral-900">
                        <button
                          onClick={() => handleStartEdit(task)}
                          className="cursor-pointer text-neutral-400 hover:text-amber-500 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="cursor-pointer text-neutral-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="w-full text-center text-neutral-600 text-xs max-w-6xl mt-4 mx-auto space-y-2">
          <div className="border-b border-neutral-900"></div>
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-2">
            <div className="flex gap-3">
              <button
                onClick={() => setFilter("all")}
                className={`cursor-pointer hover:text-white transition-colors ${
                  filter === "all" ? "text-white" : ""
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`cursor-pointer hover:text-white transition-colors ${
                  filter === "active" ? "text-white" : ""
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`cursor-pointer hover:text-white transition-colors ${
                  filter === "completed" ? "text-white" : ""
                }`}
              >
                Completed
              </button>
            </div>
            <button
              onClick={handleClearCompleted}
              className="cursor-pointer hover:text-white transition-colors"
            >
              Clear Completed
            </button>
          </div>
          <div className="text-xs text-neutral-400 mt-4">
            Built for builders. No fluff, just results.
          </div>
        </footer>
      </div>
    </main>
  );
}

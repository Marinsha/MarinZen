import React from "react";
import TaskItem from "./TaskItem";

const TaskList = ({ tasks, onTaskToggle, accentColor }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="py-12 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-[2.5rem]">
        <p className="text-stone-400 italic">No tasks available for this category today.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          id={task.id}
          name={task.task_name}
          completed={task.completed}
          onToggle={onTaskToggle}
          accentColor={accentColor}
        />
      ))}
    </div>
  );
};

export default TaskList;

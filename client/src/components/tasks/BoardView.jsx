import TaskCard from "./TaskCard";

const BoardView = ({ tasks, status }) => {
  // Если фильтр по статусу применён – выводим задачи как раньше (в виде сетки)
  if (status) {
    return (
        <div className="w-full py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 2xl:gap-10">
          {tasks?.map((task, index) => (
              <TaskCard key={task._id || task.id || index} task={task} />
          ))}
        </div>
    );
  }

  // Если фильтр по статусу отсутствует – группируем задачи по stage
  const stages = [
    { title: 'К выполнению', key: 'todo' },
    { title: 'В работе', key: 'in progress' },
    { title: 'Выполнено', key: 'completed' },
  ];

  return (
      <div className="flex justify-between gap-4 mt-4">
        {stages.map((stage) => (
            <div key={stage.key} className="basis-1/3 space-y-4">
              {tasks
                  ?.filter((task) => task.stage === stage.key)
                  .map((task) => (
                      <TaskCard key={task._id || task.id} task={task} />
                  ))}
            </div>
        ))}
      </div>
  );
};

export default BoardView;
import {useEffect, useState} from "react";
import {FaList} from "react-icons/fa";
import {IoMdAdd} from "react-icons/io";
import {MdGridView} from "react-icons/md";
import {useParams, useSearchParams} from "react-router-dom";
import {Button, Loading, Table, Tabs, Title} from "../components";
import {AddTask, BoardView, TaskTitle} from "../components/tasks";
import {useGetAllTaskQuery} from "../redux/slices/api/taskApiSlice";
import {TASK_TYPE} from "../utils";
import {useSelector} from "react-redux";

const TABS = [
  { title: "Доска", icon: <MdGridView /> },
  { title: "Список", icon: <FaList /> },
];

const Tasks = () => {
  const params = useParams();
  const { user } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const [searchTerm] = useState(searchParams.get("search") || "");

  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);

  const status = params?.status || "";


  const { data, isLoading, refetch } = useGetAllTaskQuery({
    strQuery: status,
    isTrashed: "",
    search: searchTerm,
  });

  const statusMap = {
    "todo": "К выполнению",
    "in progress": "В работе",
    "completed": "Выполненые",
  };

  useEffect(() => {
    refetch();
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [open]);

  return isLoading ? (
    <div className='py-10'>
      <Loading />
    </div>
  ) : (
    <div className='w-full'>
      <div className='flex items-center justify-between mb-4'>
        <Title title={status ? `${statusMap[status.toLowerCase()] || status} задачи` : "задачи"} />

        {!status && user?.isAdmin && (
          <Button
            label='Создать задачу'
            icon={<IoMdAdd className='text-lg' />}
            className='flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md py-2 2xl:py-2.5'
            onClick={() => setOpen(true)}
          />
        )}
      </div>

      <div>
        <Tabs tabs={TABS} setSelected={setSelected}>
          {!status && (
            <div className='w-full flex justify-between gap-4 md:gap-x-12 py-4'>
              <TaskTitle label='К выполнению' className={TASK_TYPE.todo} />
              <TaskTitle
                label='В процессе'
                className={TASK_TYPE["in progress"]}
              />
              <TaskTitle label='Выполнено' className={TASK_TYPE.completed} />
            </div>
          )}

          {selected === 0 ? (
              <BoardView tasks={data?.tasks} status={status} />
          ) : (
              <Table tasks={data?.tasks} />
          )}
        </Tabs>
      </div>

      <AddTask
          open={open}
          setOpen={setOpen}
          onCreated={refetch}
      />
    </div>
  );
};

export default Tasks;

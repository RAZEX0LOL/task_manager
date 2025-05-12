import {Dialog} from "@headlessui/react";
import {getDownloadURL, getStorage, ref, uploadBytesResumable,} from "firebase/storage";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {BiImages} from "react-icons/bi";
import {toast} from "sonner";
import {useNavigate} from "react-router-dom";


import {
  useCreateTaskMutation,
  useSuggestTaskMutation,
  useUpdateTaskMutation,
} from "../../redux/slices/api/taskApiSlice";
import {dateFormatter} from "../../utils";
import {app} from "../../utils/firebase";
import Button from "../Button";
import Loading from "../Loading";
import ModalWrapper from "../ModalWrapper";
import SelectList from "../SelectList";
import Textbox from "../Textbox";
import UserList from "./UsersSelect";

const LISTS = ["TODO", "IN PROGRESS", "COMPLETED"];
const PRIORIRY = ["HIGH", "MEDIUM", "NORMAL", "LOW"];

const uploadedFileURLs = [];

const uploadFile = async (file) => {
  const storage = getStorage(app);

  const name = new Date().getTime() + file.name;
  const storageRef = ref(storage, name);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        console.log("Uploading");
      },
      (error) => {
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            uploadedFileURLs.push(downloadURL);
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      }
    );
  });
};

const AddTask = ({ open, setOpen, task }) => {
  const defaultValues = {
    title: task?.title || "",
    date: dateFormatter(task?.date || new Date()),
    team: [],
    stage: "",
    priority: "",
    assets: [],
    description: "",
    links: "",
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  const navigate = useNavigate();
  const [dupTasks, setDupTasks] = useState([]);
  const [isDupModalOpen, setIsDupModalOpen] = useState(false);
  const [stage, setStage] = useState(task?.stage?.toUpperCase() || LISTS[0]);
  const [team, setTeam] = useState(task?.team || []);
  const [priority, setPriority] = useState(
    task?.priority?.toUpperCase() || PRIORIRY[2]
  );
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [suggestTask] = useSuggestTaskMutation();
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const URLS = task?.assets ? [...task.assets] : [];

  const handleOnSubmit = async (data) => {
    const { title, description } = data;

    // 1. Вызов suggestTask: дубликаты, специализация, рекомендованный пользователь
    let duplicates = [], specialization = "", suggestedUser = null;
    try {
      const suggestion = await suggestTask({ title, description }).unwrap();
      ({ duplicates = [], specialization = "", suggestedUser = null } = suggestion);
    } catch (err) {
      console.error("Ошибка при получении suggestion:", err);
      // продолжаем без дубликатов и без предсказаний
    }

    // 2. Если найдены дубликаты — сохраняем их в стейт и показываем модалку
    if (Array.isArray(duplicates) && duplicates.length > 0) {
      setDupTasks(duplicates);
      setIsDupModalOpen(true);
      return; // не создаём задачу, пока пользователь не разберётся с дубликатами
    }

    // 3. Подставляем специализацию
    if (specialization) {
      setTaskType(specialization);
      toast.info(`Тип задачи: ${specialization.toUpperCase()}`);
    }

    // 4. Подставляем рекомендованного исполнителя
    if (suggestedUser) {
      setTeam([suggestedUser]);
      toast.info(`Рекомендованный исполнитель: ${suggestedUser.name}`);
    }

    // 5. Загрузка файлов (если есть)
    for (const file of assets) {
      setUploading(true);
      try {
        const url = await uploadFile(file);
        setUploadedFileURLs(prev => [...prev, url]);
      } catch (error) {
        console.error("Ошибка при загрузке файла:", error);
        setUploading(false);
        return; // прерываем, если загрузка не удалась
      }
      setUploading(false);
    }

    // 6. Сборка финального объекта и отправка create/update
    try {
      const payload = {
        ...data,
        type: taskType,
        assets: uploadedFileURLs,
        team,
        stage,
        priority,
      };
      const res = task
          ? await updateTask({ ...payload, _id: task._id }).unwrap()
          : await createTask(payload).unwrap();

      toast.success(res.message || "Задача сохранена");
      setTimeout(() => setOpen(false), 300);
    } catch (err) {
      console.error("Ошибка при сохранении задачи:", err);
      toast.error(err?.data?.message || err.error || "Не удалось сохранить задачу");
    }
  };

  const handleSelect = (e) => {
    setAssets(e.target.files);
  };

  return (
      <>
        <ModalWrapper open={open} setOpen={setOpen} onClose={()=>setOpen(false)}>
          <form onSubmit={handleSubmit(handleOnSubmit)}>
            <Dialog.Title
                as='h2'
                className='text-base font-bold leading-6 text-gray-200 mb-4'
            >
              {task ? "ОБНОВИТЬ ЗАДАЧУ" : "ДОБАВИТЬ ЗАДАЧУ"}
            </Dialog.Title>

            <div className='mt-2 flex flex-col gap-6'>
              <Textbox
                  placeholder='Название задачи'
                  type='text'
                  name='title'
                  label='Название'
                  className='w-full rounded'
                  register={register("title", {
                    required: "Название обязательно!",
                  })}
                  error={errors.title ? errors.title.message : ""}
              />
              <UserList setTeam={setTeam} team={team} />
              <div className='flex gap-4'>
                <SelectList
                    label='Этап задачи'
                    lists={LISTS}
                    selected={stage}
                    setSelected={setStage}
                />
                <SelectList
                    label='Уровень приоритета'
                    lists={PRIORIRY}
                    selected={priority}
                    setSelected={setPriority}
                />
              </div>
              <div className='flex gap-4'>
                <div className='w-full'>
                  <Textbox
                      placeholder='Дата'
                      type='date'
                      name='date'
                      label='Дата задачи'
                      className='w-full rounded'
                      register={register("date", {
                        required: "Дата обязательна!",
                      })}
                      error={errors.date ? errors.date.message : ""}
                  />
                </div>
                <div className='w-full flex items-center justify-center mt-4'>
                  <label
                      className='flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer my-4'
                      htmlFor='imgUpload'
                  >
                    <input
                        type='file'
                        className='hidden'
                        id='imgUpload'
                        onChange={(e) => handleSelect(e)}
                        accept='.jpg, .png, .jpeg'
                        multiple={true}
                    />
                    <BiImages />
                    <span>Добавить файлы</span>
                  </label>
                </div>
              </div>

              <div className='w-full'>
                <p>Описание задачи</p>
                <textarea
                    name='description'
                    {...register("description")}
                    className='w-full bg-transparent px-3 py-1.5 2xl:py-3 border border-gray-300
            dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700
            text-gray-200 dark:text-white outline-none text-base focus:ring-2
            ring-blue-300'
                ></textarea>
              </div>

              <div className='w-full'>
                <p>
                  Добавить ссылки,
                  <span className='text- text-gray-600'>
                  разделяя запятой (,)
                </span>
                </p>
                <textarea
                    name='links'
                    {...register("links")}
                    className='w-full bg-transparent px-3 py-1.5 2xl:py-3 border border-gray-300
            dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700
            text-gray-200 dark:text-white outline-none text-base focus:ring-2
            ring-blue-300'
                ></textarea>
              </div>
            </div>

            {isLoading || isUpdating || uploading ? (
                <div className='py-4'>
                  <Loading />
                </div>
            ) : (
                <div className='bg-stone-900 mt-6 mb-4 sm:flex sm:flex-row-reverse gap-4'>
                  <Button
                      label='Сохранить'
                      type='submit'
                      className='bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700  sm:w-auto'
                  />

                  <Button
                      type='button'
                      className='bg-stone-900 px-5 text-sm font-semibold text-gray-200 sm:w-auto'
                      onClick={() => setOpen(false)}
                      label='Отмена'
                  />
                </div>
            )}
          </form>
        </ModalWrapper>
        {isDupModalOpen && (
            <ModalWrapper
                open={true}
                onClose={() => setIsDupModalOpen(false)}
            >
              <div style={{ position: "relative", padding: 24 }}>
                <button
                    aria-label="Закрыть"
                    onClick={() => setIsDupModalOpen(false)}
                    style={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      background: "none",
                      border: "none",
                      fontSize: 20,
                      cursor: "pointer",
                      color: "#fff",
                    }}
                >
                  ×
                </button>

                {/* Заголовок */}
                <h3 style={{ marginTop: 0 }}>Найдено похожих задач</h3>
                <hr />

                <p>Похоже, такая задача уже существует. Можете перейти к ней:</p>
                <div style={{ maxHeight: 300, overflowY: "auto" }}>
                  {dupTasks.map((t) => (
                      <div
                          key={t._id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: 12,
                            marginBottom: 12,
                            border: "1px solid #555",
                            borderRadius: 4,
                          }}
                      >
                        <div>
                          <strong>{t.title}</strong>
                          <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>
                            {t.description?.slice(0, 100)}…
                          </div>
                        </div>
                        <button
                            onClick={() => {
                              navigate(`/task/${t._id}`);
                              setIsDupModalOpen(false);
                            }}
                            style={{
                              padding: "6px 12px",
                              cursor: "pointer",
                            }}
                        >
                          Перейти
                        </button>
                      </div>
                  ))}
                </div>

                {/* Закрыть внизу */}
                <div style={{ textAlign: "right", marginTop: 16 }}>
                  <button onClick={() => setIsDupModalOpen(false)}>
                    Закрыть
                  </button>
                </div>
              </div>
            </ModalWrapper>
        )}
      </>
  );

};

export default AddTask;

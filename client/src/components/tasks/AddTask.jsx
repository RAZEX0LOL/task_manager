import {Dialog} from "@headlessui/react";
import {getDownloadURL, getStorage, ref, uploadBytesResumable,} from "firebase/storage";
import {useRef, useState} from "react";
import {useForm} from "react-hook-form";
import {BiImages} from "react-icons/bi";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";


import {
  useCreateTaskMutation,
  useSuggestTaskMutation as useSuggestTaskAssignmentMutation,
  useUpdateTaskMutation
} from "../../redux/slices/api/taskApiSlice";
import {dateFormatter} from "../../utils";
import {app} from "../../utils/firebase";
import Button from "../Button";
import Loading from "../Loading";
import ModalWrapper from "../ModalWrapper";
import SelectList from "../SelectList";
import Textbox from "../Textbox";
import UserList from "./UsersSelect";
// вместо import ReactDOM from "react-dom";
import {createPortal} from "react-dom";

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

const AddTask = ({ open, setOpen, task, onCreated }) => {
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
    getValues,      // ← добавили сюда!
  } = useForm({ defaultValues });

  const navigate = useNavigate();
  const [dupTasks, setDupTasks] = useState([]);
  const [isDupModalOpen, setIsDupModalOpen] = useState(false);
  const [recommendedRole, setRecommendedRole] = useState("");
  const [assigneeSuggestions, setAssigneeSuggestions] = useState([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [stage, setStage] = useState(task?.stage?.toUpperCase() || LISTS[0]);
  const [team, setTeam] = useState(task?.team || []);
  const [priority, setPriority] = useState(
    task?.priority?.toUpperCase() || PRIORIRY[2]
  );
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isNoCandidatesModalOpen, setIsNoCandidatesModalOpen] = useState(false);

  const [suggestTaskAssignment] = useSuggestTaskAssignmentMutation();
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [manualAssignMode, setManualAssignMode] = useState(false);
  // вместо useRef внутри map
  const btnRefs = useRef({});                // там будут лежать DOM-ноды кнопок
  const [tooltipUser, setTooltipUser] = useState(null);
  const [tooltipPos, setTooltipPos]   = useState({ top: 0, left: 0 });
  const URLS = task?.assets ? [...task.assets] : [];

  // Запрещаем закрывать форму создания, если открыта внутренняя модалка
  // Блокируем закрытие внешней формы, если открыта любая внутренняя модалка
  const handleOuterSetOpen = (nextOpen) => {
    // nextOpen === false — пытались закрыть
    if (nextOpen === false &&
        !isDupModalOpen &&
        !isAssignModalOpen &&
        !isNoCandidatesModalOpen) {
      setOpen(false);
    }
  };

  // const handleOnSubmit = async (data) => {
  //   const { title, description } = data;
  //
  //   // Сброс предыдущего состояния
  //   setDupTasks([]);
  //   setRecommendedRole("");
  //   setAssigneeSuggestions([]);
  //
  //   try {
  //     // 1) Получаем предложение от сервера
  //     const suggestion = await suggestTaskAssignment({ title, description }).unwrap();
  //     const {
  //       duplicates = [],
  //       recommendedRole: roleFromServer = "",
  //       assigneeSuggestions: suggestions = []
  //     } = suggestion;
  //
  //     // 2) Если нашлись дубликаты — показываем их
  //     if (Array.isArray(duplicates) && duplicates.length > 0) {
  //       setDupTasks(duplicates);
  //       setIsDupModalOpen(true);
  //       return;
  //     }
  //
  //     // 3) Нет дубликатов — показываем модалку назначения
  //     setRecommendedRole(roleFromServer);
  //     setAssigneeSuggestions(suggestions);
  //     setIsAssignModalOpen(true);
  //
  //   } catch (err) {
  //     console.error("Ошибка при получении предложения назначения:", err);
  //     // 4) В случае ошибки запроса — можно сразу создавать задачу
  //     //    Либо показывать уведомление и закрывать форму:
  //     // await createTaskFlow(data);
  //   }
  // };

  // Внутри вашего компонента AddTask, до return:

// Функция сабмита формы
//   const handleOnSubmit = async (data) => {
//     const { title, description } = data;
//
//     // Сброс предыдущего состояния
//     setDupTasks([]);
//     setRecommendedRole("");
//     setAssigneeSuggestions([]);
//
//     try {
//       // 1) Получаем дубликаты и рекомендации
//       const suggestion = await suggestTaskAssignment({ title, description }).unwrap();
//       const {
//         duplicates = [],
//         recommendedRole: roleFromServer = "",
//         assigneeSuggestions: suggestions = []
//       } = suggestion;
//
//       // 2) Если нашлись дубликаты — показываем их и выходим
//       if (duplicates.length > 0) {
//         setDupTasks(duplicates);
//         setIsDupModalOpen(true);
//         return;
//       }
//
//       // 3) Если есть предложения — открываем модалку назначения
//       if (suggestions.length > 0) {
//         setRecommendedRole(roleFromServer);
//         setAssigneeSuggestions(suggestions);
//         setIsAssignModalOpen(true);
//         return;
//       }
//
//       // 4) Ни дубликатов, ни предложений — сразу создаём задачу
//       await finalizeCreate(data, []);
//
//     } catch (err) {
//       console.error("Ошибка при получении предложения назначения:", err);
//       // 5) В случае любой ошибки — создаём задачу без назначения
//       await finalizeCreate(data, []);
//     }
//   };

  // Функция сабмита формы
  const handleOnSubmit = async (data) => {
    const { title, description } = data;

    // Сброс предыдущего состояния
    setDupTasks([]);
    setRecommendedRole("");
    setAssigneeSuggestions([]);

    if (manualAssignMode) {
      setManualAssignMode(false);          // сбрасываем флаг
      await finalizeCreate(data, team);    // team содержит вручную выбранных
      return;
    }

    try {
      // 1) Получаем дубликаты и рекомендации
      const suggestion = await suggestTaskAssignment({ title, description }).unwrap();
      const {
        duplicates = [],
        noCandidates = false,
        recommendedRole: roleFromServer = "",
        assigneeSuggestions: suggestions = []
      } = suggestion;

      // 2) Если нашлись дубликаты — показываем их и выходим
      if (duplicates.length > 0) {
        setDupTasks(duplicates);
        setIsDupModalOpen(true);
        return;
      }

      // 3) Если сервер сигнализировал, что нет кандидатов — остаёмся в форме
      if (noCandidates) {
        // показываем модалку на 2 секунды, потом создаём задачу
        setIsNoCandidatesModalOpen(true);
        setTimeout(async () => {
          setIsNoCandidatesModalOpen(false);
          await finalizeCreate(data, []);
        }, 2000);
        return;
      }

      // 4) Если есть предложения — открываем модалку назначения
      if (suggestions.length > 0) {
        setRecommendedRole(roleFromServer);
        setAssigneeSuggestions(suggestions);
        setIsAssignModalOpen(true);
        return;
      }

      // 5) Ни дубликатов, ни предложений — сразу создаём задачу
      await finalizeCreate(data, []);

    } catch (err) {
      console.error("Ошибка при получении предложения назначения:", err);
      // 6) В случае любой ошибки — создаём задачу без назначения
      await finalizeCreate(data, []);
    }
  };

// Вспомогательная функция: загрузка файлов + вызов create/update
  const finalizeCreate = async (formData, selectedTeam) => {
    // 1) Загрузить файлы (если есть)
    for (const file of assets) {
      setUploading(true);
      try {
        const url = await uploadFile(file);
        setUploadedFileURLs(prev => [...prev, url]);
      } catch (err) {
        console.error("Ошибка при загрузке файла:", err);
        setUploading(false);
        toast.error("Не удалось загрузить файлы");
        return;
      }
      setUploading(false);
    }

    // 2) Сформировать payload
    const payload = {
      ...formData,
      type: recommendedRole || formData.type,
      assets: uploadedFileURLs,
      team: selectedTeam.length ? selectedTeam : team,
      stage,
      priority,
      links: formData.links,
    };

    // 3) Вызвать createTask или updateTask
    try {
      const res = task
          ? await updateTask({ ...payload, _id: task._id }).unwrap()
          : await createTask(payload).unwrap();
      toast.success(res.message || (task ? "Задача обновлена" : "Задача создана"));
      setOpen(false);
      onCreated && onCreated();
    } catch (err) {
      console.error("Ошибка при сохранении задачи:", err);
      toast.error(err?.data?.message || "Не удалось сохранить задачу");
    }
  };



  const handleSelect = (e) => {
    setAssets(e.target.files);
  };

  const handleAssign = async (user) => {
    setIsAssignModalOpen(false);
    const formData = getValues();
    await finalizeCreate(formData, [user]);
  };



  return (
      <>
        <ModalWrapper open={open} setOpen={handleOuterSetOpen}>
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
                      label='Дедлайн задачи'
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
        {/*{isDupModalOpen && (*/}
        {/*    <ModalWrapper*/}
        {/*        open={true}*/}
        {/*        onClose={() => setIsDupModalOpen(false)}*/}
        {/*    >*/}
        {/*      <div style={{ position: "relative", padding: 24 }}>*/}
        {/*        <button*/}
        {/*            aria-label="Закрыть"*/}
        {/*            onClick={() => setIsDupModalOpen(false)}*/}
        {/*            style={{*/}
        {/*              position: "absolute",*/}
        {/*              top: 16,*/}
        {/*              right: 16,*/}
        {/*              background: "none",*/}
        {/*              border: "none",*/}
        {/*              fontSize: 20,*/}
        {/*              cursor: "pointer",*/}
        {/*              color: "#fff",*/}
        {/*            }}*/}
        {/*        >*/}
        {/*          ×*/}
        {/*        </button>*/}

        {/*        /!* Заголовок *!/*/}
        {/*        <h3 style={{ marginTop: 0 }}>Найдено похожих задач</h3>*/}
        {/*        <hr />*/}

        {/*        <p>Похоже, такая задача уже существует. Можете перейти к ней:</p>*/}
        {/*        <div style={{ maxHeight: 300, overflowY: "auto" }}>*/}
        {/*          {dupTasks.map((t) => (*/}
        {/*              <div*/}
        {/*                  key={t._id}*/}
        {/*                  style={{*/}
        {/*                    display: "flex",*/}
        {/*                    justifyContent: "space-between",*/}
        {/*                    alignItems: "center",*/}
        {/*                    padding: 12,*/}
        {/*                    marginBottom: 12,*/}
        {/*                    border: "1px solid #555",*/}
        {/*                    borderRadius: 4,*/}
        {/*                  }}*/}
        {/*              >*/}
        {/*                <div>*/}
        {/*                  <strong>{t.title}</strong>*/}
        {/*                  <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>*/}
        {/*                    {t.description?.slice(0, 100)}…*/}
        {/*                  </div>*/}
        {/*                </div>*/}
        {/*                <button*/}
        {/*                    onClick={() => {*/}
        {/*                      navigate(`/task/${t._id}`);*/}
        {/*                      setIsDupModalOpen(false);*/}
        {/*                    }}*/}
        {/*                    style={{*/}
        {/*                      padding: "6px 12px",*/}
        {/*                      cursor: "pointer",*/}
        {/*                    }}*/}
        {/*                >*/}
        {/*                  Перейти*/}
        {/*                </button>*/}
        {/*              </div>*/}
        {/*          ))}*/}
        {/*        </div>*/}

        {/*        /!* Закрыть внизу *!/*/}
        {/*        <div style={{ textAlign: "right", marginTop: 16 }}>*/}
        {/*          <button onClick={() => setIsDupModalOpen(false)}>*/}
        {/*            Закрыть*/}
        {/*          </button>*/}
        {/*        </div>*/}
        {/*      </div>*/}
        {/*    </ModalWrapper>*/}
        {/*)}*/}


        {/* Модалка дубликатов */}
        {isDupModalOpen && (
            <ModalWrapper open onClose={() => setIsDupModalOpen(false)}>
              <div className="p-6 relative">
                <button
                    aria-label="Закрыть"
                    onClick={() => setIsDupModalOpen(false)}
                    className="absolute top-4 right-4 text-white text-xl"
                >×</button>
                <h3 className="text-lg font-bold mb-2">Найдено похожих задач</h3>
                <p className="mb-4">Похоже, такая задача уже существует. Можете перейти к ней:</p>
                <div className="max-h-64 overflow-y-auto space-y-4">
                  {dupTasks.map(t => (
                      <div key={t._id} className="flex justify-between items-center p-4 border border-gray-600 rounded">
                        <div>
                          <strong className="block text-white">{t.title}</strong>
                          <span className="text-gray-400 text-sm">{t.description?.slice(0, 100)}…</span>
                        </div>
                        <button
                            onClick={() => { navigate(`/task/${t._id}`); setIsDupModalOpen(false); }}
                            className="px-3 py-1 bg-blue-600 text-white rounded"
                        >Перейти</button>
                      </div>
                  ))}
                  <div className="text-right">
                    <button onClick={() => setIsDupModalOpen(false)} className="mt-2 text-blue-500">Закрыть</button>
                  </div>
                </div>
              </div>
            </ModalWrapper>
        )}

        {/* Модалка назначения исполнителя */}

        {/* Модалка назначения исполнителя */}
        {/*{isAssignModalOpen && (*/}
        {/*    <ModalWrapper open onClose={() => setIsAssignModalOpen(false)}>*/}
        {/*      <div className="p-6 relative">*/}
        {/*        /!* Кнопка закрытия *!/*/}
        {/*        <button*/}
        {/*            aria-label="Закрыть"*/}
        {/*            onClick={() => setIsAssignModalOpen(false)}*/}
        {/*            className="absolute top-4 right-4 text-white text-xl hover:text-gray-300"*/}
        {/*        >*/}
        {/*          ×*/}
        {/*        </button>*/}

        {/*        <h3 className="text-lg font-bold mb-2">*/}
        {/*          Роль: <span className="text-blue-400">{recommendedRole}</span>*/}
        {/*        </h3>*/}
        {/*        <p className="mb-4">Кому назначить задачу?</p>*/}
        {/*        <ul className="space-y-3">*/}
        {/*          {assigneeSuggestions.map((user) => (*/}
        {/*              <li key={user._id}>*/}
        {/*                <button*/}
        {/*                    type="button"*/}
        {/*                    className="w-full text-left px-4 py-2 border border-gray-600 rounded hover:bg-gray-700 transition"*/}
        {/*                    onClick={() => handleAssign(user)}*/}
        {/*                >*/}
        {/*                  {user.name} ({user.email}) — задач: {user.taskCount}*/}
        {/*                </button>*/}
        {/*              </li>*/}
        {/*          ))}*/}
        {/*        </ul>*/}
        {/*      </div>*/}
        {/*    </ModalWrapper>*/}
        {/*)}*/}


        {isAssignModalOpen && (
            <ModalWrapper open onClose={() => setIsAssignModalOpen(false)}>
              {/* Контейнер модалки, который глушит клики внутрь */}
              <div
                  onClick={e => e.stopPropagation()}
                  className="p-6 relative bg-gray-900 rounded"
                  style={{ overflow: "visible" }}
              >
                {/* Крестик закрытия */}
                <button
                    type="button"
                    aria-label="Закрыть"
                    onClick={e => {
                      e.stopPropagation();
                      setIsAssignModalOpen(false);
                    }}
                    className="absolute top-4 right-4 text-white text-2xl hover:text-gray-400"
                >
                  ×
                </button>

                <h3 className="text-xl font-semibold mb-2">
                  Роль: <span className="text-blue-400">{recommendedRole}</span>
                </h3>
                <p className="mb-4 text-gray-300">Кому назначить задачу?</p>

                <ul className="space-y-3">
                  {assigneeSuggestions.map(user => (
                      <li key={user._id} className="relative">
                        {/* Карточка пользователя */}
                        <button
                            ref={el => { btnRefs.current[user._id] = el; }}
                            type="button"
                            className="w-full text-left px-4 py-2 border border-gray-600 rounded hover:bg-gray-800 transition"
                            onMouseEnter={() => {
                              const rect = btnRefs.current[user._id].getBoundingClientRect();
                              setTooltipPos({
                                top:  rect.bottom + window.scrollY,
                                left: rect.left   + window.scrollX
                              });
                              setTooltipUser(user);
                            }}
                            onMouseLeave={() => setTooltipUser(null)}
                            onClick={e => {
                              e.stopPropagation();
                              handleAssign(user);
                            }}
                        >
                          {user.name} ({user.email}) — задач: {user.taskCount}
                        </button>
                      </li>
                  ))}
                </ul>

                {/* Tooltip через портал */}
                {tooltipUser && createPortal(
                    <div
                        style={{
                          position:       "absolute",
                          top:            tooltipPos.top,
                          left:           tooltipPos.left,
                          width:          300,
                          padding:        "0.75rem",
                          backgroundColor:"#1f2937",
                          color:          "#fff",
                          borderRadius:   "0.375rem",
                          boxShadow:      "0 10px 15px rgba(0,0,0,0.3)",
                          zIndex:         9999,
                        }}
                        onMouseEnter={() => setTooltipUser(tooltipUser)}
                        onMouseLeave={() => setTooltipUser(null)}
                    >
                      <p className="font-semibold mb-1">{tooltipUser.name}</p>
                      <p className="text-xs text-gray-400 mb-2">{tooltipUser.email}</p>
                      <p className="underline mb-1">Текущие задачи:</p>
                      <ul className="list-disc list-inside text-sm space-y-2 max-h-40 overflow-auto">
                        {tooltipUser.tasks.length > 0 ? (
                            tooltipUser.tasks.map(t => (
                                <li key={t._id} className="space-y-0.5">
                                  <div className="font-medium">{t.title}</div>
                                  <div className="text-xs text-gray-300">
                                    Приоритет: <span className="italic">{t.priority}</span>
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    Дедлайн:{" "}
                                    {t.date
                                        ? new Date(t.date).toLocaleDateString()
                                        : "—"}
                                  </div>
                                </li>
                            ))
                        ) : (
                            <li className="text-gray-400">Нет активных задач</li>
                        )}
                      </ul>
                    </div>,
                    document.body
                )}

                {/* Кнопка «Назначу сам» */}
                <div className="mt-6 text-right">
                  <button
                      type="button"
                      className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition"
                      onClick={e => {
                        e.stopPropagation();
                        setIsAssignModalOpen(false);
                        setManualAssignMode(true);
                      }}
                  >
                    Назначу сам
                  </button>
                </div>
              </div>
            </ModalWrapper>
        )}
        {isNoCandidatesModalOpen && (
            <ModalWrapper open onClose={() => setIsNoCandidatesModalOpen(false)}>
              <div className="p-6 text-center">
                <p className="text-lg">Нет рекомендаций по сотрудникам</p>
              </div>
            </ModalWrapper>
        )}
      </>
  );

};

export default AddTask;
